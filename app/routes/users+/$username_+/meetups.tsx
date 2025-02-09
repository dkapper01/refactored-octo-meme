import { invariantResponse } from '@epic-web/invariant'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import {
	Form,
	NavLink,
	Outlet,
	useLoaderData,
	useLocation,
	useParams,
} from '@remix-run/react'
import { format } from 'date-fns'
// import { useState } from 'react'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { Badge } from '#app/components/ui/badge.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { Card, CardContent, CardFooter } from '#app/components/ui/card.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { prisma } from '#app/utils/db.server.ts'

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

export default function MeetupsRoute() {
	const data = useLoaderData<typeof loader>()
	const location = useLocation()
	const params = useParams()

	const isNew = location.pathname.endsWith('/new')
	const isEdit = location.pathname.includes('/edit')
	const currentMeetupId = location.pathname.split('/').filter(Boolean).pop()

	const currentMeetup = data.owner.meetups.find((m) => m.id === currentMeetupId)

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
		<div className="container p-6">
			<nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
				<NavLink
					to=""
					className={({ isActive }) =>
						isActive && !isNew && !isEdit ? 'font-medium text-foreground' : ''
					}
				>
					Meetups
				</NavLink>
				{(isNew || isEdit) && (
					<>
						<Icon name="chevron-right" className="h-4 w-4" />
						<span className="font-medium text-foreground">
							{isNew ? 'New Meetup' : (currentMeetup?.title ?? 'Edit Meetup')}
						</span>
					</>
				)}
			</nav>

			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-2xl font-bold">
					{isNew ? 'Create Meetup' : isEdit ? 'Edit Meetup' : 'Your Meetups'}
				</h1>
				{!isNew && !isEdit && (
					<NavLink to="new">
						<Button>
							<Icon name="plus" className="mr-2 h-4 w-4" />
							New Meetup
						</Button>
					</NavLink>
				)}
			</div>

			<Outlet />
		</div>
	)
}

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				404: ({ params }) => (
					<p>No user with the username "{params.username}" exists</p>
				),
			}}
		/>
	)
}
