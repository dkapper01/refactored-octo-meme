import { type MetaFunction, json } from '@remix-run/node'
import { Link, useLoaderData, useLocation } from '@remix-run/react'
import { Icon } from '#app/components/ui/icon.tsx'

import { prisma } from '#app/utils/db.server.ts'

export const meta: MetaFunction = () => [{ title: 'Epic Notes' }]

export async function loader() {
	const meetups = await prisma.meetup.findMany()
	return json({ meetups })
}

export default function Explore() {
	const location = useLocation()

	const data = useLoaderData<typeof loader>()

	return (
		<div className="relative flex flex-col text-gray-800">
			<main className="container flex flex-1 flex-col items-center justify-center">
				<div className="mt-5 flex w-full rounded-lg bg-white p-2 shadow-sm">
					<Link
						to="/"
						className={`flex items-center gap-2 rounded-md px-4 py-2 transition-colors ${
							location.pathname === '/'
								? 'bg-blue-500 text-white'
								: 'text-gray-600 hover:bg-gray-100'
						}`}
					>
						<Icon name="map" size="lg" />
						<span>Map</span>
					</Link>
					<Link
						to="/explore"
						className={`ml-2 flex items-center gap-2 rounded-md px-4 py-2 transition-colors ${
							location.pathname === '/explore'
								? 'bg-blue-500 text-white'
								: 'text-gray-600 hover:bg-gray-100'
						}`}
					>
						<Icon name="magnifying-glass" size="lg" />
						<span>Explore</span>
					</Link>
				</div>
				<div className="mt-5 h-full w-full border">
					{data.meetups.map((meetup) => (
						<div
							key={meetup.id}
							className="group rounded-xl bg-white p-4 shadow-sm transition-all hover:shadow-md"
						>
							<div className="mb-4 flex items-center justify-between">
								<button
									// onClick={onClick}
									className="flex items-center gap-3 transition-opacity hover:opacity-80"
								>
									<img
										src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${meetup.ownerId}`}
										// alt={meetup.hostName}
										className="h-12 w-12 rounded-full"
									/>
									<div>
										<div className="font-medium text-gray-900">
											{/* {meetup.hostName} */}
											Host name
										</div>
										{/* {hostFeedback.length > 0 && (
											<div className="flex items-center gap-1 text-yellow-500">
												<Star className="h-4 w-4" />
												<span className="text-sm">{hostRating.toFixed(1)}</span>
												<span className="text-sm text-gray-500">
													({hostFeedback.length})
												</span>
											</div>
										)} */}
									</div>
								</button>
								<div className="flex items-center gap-2 text-gray-500">
									{/* <Users className="h-4 w-4" /> */}
									{/* <span>{meetup.participants.length + 1}</span> */}
									<span>1</span>
								</div>
							</div>

							<div className="mb-4 space-y-3">
								<div className="flex items-center gap-2 text-gray-600">
									{/* <MapPin className="h-5 w-5" /> */}
									{/* <span>{meetup.location.name}</span> */}
									<span>Location</span>
								</div>
								<div className="flex items-center gap-2 text-gray-600">
									{/* <Clock className="h-5 w-5" /> */}
									{/* <span>
										Until {new Date(meetup.endTime).toLocaleTimeString()}
									</span> */}
									<span>Time</span>
								</div>
							</div>

							<p className="mb-4 line-clamp-2 text-gray-700">
								{meetup.description}
								{/* Description */}
							</p>

							<div className="flex flex-wrap gap-2">
								{/* {meetup.tags.map((tag) => (
									<span
										key={tag}
										className="rounded-full bg-blue-50 px-2.5 py-1 text-sm text-blue-600"
									>
										#{tag}
									</span>
								))} */}
								<span className="rounded-full bg-blue-50 px-2.5 py-1 text-sm text-blue-600">
									#tag
								</span>
							</div>
						</div>
					))}
				</div>
			</main>
		</div>
	)
}
