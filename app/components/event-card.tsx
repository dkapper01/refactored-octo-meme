import { format } from 'date-fns'
import { useState } from 'react'
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from '#app/components/ui/avatar.tsx'
import { Badge } from '#app/components/ui/badge.tsx'
import { Card, CardContent, CardFooter } from '#app/components/ui/card.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { Progress } from '#app/components/ui/progress.tsx'
import { EventDrawer } from './event-drawer'

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

interface EventCardProps {
	event: Event
	onClick: () => void
}

export default function EventCard({ event }: EventCardProps) {
	const [isDrawerOpen, setIsDrawerOpen] = useState(false)

	const maxAttendees = 6
	const spotsLeft = maxAttendees - event.attendees
	const progressPercentage = (event.attendees / maxAttendees) * 100
	const isFull = spotsLeft === 0

	const handleCardClick = () => {
		setIsDrawerOpen(true)
	}
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

	return (
		<>
			<Card
				className="cursor-pointer overflow-hidden border bg-white transition-all duration-300 hover:shadow-md dark:bg-gray-800"
				onClick={handleCardClick}
			>
				<CardContent className="space-y-4 p-4">
					<div className="flex items-start justify-between">
						<div>
							<h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
								{event.name}
							</h3>
							<p className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
								{event.location}
							</p>
						</div>
						<Badge className={`${getStatusColor(event.status)} capitalize`}>
							{event.status?.replace('-', ' ')}
						</Badge>
					</div>
					<div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
						<span className="flex items-center">
							<Icon name="calendar" className="mr-2 h-4 w-4" />
							{format(event.date, 'MMM d, h:mm a')}
						</span>
						<span className="flex items-center">
							<Icon name="users" className="mr-2 h-4 w-4" />
							{event.attendees}/{maxAttendees} going
						</span>
					</div>
					<p className="text-sm text-gray-600 dark:text-gray-300">
						{event.description}
					</p>
					<div className="space-y-2">
						<div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
							<span>
								{isFull ? 'Event is full' : `${spotsLeft} spots left`}
							</span>
							<span>
								{event.attendees}/{maxAttendees} joined
							</span>
						</div>
						<Progress value={progressPercentage} className="h-0.5" />
					</div>
				</CardContent>
				<CardFooter className="flex items-center justify-between bg-gray-50 p-3 dark:bg-gray-700">
					<div className="flex items-center">
						<Avatar className="mr-2 h-6 w-6 border-2 border-white transition-transform duration-300 hover:scale-110 dark:border-gray-800">
							<AvatarImage src={`/placeholder.svg?height=32&width=32&text=H`} />
							<AvatarFallback>H</AvatarFallback>
						</Avatar>
						<span className="text-sm text-gray-500 dark:text-gray-400">
							Hosted by User
						</span>
					</div>
					<div className="flex -space-x-2">
						{[...Array(Math.min(3, event.attendees))].map((_, i) => (
							<Avatar
								key={i}
								className="h-6 w-6 border-2 border-white transition-transform duration-300 hover:scale-110 dark:border-gray-800"
							>
								<AvatarImage
									src={`/placeholder.svg?height=32&width=32&text=${i + 1}`}
								/>
								<AvatarFallback>U{i + 1}</AvatarFallback>
							</Avatar>
						))}
					</div>
				</CardFooter>
			</Card>
			<EventDrawer
				event={event}
				isOpen={isDrawerOpen}
				onClose={() => setIsDrawerOpen(false)}
			/>
		</>
	)
}
