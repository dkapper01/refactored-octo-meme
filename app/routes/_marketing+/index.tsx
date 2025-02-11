import { json, type MetaFunction } from '@remix-run/node'
import { NavLink, useLoaderData } from '@remix-run/react'
import { format } from 'date-fns'

import { Badge } from '#app/components/ui/badge.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { Card, CardContent, CardFooter } from '#app/components/ui/card.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { prisma } from '#app/utils/db.server.ts'

const PLACEHOLDER_IMAGE =
	'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNODAgOTBIMTIwVjExMEg4MFY5MFoiIGZpbGw9IiM5Q0EzQUYiLz48cGF0aCBkPSJNNjUgNzBIMTM1VjEzMEg2NVY3MFoiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+'

export const meta: MetaFunction = () => [{ title: 'Epic Notes' }]

export async function loader() {
	const [meetups, locations] = await Promise.all([
		prisma.meetup.findMany({
			select: {
				id: true,
				title: true,
				description: true,
				startTime: true,
				location: {
					select: {
						id: true,
						name: true,
						street: true,
						city: true,
						state: true,
						zip: true,
					},
				},
				owner: {
					select: {
						username: true,
						name: true,
					},
				},
			},
			orderBy: {
				startTime: 'desc',
			},
		}),
		prisma.location.findMany({
			select: {
				id: true,
				name: true,
				street: true,
				city: true,
				state: true,
				zip: true,
			},
		}),
	])
	return json({ meetups, locations })
}

export default function Index() {
	const data = useLoaderData<typeof loader>()

	const getStatusColor = (startTime: string) => {
		const now = new Date()
		const meetupTime = new Date(startTime)

		if (meetupTime < now) {
			return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
		}
		return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
	}

	return (
		<div className="relative flex flex-col text-gray-800">
			<main className="container fixed left-0 right-0 top-0 mt-20">
				<div className="flex gap-8">
					<div className="w-2/3">
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							{data.meetups.map((meetup) => (
								<NavLink
									key={meetup.id}
									to={`/users/${meetup.owner.username}/meetups/${meetup.id}`}
									prefetch="intent"
								>
									<Card className="h-full overflow-hidden transition-colors hover:border-primary">
										<div className="flex h-full">
											<div className="aspect-square w-1/3">
												<img
													src={`/resources/location-images/${meetup.location.id}`}
													alt={`${meetup.title} meetup at ${meetup.location.name}`}
													className="h-full w-full object-cover"
													onError={(e) => {
														e.currentTarget.src = PLACEHOLDER_IMAGE
													}}
												/>
											</div>
											<div className="flex flex-1 flex-col">
												<CardContent className="flex-1 p-4">
													<div className="flex items-center justify-between gap-4">
														<div className="flex items-center gap-2">
															<Icon
																name="calendar"
																className="h-4 w-4 text-muted-foreground"
															/>
															<h3 className="line-clamp-1 flex-1 font-semibold">
																{meetup.title}
															</h3>
														</div>
														<Badge className={getStatusColor(meetup.startTime)}>
															{format(new Date(meetup.startTime), 'MMM d')}
														</Badge>
													</div>
													<p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
														{meetup.description}
													</p>
												</CardContent>
												<CardFooter className="p-4 pt-0">
													<div className="flex w-full items-center justify-between">
														<div className="flex items-center gap-2">
															<Icon name="map-pin" className="h-4 w-4" />
															<span className="text-sm text-muted-foreground">
																{meetup.location.name}
															</span>
														</div>
														<div className="flex items-center gap-2">
															<Icon name="users" className="h-4 w-4" />
															<span className="text-sm text-muted-foreground">
																{meetup.owner.name || meetup.owner.username}
															</span>
														</div>
													</div>
												</CardFooter>
											</div>
										</div>
									</Card>
								</NavLink>
							))}
						</div>
					</div>
					<div className="w-1/3">
						<Card>
							<CardContent className="p-4">
								<h2 className="mb-4 text-xl font-bold">Locations</h2>
								<div className="space-y-4">
									{data.locations.map((location) => (
										<div
											key={location.id}
											className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
										>
											<div className="mt-1">
												<Icon
													name="building-storefront"
													className="h-5 w-5 text-muted-foreground"
												/>
											</div>
											<div>
												<h3 className="font-medium">{location.name}</h3>
												<p className="text-sm text-muted-foreground">
													{location.street}, {location.city}, {location.state}{' '}
													{location.zip}
												</p>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</main>
		</div>
	)
}
