import { invariantResponse } from '@epic-web/invariant'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { NavLink, Outlet, useLoaderData } from '@remix-run/react'
import { format } from 'date-fns'
import { useState } from 'react'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { Badge } from '#app/components/ui/badge.tsx'
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
		<div className="container flex min-h-[600px] flex-col space-y-6 p-6 lg:flex-row lg:space-x-6 lg:space-y-0">
			<div className="w-full lg:w-1/2">
				<div className="space-y-4">
					{data.owner.meetups.map((meetup) => (
						<NavLink key={meetup.id} to={meetup.id} className="block">
							<Card className="cursor-pointer overflow-hidden border bg-white transition-all duration-300 hover:shadow-md dark:bg-gray-800">
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
										<Badge
											className={`${getStatusColor('upcoming')} capitalize`}
										>
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
								<CardFooter className="flex items-center justify-between bg-gray-50 p-3 dark:bg-gray-700">
									<div className="flex items-center">
										<Icon
											name="star"
											className="mr-2 h-4 w-4 text-yellow-500"
										/>
										<span className="text-sm capitalize text-yellow-500 dark:text-gray-400">
											Hosted
										</span>
									</div>
								</CardFooter>
							</Card>
						</NavLink>
					))}
				</div>
			</div>
			<div className="w-full lg:w-1/2">
				<Outlet />
			</div>
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
