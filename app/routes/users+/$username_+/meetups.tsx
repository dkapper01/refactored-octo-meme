// External packages
import { invariantResponse } from '@epic-web/invariant'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import {
	// Form,
	NavLink,
	Outlet,
	useLoaderData,
	useLocation,
	useParams,
} from '@remix-run/react'
// import { format } from 'date-fns'
// import { useState } from 'react'

// Internal components
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
// import { Badge } from '#app/components/ui/badge.tsx'
// import { Button } from '#app/components/ui/button.tsx'
// import { Card, CardContent, CardFooter } from '#app/components/ui/card.tsx'
import { Icon } from '#app/components/ui/icon.tsx'

// Utils
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
	// console.log(params)

	const currentMeetup = params.meetupId
		? data.owner.meetups.find((m) => m.id === params.meetupId)
		: null

	// const getStatusColor = (status: string) => {
	// 	switch (status) {
	// 		case 'upcoming':
	// 			return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
	// 		case 'in-progress':
	// 			return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
	// 		case 'completed':
	// 			return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
	// 		case 'cancelled':
	// 			return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
	// 		default:
	// 			return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
	// 	}
	// }

	return (
		<div className="mx-auto max-w-5xl">
			<nav className="mb-6">
				<ol className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
					<li>
						<NavLink
							to={`/users/${params.username}`}
							className="hover:text-gray-700 dark:hover:text-gray-300"
						>
							{data.owner.name || data.owner.username}
						</NavLink>
					</li>
					<li>
						<Icon name="chevron-right" className="h-4 w-4" />
					</li>
					<li>
						<NavLink
							to={`/users/${params.username}/meetups`}
							className="hover:text-gray-700 dark:hover:text-gray-300"
						>
							Meetups
						</NavLink>
					</li>
					{currentMeetup ? (
						<>
							<li>
								<Icon name="chevron-right" className="h-4 w-4" />
							</li>
							<li>
								<span className="text-gray-900 dark:text-gray-100">
									{isEdit ? 'Edit: ' : 'dadfdsf'}
									{currentMeetup.title}
								</span>
							</li>
						</>
					) : isNew ? (
						<>
							<li>
								<Icon name="chevron-right" className="h-4 w-4" />
							</li>
							<li>
								<span className="text-gray-900 dark:text-gray-100">
									New Meetup
								</span>
							</li>
						</>
					) : null}
				</ol>
			</nav>
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
