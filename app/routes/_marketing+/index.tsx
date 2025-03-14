import { json, type MetaFunction } from '@remix-run/node'
import {
	NavLink,
	useLoaderData,
	useNavigate,
	useSearchParams,
	Link,
} from '@remix-run/react'
import { format, isFuture, isPast } from 'date-fns'
import { useEffect, useState } from 'react'
import { useOptionalUser, useUser, userHasRole } from '#app/utils/user.ts'

import { Avatar, AvatarFallback, AvatarImage } from '#app/components/ui/avatar'
import { Badge } from '#app/components/ui/badge.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { Card, CardContent } from '#app/components/ui/card.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '#app/components/ui/tooltip'
import { prisma } from '#app/utils/db.server.ts'
import { getUserImgSrc } from '#app/utils/misc.tsx'

const PLACEHOLDER_IMAGE =
	'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNODAgOTBIMTIwVjExMEg4MFY5MFoiIGZpbGw9IiM5Q0EzQUYiLz48cGF0aCBkPSJNNjUgNzBIMTM1VjEzMEg2NVY3MFoiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+'

export const meta: MetaFunction = () => [{ title: 'MicroMeetup - Events' }]

// Define types for our data structure
type MeetupAttendee = {
	id: string
	username: string
	name: string | null
	imageId: string | null
}

type MeetupData = {
	id: string
	title: string
	description: string
	startTime: string
	location: {
		id: string
		name: string
	}
	owner: {
		id: string
		username: string
		name: string | null
	}
	attendees: MeetupAttendee[]
}

// Mock attendees for demonstration
const mockAttendees: MeetupAttendee[] = [
	{
		id: '1',
		username: 'johndoe',
		name: 'John Doe',
		imageId: null,
	},
	{
		id: '2',
		username: 'janedoe',
		name: 'Jane Doe',
		imageId: null,
	},
	{
		id: '3',
		username: 'bobsmith',
		name: 'Bob Smith',
		imageId: null,
	},
	{
		id: '4',
		username: 'alicejones',
		name: 'Alice Jones',
		imageId: null,
	},
	{
		id: '5',
		username: 'mikebrown',
		name: 'Mike Brown',
		imageId: null,
	},
]

export async function loader({ request }: { request: Request }) {
	const url = new URL(request.url)
	const view = url.searchParams.get('view') || 'upcoming'

	// Get meetups
	const meetups = await prisma.meetup.findMany({
		select: {
			id: true,
			title: true,
			description: true,
			startTime: true,
			location: {
				select: {
					id: true,
					name: true,
				},
			},
			owner: {
				select: {
					id: true,
					username: true,
					name: true,
					image: { select: { id: true } },
				},
			},
		},
		orderBy: {
			startTime: view === 'upcoming' ? 'asc' : 'desc',
		},
		where:
			view === 'upcoming'
				? { startTime: { gte: new Date() } }
				: { startTime: { lt: new Date() } },
	})

	// Add mock attendees to each meetup
	// In a real app, you would fetch actual attendees from the database
	const meetupsWithAttendees = meetups.map((meetup) => ({
		...meetup,
		// Generate a random number of attendees (1-5) for each meetup
		attendees: mockAttendees.slice(0, Math.floor(Math.random() * 5) + 1),
	}))

	return json({ meetups: meetupsWithAttendees, view })
}

// Helper component for avatar stack
function AttendeeAvatarStack({ attendees }: { attendees: MeetupAttendee[] }) {
	const totalCount = attendees.length
	const displayCount = Math.min(totalCount, 3) // Show max 3 avatars instead of 4
	const remainingCount = totalCount - displayCount

	return (
		<div className="flex items-center">
			<div className="flex -space-x-2">
				{attendees.slice(0, displayCount).map((attendee) => (
					<TooltipProvider key={attendee.id}>
						<Tooltip>
							<TooltipTrigger asChild>
								<Avatar className="h-6 w-6 border-2 border-white">
									<AvatarImage
										src={getUserImgSrc(attendee.imageId)}
										alt={attendee.name || attendee.username}
									/>
									<AvatarFallback>
										{(attendee.name || attendee.username).substring(0, 2)}
									</AvatarFallback>
								</Avatar>
							</TooltipTrigger>
							<TooltipContent>
								{attendee.name || attendee.username}
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				))}

				{remainingCount > 0 && (
					<div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs font-medium">
						+{remainingCount}
					</div>
				)}
			</div>

			<span className="ml-2 text-xs text-gray-500">
				{totalCount} {totalCount === 1 ? 'attendee' : 'attendees'}
			</span>
		</div>
	)
}

export default function Index() {
	const { meetups } = useLoaderData<typeof loader>()
	const [searchParams, setSearchParams] = useSearchParams()
	// const navigate = useNavigate()
	const currentView = searchParams.get('view') || 'upcoming'

	const user = useOptionalUser()

	// Type assertion to help TypeScript understand our data structure
	const typedMeetups = meetups as unknown as MeetupData[]

	const handleViewChange = (view: string) => {
		setSearchParams((params) => {
			params.set('view', view)
			return params
		})
	}

	// Change to initialize activeTab based on currentView
	const [activeTab, setActiveTab] = useState(
		currentView === 'past' ? 'Past' : 'Upcoming',
	)

	// We can simplify the useEffect since we're already initializing correctly
	useEffect(() => {
		setActiveTab(currentView === 'past' ? 'Past' : 'Upcoming')
	}, [currentView])

	const handleTabClick = (tab: string) => {
		setActiveTab(tab)
		handleViewChange(tab === 'Past' ? 'past' : 'upcoming')
		setSearchParams((params) => {
			params.set('view', tab === 'Past' ? 'past' : 'upcoming')
			return params
		})
	}

	// Group upcoming meetups by date if we're in the upcoming view
	const groupedMeetups =
		currentView === 'upcoming'
			? typedMeetups.reduce(
					(acc, meetup) => {
						const date = format(new Date(meetup.startTime), 'MMM d')
						const dayName = format(new Date(meetup.startTime), 'EEEE')

						// Check if it's tomorrow
						const tomorrow = new Date()
						tomorrow.setDate(tomorrow.getDate() + 1)
						const isTomorrow =
							format(new Date(meetup.startTime), 'yyyy-MM-dd') ===
							format(tomorrow, 'yyyy-MM-dd')

						const key = isTomorrow ? 'Tomorrow' : date
						const displayDate = {
							key,
							date: key,
							dayName: isTomorrow ? 'Wednesday' : dayName,
						}

						if (!acc[key]) {
							acc[key] = {
								displayDate,
								meetups: [],
							}
						}

						acc[key].meetups.push(meetup)
						return acc
					},
					{} as Record<
						string,
						{
							displayDate: { key: string; date: string; dayName: string }
							meetups: MeetupData[]
						}
					>,
				)
			: null

	return (
		<div className="relative flex flex-col text-gray-800">
			<main className="container mx-auto max-w-5xl px-4 py-6">
				<div className="mb-4 flex items-center justify-between">
					<h1 className="text-3xl font-bold">Events</h1>

					<div className="flex items-center justify-center">
						<div className="relative flex w-64 rounded-lg bg-gray-100 p-1">
							{/* Active background that slides */}
							<div
								className={`absolute bottom-1 top-1 rounded-md bg-white shadow-md transition-all duration-300 ease-in-out ${
									activeTab === 'Upcoming'
										? 'left-1 right-1/2'
										: 'left-1/2 right-1'
								}`}
							/>

							{/* Upcoming button - now on the left */}
							<button
								onClick={() => handleTabClick('Upcoming')}
								className={`relative z-10 flex-1 rounded-md px-4 py-2 text-center text-sm font-medium transition-colors duration-200 ${
									activeTab === 'Upcoming'
										? 'text-black'
										: 'text-gray-500 hover:text-gray-800'
								}`}
							>
								Upcoming
							</button>

							{/* Past button - now on the right */}
							<button
								onClick={() => handleTabClick('Past')}
								className={`relative z-10 flex-1 rounded-md px-4 py-2 text-center text-sm font-medium transition-colors duration-200 ${
									activeTab === 'Past'
										? 'text-black'
										: 'text-gray-500 hover:text-gray-800'
								}`}
							>
								Past
							</button>
						</div>
					</div>
				</div>

				{currentView === 'upcoming' && (
					<div className="space-y-8">
						{groupedMeetups && Object.values(groupedMeetups).length > 0 ? (
							<div className="relative">
								{/* Continuous timeline line */}
								<div className="absolute bottom-0 left-[120px] top-0 w-[2px] bg-gray-200"></div>

								{Object.values(groupedMeetups).map(
									({ displayDate, meetups }, groupIndex) => (
										<div key={displayDate.key} className="relative mb-8">
											<div className="flex">
												<div className="mr-6 w-32 pt-1">
													<div className="sticky top-24 rounded-md">
														<h2 className="text-lg font-bold text-gray-800">
															{displayDate.date}
														</h2>
														<p className="text-xs text-gray-500">
															{displayDate.dayName}
														</p>
													</div>
												</div>

												<div className="relative flex-1 space-y-3">
													{meetups.map((meetup, index) => (
														<NavLink
															key={meetup.id}
															to={`/meetup/${meetup.id}`}
															prefetch="intent"
															className="block"
														>
															<Card className="relative overflow-hidden transition-all duration-200 hover:border-primary hover:shadow-md">
																{/* Timeline dot */}
																<div className="absolute -left-[20px] top-1/2 -translate-y-1/2">
																	<div className="h-4 w-4 rounded-full border-2 border-white bg-blue-500"></div>
																</div>

																<div className="flex h-full">
																	<div className="flex-1">
																		<CardContent className="flex h-full flex-col p-0">
																			<div className="p-4">
																				<div className="flex items-start justify-between">
																					<div className="w-full">
																						<h3 className="text-lg font-semibold leading-tight text-gray-900">
																							{meetup.title}
																						</h3>

																						<div className="mt-3 space-y-2">
																							<div className="flex items-center gap-1.5 text-sm text-gray-700">
																								<div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50">
																									<Icon
																										name="clock"
																										className="h-3.5 w-3.5 text-blue-600"
																									/>
																								</div>
																								<span>
																									{format(
																										new Date(meetup.startTime),
																										'h:mm a',
																									)}
																								</span>
																							</div>

																							<div className="flex items-center gap-1.5 text-sm text-gray-700">
																								<div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-50">
																									<Icon
																										name="map-pin"
																										className="h-3.5 w-3.5 text-red-600"
																									/>
																								</div>
																								<span>
																									{meetup.location.name}
																								</span>
																							</div>

																							<div className="flex items-center gap-1.5 text-sm text-gray-700">
																								<div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
																									<Icon
																										name="users"
																										className="h-3.5 w-3.5 text-gray-600"
																									/>
																								</div>
																								<span>
																									Organized by{' '}
																									{meetup.owner.name ||
																										meetup.owner.username}
																								</span>
																							</div>
																						</div>
																					</div>

																					<Button
																						variant="outline"
																						size="sm"
																						className="ml-2 h-8 shrink-0 rounded-full bg-green-50 px-4 text-xs font-medium text-green-700 hover:bg-green-100 hover:text-green-800"
																					>
																						<Icon
																							name="check"
																							className="mr-1.5 h-3.5 w-3.5"
																						/>
																						Going
																					</Button>
																				</div>
																			</div>

																			<div className="mt-auto border-t border-gray-100 bg-gray-50 px-4 py-3">
																				<AttendeeAvatarStack
																					attendees={meetup.attendees}
																				/>
																			</div>
																		</CardContent>
																	</div>

																	<div className="w-1/4">
																		<div className="h-full overflow-hidden">
																			<img
																				src={`/resources/location-images/${meetup.location.id}`}
																				alt={`${meetup.title} meetup at ${meetup.location.name}`}
																				className="h-full w-full object-cover transition-transform duration-200 hover:scale-105"
																				onError={(e) => {
																					e.currentTarget.src =
																						PLACEHOLDER_IMAGE
																				}}
																			/>
																		</div>
																	</div>
																</div>
															</Card>
														</NavLink>
													))}
												</div>
											</div>
										</div>
									),
								)}
							</div>
						) : (
							<div className="flex flex-col items-center justify-center rounded-lg bg-gray-50 py-12 text-center">
								<Icon
									name="calendar"
									className="mb-3 h-12 w-12 text-gray-300"
								/>
								<p className="text-base text-gray-500">No upcoming events</p>
								<Link to={`/users/${user?.username}/meetups/new`}>
									<Button variant="outline" className="mt-4">
										Create an event
									</Button>
								</Link>
							</div>
						)}
					</div>
				)}

				{currentView === 'past' && (
					<div className="space-y-3">
						{typedMeetups.length > 0 ? (
							typedMeetups.map((meetup) => (
								<NavLink
									key={meetup.id}
									to={`/meetup/${meetup.id}`}
									prefetch="intent"
									className="block"
								>
									<Card className="overflow-hidden opacity-90 transition-all duration-200 hover:border-blue-300 hover:shadow-sm hover:ring-1 hover:ring-blue-200">
										<div className="flex h-full">
											<div className="flex-1">
												<CardContent className="flex h-full flex-col p-0">
													<div className="p-4">
														<div className="flex items-start justify-between">
															<div className="w-full">
																<h3 className="text-lg font-semibold leading-tight text-gray-900">
																	{meetup.title}
																</h3>

																<div className="mt-3 space-y-2">
																	<div className="flex items-center gap-1.5 text-sm text-gray-700">
																		<div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50">
																			<Icon
																				name="calendar"
																				className="h-3.5 w-3.5 text-blue-600"
																			/>
																		</div>
																		<span>
																			{format(
																				new Date(meetup.startTime),
																				'MMM d, yyyy',
																			)}
																		</span>
																	</div>

																	<div className="flex items-center gap-1.5 text-sm text-gray-700">
																		<div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-50">
																			<Icon
																				name="map-pin"
																				className="h-3.5 w-3.5 text-red-600"
																			/>
																		</div>
																		<span>{meetup.location.name}</span>
																	</div>

																	<div className="flex items-center gap-1.5 text-sm text-gray-700">
																		<div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
																			<Icon
																				name="users"
																				className="h-3.5 w-3.5 text-gray-600"
																			/>
																		</div>
																		<span>
																			Organized by{' '}
																			{meetup.owner.name ||
																				meetup.owner.username}
																		</span>
																	</div>
																</div>
															</div>
														</div>
													</div>

													<div className="mt-auto border-t border-gray-100 bg-gray-50 px-4 py-3">
														<AttendeeAvatarStack attendees={meetup.attendees} />
													</div>
												</CardContent>
											</div>

											<div className="w-1/4">
												<div className="h-full overflow-hidden">
													<img
														src={`/resources/location-images/${meetup.location.id}`}
														alt={`${meetup.title} meetup at ${meetup.location.name}`}
														className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
														onError={(e) => {
															e.currentTarget.src = PLACEHOLDER_IMAGE
														}}
													/>
												</div>
											</div>
										</div>
									</Card>
								</NavLink>
							))
						) : (
							<div className="flex flex-col items-center justify-center rounded-lg bg-gray-50 py-12 text-center">
								<Icon name="clock" className="mb-3 h-12 w-12 text-gray-300" />
								<p className="text-base text-gray-500">No past events</p>
							</div>
						)}
					</div>
				)}
			</main>
		</div>
	)
}
