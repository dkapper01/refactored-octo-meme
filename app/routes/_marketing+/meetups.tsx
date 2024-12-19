import { Link } from '@remix-run/react'
import { useState } from 'react'
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from '#app/components/ui/avatar.tsx'
import { Badge } from '#app/components/ui/badge.tsx'
import { Button } from '#app/components/ui/button.tsx'
import {
	Card,
	CardContent,
	CardHeader,
	CardFooter,
	CardTitle,
	CardDescription,
} from '#app/components/ui/card.tsx'
import { Separator } from '#app/components/ui/separator.tsx'

const mockMeetups = [
	{
		id: 1,
		host: {
			name: 'Jake',
			avatar: '/placeholder.svg',
			interests: ['Coffee', 'Networking'],
		},
		location: 'Central Café',
		date: 'Today',
		startTime: '1pm',
		endTime: '3pm',
		description:
			'Open for friendly chat and networking over great coffee. All professionals welcome!',
		tags: ['Coffee', 'Networking'],
		attendees: 3,
	},
	{
		id: 2,
		host: {
			name: 'Emma',
			avatar: '/placeholder.svg',
			interests: ['Reading', 'Literature'],
		},
		location: 'City Park',
		date: 'Tomorrow',
		startTime: '2pm',
		endTime: '4pm',
		description:
			"Join our outdoor book discussion. This week's topic: Modern Fiction",
		tags: ['Reading', 'Literature'],
		attendees: 2,
	},
	{
		id: 3,
		host: {
			name: 'Alex',
			avatar: '/placeholder.svg',
			interests: ['Programming', 'Technology'],
		},
		location: 'Tech Hub',
		date: 'Friday',
		startTime: '3pm',
		endTime: '5pm',
		description: 'Hands-on coding workshop for beginners. Bring your laptop!',
		tags: ['Programming', 'Technology'],
		attendees: 5,
	},
	{
		id: 4,
		host: {
			name: 'Jake',
			avatar: '/placeholder.svg',
			interests: ['Coffee', 'Networking'],
		},
		location: 'Central Café',
		date: 'Today',
		startTime: '1pm',
		endTime: '3pm',
		description:
			'Open for friendly chat and networking over great coffee. All professionals welcome!',
		tags: ['Coffee', 'Networking'],
		attendees: 3,
	},
]

export default function MeetupsRoute() {
	const [meetups] = useState(mockMeetups)

	return (
		<div className="container grid grid-cols-3 gap-6">
			{meetups.map((meetup, index) => (
				<Card key={index} className="w-full">
					<CardHeader className="">
						<div className="flex items-center justify-between">
							<Badge variant="outline" className="">
								{meetup.date}
							</Badge>
							<Badge variant="secondary" className="">
								{meetup.attendees} attending
							</Badge>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center space-x-4">
							<Avatar className="h-16 w-16">
								<AvatarImage src={meetup.host.avatar} alt={meetup.host.name} />
								<AvatarFallback>{meetup.host.name[0]}</AvatarFallback>
							</Avatar>
							<div>
								<CardTitle className="">
									<Link
										to={`/user/${meetup.id}`}
										className="text-primary hover:underline"
									>
										{meetup.host.name}&apos;s Meetup
									</Link>
								</CardTitle>
								<CardDescription className="">
									{meetup.location}
								</CardDescription>
							</div>
						</div>
						<Separator className="my-2" />
						<p className="text-sm text-muted-foreground">
							{meetup.description}
						</p>
						<div className="flex items-center justify-between text-sm">
							<div className="flex items-center text-muted-foreground">
								{meetup.startTime} - {meetup.endTime}
							</div>
						</div>
						<div>
							<h4 className="mb-2 flex items-center text-sm font-semibold">
								Tags
							</h4>
							<div className="flex flex-wrap gap-2">
								{meetup.tags.map((tag, index) => (
									<Badge key={index} variant="outline">
										{tag}
									</Badge>
								))}
							</div>
						</div>
						<div>
							<h4 className="mb-2 text-sm font-semibold">Host Interests</h4>
							<p className="text-sm text-muted-foreground">
								{meetup.host.interests.join(', ')}
							</p>
						</div>
					</CardContent>
					<CardFooter>
						<Link to={`/meetup/${meetup.id}`} className="w-full">
							<Button className="group w-full bg-primary text-primary-foreground hover:bg-primary/90">
								View Details
							</Button>
						</Link>
					</CardFooter>
				</Card>
			))}
		</div>
	)
}
