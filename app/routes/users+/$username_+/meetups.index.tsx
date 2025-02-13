// import { type MetaFunction } from '@remix-run/react'
// import { type loader as notesLoader } from './notes.tsx'
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
	NavLink,
	// Outlet,
	useActionData,
	useLoaderData,
	// useNavigation,
} from '@remix-run/react'
import { format } from 'date-fns'
import { z } from 'zod'
// import { useState } from 'react'
// import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { ErrorList } from '#app/components/forms.tsx'
import { Badge } from '#app/components/ui/badge.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { Card, CardContent, CardFooter } from '#app/components/ui/card.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { StatusButton } from '#app/components/ui/status-button.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { useIsPending } from '#app/utils/misc.tsx'
import { requireUserWithPermission } from '#app/utils/permissions.server.ts'
import { redirectWithToast } from '#app/utils/toast.server.ts'
import { useOptionalUser, userHasPermission } from '#app/utils/user.ts'
// import { toast } from 'sonner'

// type ActionError = {
// 	status: 'error'
// 	message: string
// }

const DeleteFormSchema = z.object({
	intent: z.literal('delete-meetup'),
	meetupId: z.string(),
})

export async function loader({ params }: LoaderFunctionArgs) {
	const owner = await prisma.user.findFirst({
		select: {
			id: true,
			name: true,
			username: true,
			image: { select: { id: true } },
			meetups: {
				select: {
					id: true,
					title: true,
					createdAt: true,
					startTime: true,
					location: true,
					description: true,
				},
				orderBy: {
					startTime: 'desc',
				},
			},
		},
		where: { username: params.username },
	})

	invariantResponse(owner, 'Owner not found', { status: 404 })

	return json({ owner })
}

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

function DeleteMeetup({ id }: { id: string }) {
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
				variant="ghost"
				size="sm"
				status={isPending ? 'pending' : (form.status ?? 'idle')}
				disabled={isPending}
				className="h-8 w-8 p-0 text-destructive hover:text-destructive/90"
			>
				<Icon name="trash" className="h-4 w-4" />
			</StatusButton>
			<ErrorList errors={form.errors} id={form.errorId} />
		</Form>
	)
}

export default function MeetupsIndexRoute() {
	const data = useLoaderData<typeof loader>()
	const user = useOptionalUser()

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'upcoming':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
			case 'in-progress':
				return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
			case 'completed':
				return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
			case 'cancelled':
				return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
		}
	}

	return (
		<div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
			{data.owner.meetups.map((meetup) => {
				const isOwner = user?.id === data.owner.id
				const canDelete = userHasPermission(
					user,
					isOwner ? `delete:meetup:own` : `delete:meetup:any`,
				)

				return (
					<Card
						key={meetup.id}
						className="cursor-pointer overflow-hidden border bg-white transition-all duration-300 hover:shadow-md dark:bg-gray-800"
					>
						<NavLink to={meetup.id}>
							<CardContent className="space-y-4 p-4">
								<div className="flex items-start justify-between">
									<div>
										<h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
											{meetup.title}
										</h3>
										<p className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
											{meetup.location?.name}
										</p>
									</div>
									<Badge className={`${getStatusColor('upcoming')} capitalize`}>
										Upcoming
									</Badge>
								</div>
								<div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
									<span className="flex items-center">
										<Icon name="calendar" className="mr-2 h-4 w-4" />
										{format(meetup.startTime, 'MMM d, h:mm a')}
									</span>
									<span className="flex items-center">
										<Icon name="users" className="mr-2 h-4 w-4" />
										3/4 going
									</span>
								</div>
							</CardContent>
						</NavLink>
						<CardFooter className="flex items-center justify-between bg-gray-50 p-3 dark:bg-gray-700">
							<div className="flex items-center">
								<Icon name="star" className="mr-2 h-4 w-4 text-yellow-500" />
								<span className="text-sm capitalize text-yellow-500 dark:text-gray-400">
									Hosted
								</span>
							</div>
							<div className="flex gap-2">
								<NavLink to={`${meetup.id}/edit`}>
									<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
										<Icon
											name="pencil-1"
											className="h-4 w-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
										/>
									</Button>
								</NavLink>
								{canDelete ? <DeleteMeetup id={meetup.id} /> : null}
							</div>
						</CardFooter>
					</Card>
				)
			})}
		</div>
	)
}

// export const meta: MetaFunction<
// 	null,
// 	{ 'routes/users+/$username_+/notes': typeof notesLoader }
// > = ({ params, matches }) => {
// 	const notesMatch = matches.find(
// 		(m) => m.id === 'routes/users+/$username_+/notes',
// 	)
// 	const displayName = notesMatch?.data?.owner.name ?? params.username
// 	const noteCount = notesMatch?.data?.owner.notes.length ?? 0
// 	const notesText = noteCount === 1 ? 'note' : 'notes'
// 	return [
// 		{ title: `${displayName}'s Notes | Epic Notes` },
// 		{
// 			name: 'description',
// 			content: `Checkout ${displayName}'s ${noteCount} ${notesText} on Epic Notes`,
// 		},
// 	]
// }
