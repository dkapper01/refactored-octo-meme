import { Link } from '@remix-run/react'
import { Avatar, AvatarFallback, AvatarImage } from '#app/components/ui/avatar'
import { Badge } from '#app/components/ui/badge'
import { Button } from '#app/components/ui/button'
import { Card, CardContent } from '#app/components/ui/card'

const user = {
	name: 'Jane Doe',
	avatar: '/placeholder.svg?height=200&width=200',
	bio: 'Enthusiastic meetup organizer and tech professional with over 10 years of experience. Passionate about fostering innovation and knowledge sharing in the tech community.',
	location: 'San Francisco, CA',
	profession: 'Senior Product Manager',
	company: 'TechInnovate Inc.',
	interests: [
		'Product Management',
		'Artificial Intelligence',
		'UX Design',
		'Blockchain',
		'Agile Methodologies',
	],
	meetupsHosted: 15,
	joinedDate: '2021-03-15',
	linkedin: 'https://www.linkedin.com/in/janedoe',
	twitter: 'https://twitter.com/janedoe',
	website: 'https://www.janedoe.com',
}

export default function ProfileRoute() {
	return (
		<div className="container mx-auto">
			<Card className="overflow-hidden">
				<div className="relative">
					<div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"></div>
					<div className="relative px-6 py-8">
						<div className="flex flex-col md:flex-row md:items-end md:space-x-6">
							<Avatar className="h-24 w-24 rounded-full border-4 border-white bg-white shadow-lg">
								<AvatarImage src={user.avatar} alt={user.name} />
								<AvatarFallback>
									{user.name
										.split(' ')
										.map((n) => n[0])
										.join('')}
								</AvatarFallback>
							</Avatar>
							<div className="mt-4 flex-grow space-y-1 md:mt-0">
								<h1 className="text-2xl font-bold text-white">{user.name}</h1>
								<div className="flex items-center space-x-2 text-sm text-blue-100">
									{/* <Briefcase size={16} /> */}
									<span>
										{user.profession} at {user.company}
									</span>
								</div>
							</div>
							<div className="mt-4 flex space-x-2 md:mt-0">
								<Button
									variant="secondary"
									size="icon"
									asChild
									className="bg-white/20 text-white hover:bg-white/30"
								>
									<Link
										to={user.linkedin}
										target="_blank"
										rel="noopener noreferrer"
									>
										{/* <Linkedin size={18} /> */}
										<span className="sr-only">LinkedIn profile</span>
									</Link>
								</Button>
								<Button
									variant="secondary"
									size="icon"
									asChild
									className="bg-white/20 text-white hover:bg-white/30"
								>
									<Link
										to={user.twitter}
										target="_blank"
										rel="noopener noreferrer"
									>
										{/* <Twitter size={18} /> */}
										<span className="sr-only">Twitter profile</span>
									</Link>
								</Button>
								<Button
									variant="secondary"
									size="icon"
									asChild
									className="bg-white/20 text-white hover:bg-white/30"
								>
									<Link
										to={user.website}
										target="_blank"
										rel="noopener noreferrer"
									>
										{/* <Globe size={18} /> */}
										<span className="sr-only">Personal website</span>
									</Link>
								</Button>
							</div>
						</div>
					</div>
				</div>
				<CardContent className="space-y-6 pt-6">
					<div>
						<h3 className="mb-2 text-lg font-semibold">About</h3>
						<p className="text-muted-foreground">{user.bio}</p>
					</div>
					<div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
						<div className="flex items-center space-x-2">
							{/* <MapPin size={16} /> */}
							<span>{user.location}</span>
						</div>
						<div className="flex items-center space-x-2">
							{/* <CalendarDays size={16} /> */}
							<span>
								Joined{' '}
								{new Date(user.joinedDate).toLocaleDateString('en-US', {
									month: 'long',
									year: 'numeric',
								})}
							</span>
						</div>
						<div className="flex items-center space-x-2">
							{/* <Users size={16} /> */}
							<span>{user.meetupsHosted} meetups hosted</span>
						</div>
					</div>
					<div>
						<h3 className="mb-2 text-lg font-semibold">Interests</h3>
						<div className="flex flex-wrap gap-2">
							{user.interests.map((interest) => (
								<Badge
									key={interest}
									variant="secondary"
									className="rounded-full px-2 py-0.5 text-xs"
								>
									{interest}
								</Badge>
							))}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* <MeetupActivity /> */}
		</div>
	)
}
