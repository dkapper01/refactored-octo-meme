import { format, addDays } from 'date-fns'
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

// import { CalendarIcon, Filter, Search, Coffee } from 'lucide-react'
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
	},
]

export default function ExploreEvents() {
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
	const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
		undefined,
	)
	const [events, setEvents] = useState<Event[]>(sampleEvents)

	const filteredEvents = events.filter(
		(event) =>
			event.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
			(!selectedDate ||
				event.date.toDateString() === selectedDate.toDateString()) &&
			(!selectedCategory || event.category === selectedCategory),
	)

	const handleCloneEvent = (event: Event) => {
		const newEvent: Event = {
			...event,
			id: events.length + 1,
			name: `${event.name} (Clone)`,
			date: addDays(event.date, 7),
			attendees: 1,
		}
		setEvents([...events, newEvent])
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8 dark:bg-gray-900">
			<div className="container mx-auto px-4">
				<div className="flex flex-col gap-8 lg:flex-row">
					<div className="space-y-8 lg:w-2/3">
						<div className="space-y-4 rounded-xl bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:bg-gray-800">
							<div className="relative">
								<Input
									type="search"
									placeholder="Search events..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="w-full rounded-full border-gray-200 py-2 pl-10 pr-4 transition-all duration-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:border-gray-700"
								/>
								<Icon
									name="magnifying-glass"
									className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"
								/>
							</div>
							<div className="flex flex-wrap gap-4">
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											className="rounded-full transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700"
										>
											{/* <CalendarIcon className="mr-2 h-4 w-4" /> */}
											<Icon name="calendar" className="mr-2 h-4 w-4" />
											{selectedDate
												? format(selectedDate, 'MMM d, yyyy')
												: 'Pick a date'}
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0" align="start">
										<Calendar
											mode="single"
											selected={selectedDate}
											onSelect={setSelectedDate}
											initialFocus
											className="rounded-lg shadow-sm"
										/>
									</PopoverContent>
								</Popover>
							</div>
						</div>

						<div>
							<h2 className="mb-6 flex items-center text-2xl font-semibold text-gray-800 dark:text-gray-100">
								Upcoming Events
							</h2>
							<div className="grid grid-cols-1 gap-6">
								{filteredEvents.map((event) => (
									<EventCard
										key={event.id}
										event={event}
										onCloneEvent={handleCloneEvent}
									/>
								))}
							</div>
							{filteredEvents.length === 0 && (
								<p className="mt-8 rounded-xl bg-white p-6 text-center text-gray-500 shadow-sm dark:bg-gray-800">
									No events found. Try adjusting your search or filters.
								</p>
							)}
						</div>
					</div>
					<div className="space-y-8 lg:w-1/3">
						<div className="sticky top-4 rounded-xl bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:bg-gray-800">
							<CoffeeShopList />
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
