import { useState } from 'react'
import { Button } from '#app/components/ui/button.tsx'
import { Calendar } from '#app/components/ui/calendar.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { Input } from '#app/components/ui/input.tsx'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '#app/components/ui/popover.tsx'
import CoffeeShopList from './coffee-shop-list'
import EventCard from './event-card'

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

const sampleEvents: Event[] = [
	{
		id: 1,
		name: 'JavaScript Coding Session',
		date: new Date(2023, 5, 15, 18, 30),
		location: 'Brew & Code Café',
		description: 'Casual coding and JavaScript discussions over coffee.',
		category: 'Technology',
		attendees: 4,
		host: 'John Doe',
		status: 'upcoming',
	},
	{
		id: 2,
		name: 'Book Club: Sci-Fi Short Stories',
		date: new Date(2023, 5, 18, 19, 0),
		location: 'Starbooks Coffee',
		description: 'Discussing our favorite sci-fi short stories this month.',
		category: 'Books',
		attendees: 6,
		host: 'Daniel Yayla',
		status: 'in-progress',
	},
	{
		id: 3,
		name: 'Freelancer Meetup',
		date: new Date(2023, 5, 20, 8, 0),
		location: "Entrepreneur's Espresso",
		description: 'Network with fellow freelancers over morning coffee.',
		category: 'Business',
		attendees: 5,
		host: 'Jane Doe',
		status: 'upcoming',
	},
]

export default function ExploreEvents() {
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

	return (
		<div className="min-h-screen py-8 dark:bg-gray-900">
			<div className="container mx-auto px-4">
				<div className="flex flex-col gap-6 lg:flex-row">
					<div className="space-y-6 lg:w-2/3">
						<div className="space-y-4 rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
							<div className="flex items-center space-x-2">
								<div className="relative flex-grow">
									<Input
										type="search"
										placeholder="Search events..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="w-full rounded-full border-gray-200 py-2 pl-8 pr-4 text-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:border-gray-700"
									/>

									<Icon
										name="magnifying-glass"
										className="absolute left-2.5 top-1/2 -translate-y-1/2 transform text-gray-400"
									/>
								</div>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											size="sm"
											className="rounded-full"
										>
											<Icon name="calendar" className="h-4 w-4" />
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0" align="end">
										<Calendar
											mode="single"
											selected={selectedDate}
											onSelect={setSelectedDate}
											initialFocus
										/>
									</PopoverContent>
								</Popover>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											size="sm"
											className="rounded-full"
										>
											<Icon name="funnel" className="h-4 w-4" />
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-[180px] p-0">
										<div className="p-2">
											<Button
												variant="ghost"
												className="w-full justify-start rounded-md text-sm"
												onClick={() => {}}
											>
												All Categories
											</Button>
											{Array.from(
												new Set(sampleEvents.map((event) => event.category)),
											).map((category) => (
												<Button
													key={category}
													variant="ghost"
													className="w-full justify-start rounded-md text-sm"
												>
													{category}
												</Button>
											))}
										</div>
									</PopoverContent>
								</Popover>
							</div>
						</div>

						<div>
							<h2 className="mb-4 flex items-center text-xl font-semibold text-gray-800 dark:text-gray-100">
								Upcoming Events
							</h2>
							<div className="space-y-4">
								{sampleEvents.map((event) => (
									<EventCard
										key={event.id}
										event={event}
										onClick={() => {}}
										// onCloneEvent={handleCloneEvent}
									/>
								))}
							</div>
							{sampleEvents.length === 0 && (
								<p className="mt-8 rounded-lg bg-white p-4 text-center text-gray-500 shadow-sm dark:bg-gray-800">
									No events found. Try adjusting your search or filters.
								</p>
							)}
						</div>
					</div>
					<div className="lg:w-1/3">
						<div className="sticky top-4 rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
							<CoffeeShopList />
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
