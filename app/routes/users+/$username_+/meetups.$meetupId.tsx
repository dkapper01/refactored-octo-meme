import { getFormProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { invariantResponse } from '@epic-web/invariant'
import {
	json,
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
} from '@remix-run/node'
import {
	Form,
	Link,
	useActionData,
	useLoaderData,
	useFetcher,
	// type MetaFunction,
} from '@remix-run/react'
import { formatDistanceToNow, format } from 'date-fns'
import { useEffect } from 'react'
import { toast as showToast } from 'sonner'
import { z } from 'zod'
// import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
// import { floatingToolbarClassName } from '#app/components/floating-toolbar.tsx'
import { ErrorList } from '#app/components/forms.tsx'
import { Badge } from '#app/components/ui/badge.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { StatusButton } from '#app/components/ui/status-button.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import {
	// getNoteImgSrc,
	useIsPending,
} from '#app/utils/misc.tsx'
import { requireUserWithPermission } from '#app/utils/permissions.server.ts'
import { redirectWithToast } from '#app/utils/toast.server.ts'
import { userHasPermission, useOptionalUser } from '#app/utils/user.ts'

// import { DeleteNote } from './notes.$noteId'
// import { type loader as notesLoader } from './notes.tsx'

export async function loader({ params }: LoaderFunctionArgs) {
	const meetup = await prisma.meetup.findUnique({
		where: { id: params.meetupId },
		select: {
			id: true,
			title: true,
			ownerId: true,
			description: true,
			updatedAt: true,
			startTime: true,
			location: true,
			participants: {
				select: {
					userId: true,
				},
			},
		},
	})

	invariantResponse(meetup, 'Not found', { status: 404 })

	const date = new Date(meetup.updatedAt)
	const timeAgo = formatDistanceToNow(date)

	return json({
		meetup,
		timeAgo,
	})
}

const DeleteFormSchema = z.object({
	intent: z.literal('delete-meetup'),
	meetupId: z.string(),
})

const JoinFormSchema = z.object({
	intent: z.literal('join-meetup'),
	meetupId: z.string(),
})

const LeaveFormSchema = z.object({
	intent: z.literal('leave-meetup'),
	meetupId: z.string(),
})

export async function action({ request }: ActionFunctionArgs) {
	const userId = await requireUserId(request)
	const formData = await request.formData()

	const submission = parseWithZod(formData, {
		schema: DeleteFormSchema.or(JoinFormSchema).or(LeaveFormSchema),
	})

	if (submission.status !== 'success') {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	if (submission.value.intent === 'delete-meetup') {
		const { meetupId } = submission.value

		const meetup = await prisma.meetup.findFirst({
			select: {
				id: true,
				ownerId: true,
				owner: { select: { username: true } },
			},
			where: { id: meetupId },
		})
		invariantResponse(meetup, 'Not found', { status: 404 })

		const isOwner = meetup.ownerId === userId
		await requireUserWithPermission(
			request,
			isOwner ? `delete:meetup:own` : `delete:meetup:any`,
		)

		await prisma.meetup.delete({ where: { id: meetup.id } })

		return redirectWithToast(`/users/${meetup.owner.username}/meetups`, {
			type: 'success',
			title: 'Success',
			description: 'Your meetup has been deleted.',
		})
	}

	if (submission.value.intent === 'join-meetup') {
		const { meetupId } = submission.value

		const meetup = await prisma.meetup.findFirst({
			select: { id: true, ownerId: true },
			where: { id: meetupId },
		})
		invariantResponse(meetup, 'Not found', { status: 404 })

		// Check if user is already joined
		const existingParticipant = await prisma.meetupParticipant.findFirst({
			where: {
				meetupId,
				userId,
			},
		})

		if (existingParticipant) {
			return json(
				{
					result: {
						status: 'error' as const,
						errors: ['You have already joined this meetup'],
					},
				},
				{ status: 400 },
			)
		}

		// Add user as participant
		await prisma.meetupParticipant.create({
			data: {
				meetupId,
				userId,
			},
		})

		return json(
			{ result: { status: 'success' as const, submission: submission.value } },
			{ status: 200 },
		)
	}

	if (submission.value.intent === 'leave-meetup') {
		const { meetupId } = submission.value

		const meetup = await prisma.meetup.findFirst({
			select: { id: true },
			where: { id: meetupId },
		})
		invariantResponse(meetup, 'Not found', { status: 404 })

		const existingParticipant = await prisma.meetupParticipant.findFirst({
			where: {
				meetupId,
				userId,
			},
		})

		if (!existingParticipant) {
			return json(
				{
					result: {
						status: 'error' as const,
						errors: ['You have not joined this meetup'],
					},
				},
				{ status: 400 },
			)
		}

		await prisma.meetupParticipant.delete({
			where: {
				meetupId_userId: {
					meetupId,
					userId,
				},
			},
		})

		return json(
			{ result: { status: 'success' as const, submission: submission.value } },
			{ status: 200 },
		)
	}
}

export default function MeetupRoute() {
	const data = useLoaderData<typeof loader>()
	const user = useOptionalUser()
	const isOwner = user?.id === data.meetup.ownerId
	const actionData = useActionData<typeof action>()
	const isPending = useIsPending()
	const joinFetcher = useFetcher()
	const leaveFetcher = useFetcher()

	useEffect(() => {
		if (
			joinFetcher.state === 'idle' &&
			joinFetcher.data &&
			typeof joinFetcher.data === 'object' &&
			'result' in joinFetcher.data &&
			joinFetcher.data.result &&
			typeof joinFetcher.data.result === 'object' &&
			'status' in joinFetcher.data.result &&
			joinFetcher.data.result.status === 'success'
		) {
			showToast.success('You have joined the meetup!')
		}
	}, [joinFetcher.state, joinFetcher.data])

	useEffect(() => {
		if (
			leaveFetcher.state === 'idle' &&
			leaveFetcher.data &&
			typeof leaveFetcher.data === 'object' &&
			'result' in leaveFetcher.data &&
			leaveFetcher.data.result &&
			typeof leaveFetcher.data.result === 'object' &&
			'status' in leaveFetcher.data.result &&
			leaveFetcher.data.result.status === 'success'
		) {
			showToast.success('You have left the meetup.')
		}
	}, [leaveFetcher.state, leaveFetcher.data])

	const [joinForm] = useForm({
		id: 'join-meetup',
		lastResult: actionData?.result,
	})

	const [leaveForm] = useForm({
		id: 'leave-meetup',
		lastResult: actionData?.result,
	})

	const canDelete = userHasPermission(
		user,
		isOwner ? `delete:meetup:own` : `delete:meetup:any`,
	)
	const displayBar = canDelete || isOwner

	const hasJoined = user
		? data.meetup.participants.some((p) => p.userId === user.id)
		: false

	return (
		<div>
			<div className="relative h-[30vh] overflow-hidden rounded-xl lg:h-[40vh]">
				<img
					src={`/resources/location-images/${data.meetup.location.id}`}
					alt="Meetup location"
					className="h-full w-full rounded-xl object-cover"
					onError={(e) => {
						e.currentTarget.src = '/placeholder.svg'
					}}
				/>
				<div className="absolute inset-0 flex items-end bg-black bg-opacity-50">
					<div className="mx-auto max-w-7xl px-4 py-12 text-white sm:px-6 lg:px-8">
						<h1 className="mb-4 text-4xl font-bold md:text-5xl lg:text-6xl">
							{data.meetup.title}
						</h1>
						<div className="flex items-center space-x-4 text-lg">
							<Icon name="calendar" className="h-6 w-6" />
							<span>
								{format(
									new Date(data.meetup.startTime),
									'EEEE, MMMM d, yyyy h:mm a',
								)}
							</span>
						</div>
					</div>
				</div>
			</div>

			<main className="flex-grow bg-gray-50">
				<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
						{/* Left Column */}
						<div className="space-y-8 lg:col-span-2">
							<section>
								<h2 className="mb-4 text-2xl font-semibold">
									About this Meetup
								</h2>
								<p className="text-gray-600">{data.meetup.description}</p>
							</section>

							<section>
								<h2 className="mb-4 text-2xl font-semibold">Location</h2>
								<div className="flex items-start space-x-3 text-gray-600">
									<Icon name="map-pin" className="mt-1 h-6 w-6 flex-shrink-0" />
									<span>{data.meetup.location?.name}</span>
								</div>
							</section>
						</div>

						{/* Right Column */}
						<div className="lg:col-span-1">
							<div className="space-y-6 rounded-lg bg-white p-6 shadow-sm">
								<div className="flex items-center justify-between">
									<span className="text-lg font-semibold">
										{data.meetup.participants.length} attendees
									</span>
									<Badge variant="secondary" className="text-sm font-medium">
										Open
									</Badge>
								</div>
								<div className="flex items-center space-x-3 text-gray-600">
									<Icon name="users" className="h-5 w-5" />
									<span>Hosted by Owner</span>
								</div>
								{isOwner ? (
									<Button asChild variant="outline" className="mb-4 w-full">
										<Link to="edit">
											<Icon name="pencil-1" className="mr-2 h-4 w-4" />
											Edit Meetup
										</Link>
									</Button>
								) : null}
								{hasJoined ? (
									<leaveFetcher.Form method="POST" {...getFormProps(leaveForm)}>
										<input
											type="hidden"
											name="meetupId"
											value={data.meetup.id}
										/>
										<StatusButton
											type="submit"
											name="intent"
											value="leave-meetup"
											variant="outline"
											status={isPending ? 'pending' : 'idle'}
											disabled={isPending}
											className="w-full rounded-lg border-2 border-blue-600 bg-white py-3 font-semibold text-blue-600 transition-colors duration-300 hover:bg-blue-50"
										>
											Leave Meetup
										</StatusButton>
									</leaveFetcher.Form>
								) : (
									<joinFetcher.Form method="POST" {...getFormProps(joinForm)}>
										<input
											type="hidden"
											name="meetupId"
											value={data.meetup.id}
										/>
										<StatusButton
											type="submit"
											name="intent"
											value="join-meetup"
											variant="default"
											status={isPending ? 'pending' : 'idle'}
											disabled={isPending}
											className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition-colors duration-300 hover:bg-blue-700"
										>
											Join Meetup
										</StatusButton>
									</joinFetcher.Form>
								)}
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	)
}

export function DeleteMeetup({ id }: { id: string }) {
	const actionData = useActionData<typeof action>()
	const isPending = useIsPending()
	const [form] = useForm({
		id: 'delete-meetup',
		lastResult: actionData?.result,
	})

	return (
		<Form method="POST" {...getFormProps(form)}>
			<input type="hidden" name="meetupId" value={id} />
			<StatusButton
				type="submit"
				name="intent"
				value="delete-meetup"
				variant="destructive"
				status={isPending ? 'pending' : (form.status ?? 'idle')}
				disabled={isPending}
				className="w-full max-md:aspect-square max-md:px-0"
			>
				<Icon name="trash" className="scale-125 max-md:scale-150">
					<span className="max-md:hidden">Delete</span>
				</Icon>
			</StatusButton>
			<ErrorList errors={form.errors} id={form.errorId} />
		</Form>
	)
}

// export const meta: MetaFunction<
// 	typeof loader,
// 	{ 'routes/users+/$username_+/notes': typeof notesLoader }
// > = ({ data, params, matches }) => {
// 	const notesMatch = matches.find(
// 		(m) => m.id === 'routes/users+/$username_+/notes',
// 	)
// 	const displayName = notesMatch?.data?.owner.name ?? params.username
// 	const noteTitle = data?.note.title ?? 'Note'
// 	const noteContentsSummary =
// 		data && data.note.content.length > 100
// 			? data?.note.content.slice(0, 97) + '...'
// 			: 'No content'
// 	return [
// 		{ title: `${noteTitle} | ${displayName}'s Notes | Epic Notes` },
// 		{
// 			name: 'description',
// 			content: noteContentsSummary,
// 		},
// 	]
// }

// export function ErrorBoundary() {
// 	return (
// 		<GeneralErrorBoundary
// 			statusHandlers={{
// 				403: () => <p>You are not allowed to do that</p>,
// 				404: ({ params }) => (
// 					<p>No note with the id "{params.meetupId}" exists</p>
// 				),
// 			}}
// 		/>
// 	)
// }
