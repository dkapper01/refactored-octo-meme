import { getFormProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { invariantResponse } from '@epic-web/invariant'
import {
	json,
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
} from '@remix-run/node'
import {
	// Form,
	Link,
	useActionData,
	useLoaderData,
	useFetcher,
} from '@remix-run/react'
import { formatDistanceToNow, format } from 'date-fns'
import { useEffect, useState } from 'react'
import { toast as showToast } from 'sonner'
import { z } from 'zod'
// import { ErrorList } from '#app/components/forms.tsx'
import { Badge } from '#app/components/ui/badge.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { Card, CardContent } from '#app/components/ui/card.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { StatusButton } from '#app/components/ui/status-button.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import { combineAddress } from '#app/utils/combine-address.ts'
import { prisma } from '#app/utils/db.server.ts'
import { useIsPending } from '#app/utils/misc.tsx'
// import { requireUserWithPermission } from '#app/utils/permissions.server.ts'
// import { redirectWithToast } from '#app/utils/toast.server.ts'
import { useOptionalUser } from '#app/utils/user.ts'

const PLACEHOLDER_IMAGE =
	'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNODAgOTBIMTIwVjExMEg4MFY5MFoiIGZpbGw9IiM5Q0EzQUYiLz48cGF0aCBkPSJNNjUgNzBIMTM1VjEzMEg2NVY3MFoiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+'

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
			owner: {
				select: {
					username: true,
					name: true,
				},
			},
			location: {
				select: {
					id: true,
					name: true,
					street: true,
					city: true,
					state: true,
					zip: true,
					country: true,
				},
			},
			participants: {
				select: {
					userId: true,
					user: {
						select: {
							username: true,
							name: true,
							image: true,
						},
					},
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
		schema: JoinFormSchema.or(LeaveFormSchema),
	})

	if (submission.status !== 'success') {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	if (submission.value.intent === 'join-meetup') {
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
	const [imageError, setImageError] = useState(false)

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

	const hasJoined = user
		? data.meetup.participants.some((p) => p.userId === user.id)
		: false

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
				<div className="lg:col-span-2">
					<div className="relative h-[400px] overflow-hidden rounded-xl">
						<img
							src={
								imageError
									? PLACEHOLDER_IMAGE
									: `/resources/location-images/${data.meetup.location.id}`
							}
							alt={`${data.meetup.title} at ${data.meetup.location?.name}`}
							className="h-full w-full object-cover"
							onError={() => setImageError(true)}
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
						<div className="absolute bottom-0 left-0 p-6 text-white">
							<h1 className="mb-2 text-4xl font-bold">{data.meetup.title}</h1>
							<div className="flex items-center gap-4">
								<div className="flex items-center space-x-2">
									<Icon name="calendar" className="h-5 w-5" />
									<p className="text-lg">
										{format(
											new Date(data.meetup.startTime),
											'EEEE, MMMM d, yyyy h:mm a',
										)}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="lg:col-span-1">
					<Card>
						<CardContent className="p-6">
							<div className="space-y-6">
								<div>
									<div className="flex items-center justify-between">
										<span className="text-lg font-semibold">
											{data.meetup.participants.length} attendees
										</span>
										<Badge variant="secondary" className="text-sm font-medium">
											Open
										</Badge>
									</div>
									<div className="mt-4 flex items-center space-x-3 text-gray-600">
										<Icon name="avatar" className="h-5 w-5" />
										<span>
											Hosted by{' '}
											{data.meetup.owner.name || data.meetup.owner.username}
										</span>
									</div>
								</div>

								<div className="space-y-2">
									<h3 className="text-sm font-medium text-muted-foreground">
										Location
									</h3>
									<div className="flex items-start space-x-3 text-gray-600">
										<Icon
											name="map-pin"
											className="mt-1 h-5 w-5 flex-shrink-0"
										/>
										<div>
											<p className="font-medium">
												{data.meetup.location?.name}
											</p>
											<p className="text-sm text-muted-foreground">
												{data.meetup.location?.street}
											</p>
											<p className="text-sm text-muted-foreground">
												{data.meetup.location?.city},{' '}
												{data.meetup.location?.state}{' '}
												{data.meetup.location?.zip}
											</p>
										</div>
									</div>
									<Button
										variant="outline"
										className="mt-2 w-full"
										onClick={() => {
											const address = combineAddress({
												street: data.meetup.location.street,
												city: data.meetup.location.city,
												state: data.meetup.location.state,
												zip: data.meetup.location.zip,
											})
											window.open(
												`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
													data.meetup.location.name + ' ' + address,
												)}`,
												'_blank',
											)
										}}
									>
										<Icon
											name="arrow-top-right-on-square"
											className="mr-2 h-4 w-4"
										/>
										Open in Maps
									</Button>
								</div>

								{isOwner ? (
									<Button asChild variant="outline" className="w-full">
										<Link
											to={`/users/${user.username}/meetups/${data.meetup.id}/edit`}
										>
											<Icon name="pencil-1" className="mr-2 h-4 w-4" />
											Edit Meetup
										</Link>
									</Button>
								) : null}
								{user ? (
									hasJoined ? (
										<leaveFetcher.Form
											method="POST"
											{...getFormProps(leaveForm)}
										>
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
									)
								) : (
									<Button asChild variant="default" className="w-full">
										<Link to="/login">Login to Join</Link>
									</Button>
								)}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			<div className="mt-12">
				<div className="mb-8">
					<h2 className="mb-4 text-2xl font-bold">About this Meetup</h2>
					<p className="text-gray-600">{data.meetup.description}</p>
				</div>

				<div>
					<h2 className="mb-4 text-2xl font-bold">Participants</h2>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
						{data.meetup.participants.map((participant) => (
							<Link
								key={participant.userId}
								to={`/users/${participant.user.username}`}
								className="block"
							>
								<Card className="transition-all duration-200 hover:border-primary hover:shadow-md">
									<CardContent className="p-4">
										<div className="flex items-center space-x-3">
											<img
												src={`/resources/avatars/${participant.userId}`}
												alt={`${participant.user.name}'s avatar`}
												className="h-10 w-10 rounded-full border-2 border-gray-300 shadow-sm"
												onError={(e) => {
													e.currentTarget.src = PLACEHOLDER_IMAGE
												}}
											/>
											<span className="text-lg font-medium text-gray-800">
												{participant.user.name}
											</span>
										</div>
									</CardContent>
								</Card>
							</Link>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}
