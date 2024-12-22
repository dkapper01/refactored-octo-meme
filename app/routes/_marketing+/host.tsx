import { useState } from 'react'
import { Button } from '#app/components/ui/button.tsx'
import { Input } from '#app/components/ui/input.tsx'
import { Label } from '#app/components/ui/label.tsx'
import {
	Select,
	SelectTrigger,
	SelectContent,
	SelectItem,
	SelectValue,
} from '#app/components/ui/select.tsx'
import { Textarea } from '#app/components/ui/textarea.tsx'

export default function HostRoute() {
	const [location, setLocation] = useState('')
	const [date, setDate] = useState('')
	const [startTime, setStartTime] = useState('')
	const [endTime, setEndTime] = useState('')
	const [description, setDescription] = useState('')
	const [tags, setTags] = useState('')
	const [maxAttendees, setMaxAttendees] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsSubmitting(true)
		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1500))
		console.log({
			location,
			date,
			startTime,
			endTime,
			description,
			tags,
			maxAttendees,
		})
	}
	return (
		<div className="container mx-auto mt-10 max-w-2xl p-4">
			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="space-y-2">
					<Label
						htmlFor="location"
						className="flex items-center text-sm font-medium"
					>
						{/* <MapPin className="mr-2 h-4 w-4 text-primary" /> */}
						Location
					</Label>
					<Input
						id="location"
						value={location}
						onChange={(e) => setLocation(e.target.value)}
						placeholder="Enter meetup location"
						className="border-primary/20 focus:border-primary focus:ring-primary"
						required
					/>
				</div>
				<div className="space-y-2">
					<Label
						htmlFor="date"
						className="flex items-center text-sm font-medium"
					>
						{/* <Calendar className="mr-2 h-4 w-4 text-primary" />  */}
						Date
					</Label>
					<Input
						id="date"
						type="date"
						value={date}
						onChange={(e) => setDate(e.target.value)}
						className="border-primary/20 focus:border-primary focus:ring-primary"
						required
					/>
				</div>
				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label
							htmlFor="endTime"
							className="flex items-center text-sm font-medium"
						>
							{/* <Clock className="mr-2 h-4 w-4 text-primary" />  */}
							End Time
						</Label>
						<Input
							id="endTime"
							type="time"
							value={endTime}
							onChange={(e) => setEndTime(e.target.value)}
							className="border-primary/20 focus:border-primary focus:ring-primary"
							required
						/>
					</div>
					<div className="space-y-2">
						<Label
							htmlFor="startTime"
							className="flex items-center text-sm font-medium"
						>
							{/* <Clock className="mr-2 h-4 w-4 text-primary" /> */}
							Start Time
						</Label>
						<Input
							id="startTime"
							type="time"
							value={startTime}
							onChange={(e) => setStartTime(e.target.value)}
							className="border-primary/20 focus:border-primary focus:ring-primary"
							required
						/>
					</div>
				</div>

				<div className="space-y-2">
					<Label
						htmlFor="description"
						className="flex items-center text-sm font-medium"
					>
						Description
					</Label>
					<Textarea
						id="description"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Write a short description of your meetup..."
						className="min-h-[100px] border-primary/20 focus:border-primary focus:ring-primary"
						required
					/>
				</div>
				<div className="space-y-2">
					<Label
						htmlFor="tags"
						className="flex items-center text-sm font-medium"
					>
						{/* <Tag className="mr-2 h-4 w-4 text-primary" />  */}
						Tags
					</Label>
					<Input
						id="tags"
						value={tags}
						onChange={(e) => setTags(e.target.value)}
						placeholder="e.g. Coffee, Networking (comma separated)"
						className="border-primary/20 focus:border-primary focus:ring-primary"
					/>
				</div>
			</form>
			<Button
				type="submit"
				className="mt-10 w-full bg-primary text-primary-foreground hover:bg-primary/90"
				disabled={isSubmitting}
				onClick={handleSubmit}
			>
				{isSubmitting ? (
					<>
						{/* <Loader2 className="mr-2 h-4 w-4 animate-spin" /> */}
						Publishing...
					</>
				) : (
					'Publish Meetup'
				)}
			</Button>
		</div>
	)
}
