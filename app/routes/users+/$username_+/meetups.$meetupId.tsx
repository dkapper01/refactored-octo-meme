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
	// type MetaFunction,
} from '@remix-run/react'
import { formatDistanceToNow, format } from 'date-fns'
import { z } from 'zod'
// import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { floatingToolbarClassName } from '#app/components/floating-toolbar.tsx'
import { ErrorList } from '#app/components/forms.tsx'
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

export async function action({ request }: ActionFunctionArgs) {
	const userId = await requireUserId(request)
	const formData = await request.formData()
	const submission = parseWithZod(formData, {
		schema: DeleteFormSchema,
	})
	if (submission.status !== 'success') {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	const { meetupId } = submission.value

	const meetup = await prisma.meetup.findFirst({
		select: { id: true, ownerId: true, owner: { select: { username: true } } },
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

export default function MeetupRoute() {
	const data = useLoaderData<typeof loader>()
	const user = useOptionalUser()
	const isOwner = user?.id === data.meetup.ownerId
	const canDelete = userHasPermission(
		user,
		isOwner ? `delete:meetup:any` : `delete:meetup:any`,
	)
	const displayBar = canDelete || isOwner

	return (
		<div className="relative flex flex-col">
			<div className="min-h-[500px] overflow-hidden rounded-2xl bg-white shadow-sm">
				<div className="relative h-48">
					<img
						// src={selectedMeetup.imageUrl}
						src={
							'https://images.unsplash.com/photo-1446226760091-cc85becf39b4?q=80&w=3474&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
						}
						// alt={selectedMeetup.location}
						className="h-48 w-full object-cover"
						// layout="fill"
						// objectFit="cover"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
					<div className="absolute bottom-0 left-0 p-6">
						<h2 className="mb-2 text-2xl font-bold text-white">
							{data.meetup.title}
						</h2>
						<div className="flex items-center text-sm text-white/90">
							<Icon name="calendar" className="mr-2 h-4 w-4" />
							<span>
								{format(new Date(data.meetup.startTime), 'MMMM d, yyyy')} at{' '}
								{format(new Date(data.meetup.startTime), 'h:mm a')}
							</span>
						</div>
					</div>
				</div>
				<div className="p-6">
					<div className="mb-4 flex items-center text-sm text-gray-600">
						<Icon name="map-pin" className="mr-2 h-5 w-5 text-primary" />
						<span>{data.meetup.location?.name}</span>
					</div>
					<p className="mb-6 text-gray-700">{data.meetup.title}</p>
				</div>
			</div>

			{displayBar ? (
				<div className={floatingToolbarClassName}>
					<span className="text-sm text-foreground/90 max-[524px]:hidden">
						<Icon name="clock" className="scale-125">
							{data.timeAgo} ago
						</Icon>
					</span>
					<div className="grid flex-1 grid-cols-2 justify-end gap-2 min-[525px]:flex md:gap-4">
						{canDelete ? <DeleteMeetup id={data.meetup.id} /> : null}
						{/* <DeleteNote id={data.meetup.id} /> */}
						<Button
							asChild
							className="min-[525px]:max-md:aspect-square min-[525px]:max-md:px-0"
						>
							<Link to="edit">
								<Icon name="pencil-1" className="scale-125 max-md:scale-150">
									<span className="max-md:hidden">Edit</span>
								</Icon>
							</Link>
						</Button>
					</div>
				</div>
			) : null}
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
