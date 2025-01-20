import { format } from 'date-fns'
// import { useState, useEffect } from 'react'
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from '#app/components/ui/avatar.tsx'
import { Badge } from '#app/components/ui/badge.tsx'
import { Button } from '#app/components/ui/button.tsx'

import { Icon } from '#app/components/ui/icon.tsx'
import { Progress } from '#app/components/ui/progress.tsx'
import {
	Sheet,
	SheetContent,
	// SheetHeader,
	// SheetTitle,
	// SheetDescription,
} from '#app/components/ui/sheet.tsx'
// import { cn } from '#app/utils/misc.tsx'

interface Event {
	id: number
	name: string
	date: Date
	location: string
	description: string
	category: string
	attendees: number
	host: string
	status: 'upcoming' | 'in-progress' | 'completed' | 'cancelled'
}

interface EventDrawerProps {
	event: Event | null
	isOpen: boolean
	onClose: () => void
}

const PLACEHOLDER_IMAGE =
	'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNODAgOTBIMTIwVjExMEg4MFY5MFoiIGZpbGw9IiM5Q0EzQUYiLz48cGF0aCBkPSJNNjUgNzBIMTM1VjEzMEg2NVY3MFoiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+'

export function EventDrawer({ event, isOpen, onClose }: EventDrawerProps) {
	// const [coffeeShopImage, setCoffeeShopImage] = useState('')

	// useEffect(() => {
	// 	if (event) {
	// 		// In a real app, you'd fetch the actual coffee shop image here
	// 		setCoffeeShopImage(
	// 			`/placeholder.svg?height=300&width=400&text=${event.location}`,
	// 		)
	// 	}
	// }, [event])

	if (!event) return null

	const maxAttendees = 6
	const spotsLeft = maxAttendees - event.attendees
	const progressPercentage = (event.attendees / maxAttendees) * 100

	const getStatusColor = (status: Event['status']) => {
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

	const getGoogleMapsUrl = (location: string) => {
		return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
	}

	return (
		<Sheet open={isOpen} onOpenChange={onClose}>
			<SheetContent className="flex w-full flex-col border-none p-0 sm:max-w-[540px]">
				<div className="flex-grow overflow-y-auto">
					<div className="relative h-48 sm:h-64">
						<img
							src={PLACEHOLDER_IMAGE}
							alt={`${event.location} coffee shop`}
							className="h-full w-full object-cover brightness-75"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
						<div className="absolute bottom-4 left-4 right-4">
							<Badge
								className={`${getStatusColor(event.status)} mb-2 capitalize`}
							>
								{event.status.replace('-', ' ')}
							</Badge>
							<h2 className="mb-1 text-2xl font-bold text-white sm:text-3xl">
								{event.name}
							</h2>
							<p className="flex items-center text-sm text-gray-200">
								{/* <Coffee className="mr-2 h-4 w-4" /> */}
								{event.location}
							</p>
						</div>
					</div>
					<div className="space-y-6 p-6">
						<div className="flex items-center justify-between">
							<div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
								<Icon name="calendar" className="mr-2 h-5 w-5" />
								{format(event.date, "MMMM d, yyyy 'at' h:mm a")}
							</div>
							<div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
								{/* <Users className="mr-2 h-5 w-5" /> */}
								<Icon name="users" className="mr-2 h-5 w-5" />
								{event.attendees} attending
							</div>
						</div>
						<p className="leading-relaxed text-gray-700 dark:text-gray-200">
							{event.description}
						</p>
						<div className="space-y-2">
							<div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
								<span>
									{spotsLeft > 0 ? `${spotsLeft} spots left` : 'Event is full'}
								</span>
								<span>
									{event.attendees}/{maxAttendees} joined
								</span>
							</div>
							<Progress value={progressPercentage} className="h-2" />
						</div>
						<div>
							<h3 className="mb-3 font-semibold text-gray-800 dark:text-gray-100">
								Attendees
							</h3>
							<ul className="space-y-2">
								{[...Array(event.attendees)].map((_, i) => (
									<li key={i} className="flex items-center space-x-3">
										<Avatar className="h-8 w-8 border-2 border-white dark:border-gray-800">
											<AvatarImage
												src={`/placeholder.svg?height=32&width=32&text=${i + 1}`}
											/>
											<AvatarFallback>U{i + 1}</AvatarFallback>
										</Avatar>
										<span className="text-sm text-gray-600 dark:text-gray-300">
											User {i + 1}
										</span>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>
				<div className="space-y-4 border-t border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
					<Button className="w-full" size="lg">
						Join Event
					</Button>
					<Button
						variant="outline"
						className="w-full"
						size="lg"
						onClick={() =>
							window.open(getGoogleMapsUrl(event.location), '_blank')
						}
					>
						<Icon name="map-pin" className="mr-2 h-4 w-4" />
						Open in Maps
					</Button>
				</div>
			</SheetContent>
		</Sheet>
	)
}
