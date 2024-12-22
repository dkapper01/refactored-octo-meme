import { Link } from '@remix-run/react'
import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '#app/components/ui/avatar'
import { Badge } from '#app/components/ui/badge'
import { Button } from '#app/components/ui/button'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '#app/components/ui/card'
import { Icon } from '#app/components/ui/icon.tsx'

// Mock data for demonstration
const mockMeetup = {
	id: 1,
	host: {
		name: 'Jake',
		avatar: '/placeholder.svg',
		bio: 'Coffee enthusiast and tech lover. Always up for a good conversation!',
		interests: ['Coffee', 'Technology', 'Networking'],
	},
	title: 'Tech & Coffee Networking',
	location: 'Central Café',
	coordinates: {
		latitude: 40.7128,
		longitude: -74.006,
	},
	date: '2023-07-15',
	startTime: '13:00',
	endTime: '15:00',
	description:
		'Open for friendly chat about the latest in tech and the best coffee brews. Join us for an afternoon of networking and idea-sharing in a relaxed atmosphere.',
	tags: ['Coffee', 'Technology', 'Networking'],
	attendees: 3,
	maxAttendees: 10,
	locationImages: [
		{
			id: 1,
			url: 'https://placehold.co/1375x400',
			alt: 'Café entrance',
		},
		{
			id: 2,
			url: '/placeholder.svg?height=400&width=600',
			alt: 'Indoor seating area',
		},
		{ id: 3, url: '/placeholder.svg?height=400&width=600', alt: 'Coffee bar' },
		{
			id: 4,
			url: '/placeholder.svg?height=400&width=600',
			alt: 'Outdoor patio',
		},
	],
}

export default function MeetupRoute() {
	const [joined, setJoined] = useState(false)
	const [currentImageIndex, setCurrentImageIndex] = useState(0)

	const handleJoin = () => {
		setJoined(true)
	}

	const nextImage = () => {
		setCurrentImageIndex((prevIndex) =>
			prevIndex === mockMeetup.locationImages.length - 1 ? 0 : prevIndex + 1,
		)
	}

	const prevImage = () => {
		setCurrentImageIndex((prevIndex) =>
			prevIndex === 0 ? mockMeetup.locationImages.length - 1 : prevIndex - 1,
		)
	}

	// Generate OpenStreetMap URL for static map
	const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${
		mockMeetup.coordinates.longitude - 0.01
	},${mockMeetup.coordinates.latitude - 0.01},${
		mockMeetup.coordinates.longitude + 0.01
	},${
		mockMeetup.coordinates.latitude + 0.01
	}&layer=mapnik&marker=${mockMeetup.coordinates.latitude},${
		mockMeetup.coordinates.longitude
	}`
	return (
		<div className="container mx-auto">
			<div className="relative mb-8 h-[400px] overflow-hidden rounded-lg shadow-md">
				<img
					src={mockMeetup.locationImages[currentImageIndex]?.url}
					alt={mockMeetup.locationImages[currentImageIndex]?.alt}
				/>
				<div className="absolute inset-0 flex items-end bg-black bg-opacity-40">
					<div className="p-6 text-white">
						<h1 className="mb-2 text-3xl font-bold">{mockMeetup.title}</h1>
						<p className="mb-4 text-xl">Hosted by {mockMeetup.host.name}</p>
						<div className="flex items-center space-x-4 text-sm">
							<span className="flex items-center">
								<Icon name="calendar" size="md" className="mr-2" />
								{mockMeetup.date}
							</span>
							<span className="flex items-center">
								<Icon name="clock" size="md" className="mr-2" />
								{mockMeetup.startTime} - {mockMeetup.endTime}
							</span>
							<span className="flex items-center">
								<Icon name="users" size="md" className="mr-2" />
								{mockMeetup.attendees}/{mockMeetup.maxAttendees} attending
							</span>
						</div>
					</div>
				</div>
				<Button
					variant="ghost"
					size="icon"
					className="absolute left-2 top-1/2 -translate-y-1/2 transform bg-black bg-opacity-50 text-white hover:bg-opacity-75"
					onClick={prevImage}
				>
					<Icon name="chevron-left" size="lg" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					className="absolute right-2 top-1/2 -translate-y-1/2 transform bg-black bg-opacity-50 text-white hover:bg-opacity-75"
					onClick={nextImage}
				>
					<Icon name="chevron-right" size="lg" />
				</Button>
			</div>
			<div className="grid grid-cols-3 gap-4">
				<Card className="col-span-2 border border-gray-200">
					<CardHeader className="flex flex-row items-center justify-between border-b border-gray-200 bg-gray-50">
						<CardTitle className="text-2xl font-bold text-gray-800">
							About this Meetup
						</CardTitle>
						<Button
							onClick={handleJoin}
							disabled={joined}
							className="bg-blue-600 font-semibold text-white hover:bg-blue-700"
						>
							{joined ? 'Joined!' : 'Join Meetup'}
						</Button>
					</CardHeader>
					<CardContent className="space-y-6 pt-6">
						<p className="text-base leading-relaxed text-gray-600">
							{mockMeetup.description}
						</p>
						<div className="flex items-center justify-between rounded-lg bg-gray-50 p-4 text-base text-muted-foreground">
							<div className="flex items-center">
								<Icon name="calendar" size="lg" className="mr-2" />
								{mockMeetup.date}
							</div>
							<div className="flex items-center">
								<Icon name="clock" size="lg" className="mr-2" />
								{mockMeetup.startTime} - {mockMeetup.endTime}
							</div>
							<div className="flex items-center">
								<Icon name="users" size="lg" className="mr-2" />
								{mockMeetup.attendees}/{mockMeetup.maxAttendees}
							</div>
						</div>

						<div>
							<h3 className="mb-2 text-lg font-semibold text-gray-800">
								Location
							</h3>
							<p className="text-base text-gray-600">{mockMeetup.location}</p>

							<div className="mb-4 overflow-hidden rounded-md border border-gray-200">
								<iframe
									src={mapUrl}
									width="100%"
									height="100%"
									title="Meetup location map"
								/>
							</div>
							<Button
								variant="outline"
								className="w-full border-gray-300 text-gray-700 hover:bg-gray-100"
							>
								Open in Maps
							</Button>
						</div>
						<div>
							<h3 className="mb-2 text-lg font-semibold text-gray-800">Tags</h3>
							<div className="flex flex-wrap gap-2">
								{mockMeetup.tags.map((tag, index) => (
									<Badge
										key={index}
										variant="outline"
										className="px-2 py-1 text-sm"
									>
										{tag}
									</Badge>
								))}
							</div>
						</div>
					</CardContent>
				</Card>

				<div className="col-span-1 space-y-8">
					<Card className="border border-gray-200 shadow-md">
						<CardHeader className="flex flex-row items-center justify-between border-b border-gray-200 bg-gray-50">
							<CardTitle className="text-2xl font-bold text-gray-800">
								Host
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="mb-4 flex items-center space-x-4 pt-6">
								<Avatar className="h-16 w-16 border border-gray-200">
									<AvatarImage
										src={mockMeetup.host.avatar}
										alt={mockMeetup.host.name}
									/>
									<AvatarFallback>{mockMeetup.host.name[0]}</AvatarFallback>
								</Avatar>
								<div>
									<h3 className="text-lg font-semibold text-gray-800">
										{mockMeetup.host.name}
									</h3>
									<Link
										to={`/profile`}
										className="inline-flex items-center text-sm text-blue-600 hover:underline"
									>
										View Profile
									</Link>
								</div>
							</div>
							<p className="mb-3 text-sm text-gray-600">
								{mockMeetup.host.bio}
							</p>
							<div>
								<h3 className="mb-2 text-lg font-semibold text-gray-800">
									Interests
								</h3>
								<div className="flex flex-wrap gap-2">
									{mockMeetup.host.interests.map((interest, index) => (
										<Badge
											key={index}
											variant="outline"
											className="px-2 py-1 text-sm"
										>
											{interest}
										</Badge>
									))}
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
}
