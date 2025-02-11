import { invariantResponse } from '@epic-web/invariant'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { format } from 'date-fns'
import { useState } from 'react'
import { Badge } from '#app/components/ui/badge.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { Card, CardContent } from '#app/components/ui/card.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { combineAddress } from '#app/utils/combine-address.ts'
import { prisma } from '#app/utils/db.server.ts'

const PLACEHOLDER_IMAGE =
	'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNODAgOTBIMTIwVjExMEg4MFY5MFoiIGZpbGw9IiM5Q0EzQUYiLz48cGF0aCBkPSJNNjUgNzBIMTM1VjEzMEg2NVY3MFoiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+'

export async function loader({ params }: LoaderFunctionArgs) {
	const location = await prisma.location.findUnique({
		where: { id: params.locationId },
		select: {
			id: true,
			name: true,
			street: true,
			city: true,
			state: true,
			zip: true,
			country: true,
			meetups: {
				where: {
					startTime: {
						gte: new Date(),
					},
				},
				orderBy: {
					startTime: 'asc',
				},
				select: {
					id: true,
					title: true,
					description: true,
					startTime: true,
					owner: {
						select: {
							username: true,
							name: true,
						},
					},
					participants: {
						select: {
							userId: true,
						},
					},
				},
			},
		},
	})

	invariantResponse(location, 'Location not found', { status: 404 })

	return json({ location })
}

export default function LocationRoute() {
	const data = useLoaderData<typeof loader>()
	const [imageError, setImageError] = useState(false)

	const openInMaps = () => {
		const address = combineAddress({
			street: data.location.street,
			city: data.location.city,
			state: data.location.state,
			zip: data.location.zip,
		})
		window.open(
			`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
				data.location.name + ' ' + address,
			)}`,
			'_blank',
		)
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
				<div className="lg:col-span-2">
					<div className="relative h-[400px] overflow-hidden rounded-xl">
						<img
							src={
								imageError
									? PLACEHOLDER_IMAGE
									: `/resources/location-images/${data.location.id}`
							}
							alt={data.location.name}
							className="h-full w-full object-cover"
							onError={() => setImageError(true)}
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
						<div className="absolute bottom-0 left-0 p-6 text-white">
							<h1 className="mb-2 text-4xl font-bold">{data.location.name}</h1>
							<div className="flex items-center space-x-2">
								<Icon name="map-pin" className="h-5 w-5" />
								<p className="text-lg">
									{combineAddress({
										street: data.location.street,
										city: data.location.city,
										state: data.location.state,
										zip: data.location.zip,
									})}
								</p>
							</div>
						</div>
					</div>
				</div>

				<div className="lg:col-span-1">
					<Card>
						<CardContent className="p-6">
							<h2 className="mb-4 text-xl font-semibold">Location Details</h2>
							<div className="space-y-4">
								<div>
									<h3 className="text-sm font-medium text-muted-foreground">
										Address
									</h3>
									<p className="mt-1">{data.location.street}</p>
									<p>
										{data.location.city}, {data.location.state}{' '}
										{data.location.zip}
									</p>
									<p>{data.location.country}</p>
								</div>
								<Button
									variant="outline"
									className="w-full"
									onClick={openInMaps}
								>
									<Icon
										name="arrow-top-right-on-square"
										className="mr-2 h-4 w-4"
									/>
									Open in Maps
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			<div className="mt-12">
				<h2 className="mb-6 text-2xl font-bold">Upcoming Meetups</h2>
				{data.location.meetups.length > 0 ? (
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						{data.location.meetups.map((meetup) => (
							<Link
								key={meetup.id}
								to={`/meetup/${meetup.id}`}
								className="block"
							>
								<Card className="h-full transition-all duration-200 hover:border-primary hover:shadow-md">
									<CardContent className="p-6">
										<div className="mb-4 flex items-center justify-between">
											<h3 className="text-lg font-semibold">{meetup.title}</h3>
											<Badge variant="secondary">
												{format(new Date(meetup.startTime), 'MMM d')}
											</Badge>
										</div>
										<p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
											{meetup.description}
										</p>
										<div className="flex items-center justify-between text-sm">
											<div className="flex items-center space-x-2">
												<Icon name="users" className="h-4 w-4" />
												<span>
													{meetup.participants.length}{' '}
													{meetup.participants.length === 1
														? 'attendee'
														: 'attendees'}
												</span>
											</div>
											<div className="flex items-center space-x-2">
												<Icon name="avatar" className="h-4 w-4" />
												<span>
													{meetup.owner.name || meetup.owner.username}
												</span>
											</div>
										</div>
									</CardContent>
								</Card>
							</Link>
						))}
					</div>
				) : (
					<Card>
						<CardContent className="p-6 text-center text-muted-foreground">
							No upcoming meetups at this location.
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	)
}
