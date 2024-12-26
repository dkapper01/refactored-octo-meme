import { useState } from 'react'
import { Button } from '#app/components/ui/button.tsx'
import CommandPreview from '#app/components/command-preveiw.tsx'
import { Input } from '#app/components/ui/input.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { Label } from '#app/components/ui/label.tsx'
import { Textarea } from '#app/components/ui/textarea.tsx'

export default function HostRoute() {
	const [title, setTitle] = useState('')
	const [location, setLocation] = useState({
		name: '',
		address: '',
	})
	const [date, setDate] = useState('')
	const [startTime, setStartTime] = useState('')
	const [endTime, setEndTime] = useState('')
	const [description, setDescription] = useState('')
	const [tags, setTags] = useState('')
	const [maxAttendees, setMaxAttendees] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isCommandOpen, setIsCommandOpen] = useState(false)

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
						htmlFor="Title"
						className="flex items-center text-sm font-medium"
					>
						<Icon name="pencil-2" className="mr-2 h-4 w-4 text-primary" />
						Title
					</Label>
					<Input
						id="title"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Enter meetup title"
						className="border-primary/20 focus:border-primary focus:ring-primary"
						required
					/>
				</div>
				<div className="space-y-2">
					<Label
						htmlFor="location"
						className="flex items-center text-sm font-medium"
					>
						<Icon name="map-pin" className="mr-2 h-4 w-4 text-primary" />
						Location
					</Label>
					<Button
						variant="outline"
						role="button"
						aria-expanded={isCommandOpen}
						className="w-full justify-between"
						onClick={() => setIsCommandOpen(true)}
					>
						{location.name ? (
							<span className="flex items-center">
								<Icon name="map-pin" className="mr-2 h-4 w-4 text-primary" />
								<div className="text-left">
									<div className="font-medium">{location.name}</div>
									<div className="text-xs text-muted-foreground">
										{location.address}
									</div>
								</div>
							</span>
						) : (
							<span className="text-muted-foreground">
								Select coffee shop...
							</span>
						)}

						<Icon
							name="chevron-down"
							className="ml-2 h-4 w-4 shrink-0 opacity-50"
						/>
					</Button>
					<CommandPreview
						open={isCommandOpen}
						setOpen={setIsCommandOpen}
						setLocation={setLocation}
					/>
				</div>
				<div className="space-y-2">
					<Label
						htmlFor="date"
						className="flex items-center text-sm font-medium"
					>
						<Icon name="calendar" className="mr-2 h-4 w-4 text-primary" />
						Start Time
					</Label>

					<Input
						id="date"
						type="datetime-local"
						value={date}
						onChange={(e) => setDate(e.target.value)}
						className="border-primary/20 focus:border-primary focus:ring-primary"
						required
					/>
				</div>

				<div className="space-y-2">
					<Label
						htmlFor="description"
						className="flex items-center text-sm font-medium"
					>
						<Icon name="document-text" className="mr-2 h-4 w-4 text-primary" />
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
						<Icon name="tag" className="mr-2 h-4 w-4 text-primary" />
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
				{isSubmitting ? <>Publishing...</> : 'Publish Meetup'}
			</Button>
		</div>
	)
}
