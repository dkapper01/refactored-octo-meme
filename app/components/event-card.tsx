import { format } from 'date-fns'
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from '#app/components/ui/avatar.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { Card, CardContent, CardFooter } from '#app/components/ui/card.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { Progress } from '#app/components/ui/progress.tsx'

interface Event {
	id: number
	name: string
	date: Date
	location: string
	description: string
	category: string
	attendees: number
	host: string
}

interface EventCardProps {
	event: Event
	onCloneEvent: (event: Event) => void
}

export default function EventCard({ event, onCloneEvent }: EventCardProps) {
	const maxAttendees = 6
	const spotsLeft = maxAttendees - event.attendees
	const progressPercentage = (event.attendees / maxAttendees) * 100
	const isFull = spotsLeft === 0

	return (
		<Card className="overflow-hidden border-none bg-white transition-all duration-300 hover:shadow-md dark:bg-gray-800">
			<CardContent className="space-y-4 p-6">
				<div className="flex items-start justify-between">
					<div>
						<h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
							{event.name}
						</h3>
						<p className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
							<Icon name="map-pin" className="mr-2 h-4 w-4" />
							{event.location}
						</p>
						<p className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
							<Icon name="calendar" className="mr-2 h-4 w-4" />
							{format(event.date, 'MMM d, h:mm a')}
						</p>
					</div>
					{isFull ? (
						<Button
							variant="outline"
							size="sm"
							className="rounded-full px-4 text-sm transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700"
							onClick={() => onCloneEvent(event)}
						>
							{/* <Copy className="mr-2 h-4 w-4" /> */}
							Clone Event
						</Button>
					) : (
						<Button
							variant="outline"
							size="sm"
							className="rounded-full px-4 text-sm transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700"
						>
							Join
						</Button>
					)}
				</div>

				<p className="text-sm text-gray-600 dark:text-gray-300">
					{event.description}
				</p>
				<div className="space-y-2">
					<div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
						<span>{isFull ? 'Event is full' : `${spotsLeft} spots left`}</span>
						<span>
							{event.attendees}/{maxAttendees} joined
						</span>
					</div>
					<Progress value={progressPercentage} className="h-1" />
				</div>
			</CardContent>
			<CardFooter className="flex items-center justify-between bg-gray-50 p-4 dark:bg-gray-700">
				<div className="flex items-center space-x-2">
					<span className="text-sm text-gray-500 dark:text-gray-400">
						Hosted by
					</span>
					<Avatar className="h-8 w-8 border-2 border-white transition-transform duration-300 hover:scale-110 dark:border-gray-800">
						<AvatarImage
							src={`/placeholder.svg?height=32&width=32&text=${1}`}
						/>
						<AvatarFallback>U{1}</AvatarFallback>
					</Avatar>
				</div>
				<div className="flex -space-x-2">
					{[...Array(Math.min(3, event.attendees))].map((_, i) => (
						<Avatar
							key={i}
							className="h-8 w-8 border-2 border-white transition-transform duration-300 hover:scale-110 dark:border-gray-800"
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
	)
}
