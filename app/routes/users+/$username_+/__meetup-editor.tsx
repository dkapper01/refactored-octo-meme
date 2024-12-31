// export function MeetupEditor() {
// 	return <div>Meetup Editor</div>
// }

import {
	FormProvider,
	// getFieldsetProps,
	getFormProps,
	getInputProps,
	// getTextareaProps,
	useForm,
	// type FieldMetadata,
} from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
// import {
// 	json,
// 	redirect,
// 	type ActionFunctionArgs,
// 	// type LoaderFunctionArgs,
// } from '@remix-run/node'

import { Form } from '@remix-run/react'
// import { useState } from 'react'
import { z } from 'zod'
// import CommandPreview from '#app/components/command-preveiw.tsx'
// import CreatableMultiselect from '#app/components/creatable-multiselect.tsx'
// import DateTimePicker from '#app/components/date-time-picker.tsx'
import { Field, TextareaField } from '#app/components/forms.tsx'
import { Button } from '#app/components/ui/button.tsx'
// import { Icon } from '#app/components/ui/icon.tsx'
// import { Label } from '#app/components/ui/label.tsx'
// import { Textarea } from '#app/components/ui/textarea.tsx'
// import { prisma } from '#app/utils/db.server.ts'
// import { type action } from './__meetup-editor.server'

// const initialTags = [
// 	{ value: 'social', label: 'Social' },
// 	{ value: 'tech', label: 'Tech' },
// 	{ value: 'sports', label: 'Sports' },
// 	{ value: 'education', label: 'Education' },
// ]

// interface MicoMeetupFormProps {
// 	onSubmit: (values: z.infer<typeof formSchema>) => void
// }

export const formSchema = z.object({
	title: z.string().min(3, {
		message: 'Title must be at least 3 characters.',
	}),
	description: z.string().min(10, {
		message: 'Description must be at least 10 characters.',
	}),
	// location: z.string({
	// 	required_error: 'Please select a location.',
	// }),
	// description: z.string().min(10, {
	// 	message: 'Description must be at least 10 characters.',
	// }),
	// tags: z
	// 	.array(
	// 		z.object({
	// 			value: z.string(),
	// 			label: z.string(),
	// 		}),
	// 	)
	// 	.min(1, {
	// 		message: 'Please select at least one tag.',
	// 	}),
	// startTime: z.date({
	// 	required_error: 'Please select a start time.',
	// }),
})

// export async function action({ request }: ActionFunctionArgs) {
// 	const formData = await request.formData()
// 	const title = formData.get('title')
// 	const description = formData.get('description')

// 	if (typeof title !== 'string' || typeof description !== 'string') {
// 		return json({ error: 'Invalid form data' }, { status: 400 })
// 	}
// 	// const result = parseWithZod(formData, { schema: formSchema })
// 	// console.log({ result })

// 	await prisma.meetup.create({
// 		data: {
// 			title: title,
// 			description: description,
// 			// result,
// 		},
// 	})

// 	return redirect('/')
// }

export function MeetupEditor() {
	// const actionData = useActionData<typeof action>()
	// console.log({ actionData })

	// const [title, setTitle] = useState('')
	// const [description, setDescription] = useState('')
	// const [location, setLocation] = useState({
	// 	name: '',
	// 	address: '',
	// })
	// const [isCommandOpen, setIsCommandOpen] = useState(false)
	// const [date, setDate] = useState(undefined)
	// const [startTime, setStartTime] = useState('')
	// const [endTime, setEndTime] = useState('')
	// const [tags, setTags] = useState('')
	// const [isSubmitting, setIsSubmitting] = useState(false)
	// const [tags, setTags] = useState(initialTags)

	const [form, fields] = useForm({
		id: 'meetup-form',
		// constraint: getZodConstraint(formSchema),
		// lastResult: actionData?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: formSchema })
		},
		defaultValue: {
			title: '',
			description: '',
		},
	})

	// const handleSubmit = async (e: React.FormEvent) => {
	// 	e.preventDefault()
	// 	setIsSubmitting(true)
	// 	// Simulate API call
	// 	await new Promise((resolve) => setTimeout(resolve, 1500))
	// 	console.log({
	// 		location,
	// 		date,
	// 		startTime,
	// 		endTime,
	// 		description,
	// 		tags,
	// 		maxAttendees,
	// 	})
	// }

	// const form = useForm<z.infer<typeof formSchema>>({
	// 	resolver: zodResolver(formSchema),
	// 	defaultValues: {
	// 		title: '',
	// 		location: '',
	// 		description: '',
	// 		tags: [],
	// 		startTime: new Date(),
	// 	},
	// })

	// function handleSubmit(values: z.infer<typeof formSchema>) {
	// 	const formattedValues = {
	// 		...values,
	// 		tags: values.tags.map((tag) => tag.value),
	// 	}
	// 	onSubmit(formattedValues)
	// 	form.reset()
	// }

	// const handleCreateTag = (inputValue: string) => {
	// 	const newTag = { value: inputValue.toLowerCase(), label: inputValue }
	// 	setTags((prevTags) => [...prevTags, newTag])
	// 	const currentTags = form.getValues('tags')
	// 	form.setValue('tags', [...currentTags, newTag], { shouldValidate: true })
	// 	return newTag
	// }

	return (
		<div className="absolute inset-0">
			<FormProvider context={form.context}>
				<Form
					method="post"
					className="space-y-6"
					{...getFormProps(form)}
					encType="multipart/form-data"
				>
					<div className="space-y-2">
						<Field
							labelProps={{ children: 'Title' }}
							inputProps={{
								...getInputProps(fields.title, { type: 'text' }),
								placeholder: 'Enter meetup title',
								className:
									'border-primary/20 focus:border-primary focus:ring-primary',
							}}
							errors={fields.title.errors}
						/>
						{/* </div>
					<div className="space-y-2"> */}
						<TextareaField
							labelProps={{ children: 'Description' }}
							textareaProps={{
								...getInputProps(fields.description, { type: 'text' }),
								placeholder: 'Write a short description of your meetup...',
								className:
									'min-h-[100px] border-primary/20 focus:border-primary focus:ring-primary',
							}}
							errors={fields.description.errors}
						/>
					</div>
					{/* <div className="space-y-2">
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
					/>
				</div> */}
					{/* <div className="space-y-2">
					<Label
						htmlFor="date"
						className="flex items-center text-sm font-medium"
					>
						Start Time
					</Label>
					<DateTimePicker date={date} setDate={setDate} />
				</div> */}

					{/* <div className="space-y-2">
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
				</div> */}
					{/* <div className="space-y-2">
					<Label
						htmlFor="tags"
						className="flex items-center text-sm font-medium"
					>
						Tags
					</Label>
					<CreatableMultiselect />
				</div> */}
					<Button
						type="submit"
						className="mt-10 w-full bg-primary text-primary-foreground hover:bg-primary/90"
						// disabled={isSubmitting}
						// onClick={handleSubmit}
					>
						Publish Meetup
					</Button>
					{/* <ErrorList id={form.errorId} errors={form.errors} /> */}
				</Form>
			</FormProvider>
		</div>
	)
}
