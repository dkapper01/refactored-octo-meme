import { Form } from '@remix-run/react'
import { useState } from 'react'
import CommandPreview from '#app/components/command-preveiw.tsx'
import CreatableMultiselect from '#app/components/creatable-multiselect.tsx'
import DateTimePicker from '#app/components/date-time-picker.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { Input } from '#app/components/ui/input.tsx'
import { Label } from '#app/components/ui/label.tsx'
import { Textarea } from '#app/components/ui/textarea.tsx'

export default function HostRoute() {
	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')
	const [location, setLocation] = useState({
		name: '',
		address: '',
	})
	const [isCommandOpen, setIsCommandOpen] = useState(false)
	// const [date, setDate] = useState<Date | undefined>(undefined)

	return (
		<div className="container mx-auto mt-10 max-w-2xl p-4">
			<Form method="post" className="space-y-6">
				<div className="space-y-2">
					<Label
						htmlFor="Title"
						className="flex items-center text-sm font-medium"
					>
						Title
					</Label>
					<Input
						id="title"
						name="title"
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
						locations={[]}
					/>
				</div>
				<div className="space-y-2">
					<Label
						htmlFor="date"
						className="flex items-center text-sm font-medium"
					>
						Start Time
					</Label>
					{/* <DateTimePicker date={date} setDate={setDate} /> */}
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
						name="description"
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
						Tags
					</Label>
					<CreatableMultiselect />
				</div>
				<Button
					type="submit"
					className="mt-10 w-full bg-primary text-primary-foreground hover:bg-primary/90"
				>
					Publish Meetup
				</Button>
			</Form>
		</div>
	)
}
