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
import { type Meetup } from '@prisma/client'
import {
	type SerializeFrom,
	// json,
	// type LoaderFunctionArgs,
} from '@remix-run/node'

import {
	Form,
	useLoaderData,
	// useActionData,
	// useIsPending,
} from '@remix-run/react'
// import { useState } from 'react'
import { z } from 'zod'
import CreatableMultiselect from '#app/components/creatable-multiselect.tsx'
import { floatingToolbarClassName } from '#app/components/floating-toolbar.tsx'

import { Field, TextareaField } from '#app/components/forms.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { Label } from '#app/components/ui/label.tsx'
import { StatusButton } from '#app/components/ui/status-button.tsx'
import { useIsPending } from '#app/utils/misc.tsx'

import { type loader } from './__meetup-editor.server'

// import { Icon } from '#app/components/ui/icon.tsx'
// import { Textarea } from '#app/components/ui/textarea.tsx'
// import CommandPreview from '#app/components/command-preveiw.tsx'
// import DateTimePicker from '#app/components/date-time-picker.tsx'

export const MeetupEditorSchema = z.object({
	id: z.string().optional(),
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

export function MeetupEditor({
	meetup,
}: {
	meetup?: SerializeFrom<Pick<Meetup, 'id' | 'title' | 'description'>>
}) {
	const { topics = [] } = useLoaderData<typeof loader>()
	const isPending = useIsPending()

	const [form, fields] = useForm({
		id: 'meetup-form',
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: MeetupEditorSchema })
		},
		defaultValue: {
			id: meetup?.id,
			title: meetup?.title ?? '',
			description: meetup?.description ?? '',
		},
	})

	// const handleSubmit = async (e: React.FormEvent) => {
	// 	e.preventDefault()
	// 	setIsSubmitting(true)
	// 	// Simulate API call
	// 	await new Promise((resolve) => setTimeout(resolve, 1500))

	// const form = useForm<z.infer<typeof MeetupEditorSchema>>({
	// 	resolver: zodResolver(MeetupEditorSchema),
	// 	defaultValues: {
	// 		title: '',
	// 		location: '',
	// 		description: '',
	// 		tags: [],
	// 		startTime: new Date(),
	// 	},
	// })

	// function handleSubmit(values: z.infer<typeof MeetupEditorSchema>) {
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
					{meetup ? <input type="hidden" name="id" value={meetup.id} /> : null}
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
					<div className="space-y-2">
						<Label
							htmlFor="tags"
							className="flex items-center text-sm font-medium"
						>
							Tags
						</Label>
						<CreatableMultiselect topics={topics} />
					</div>
					{/* <Button
						type="submit"
						className="mt-10 w-full bg-primary text-primary-foreground hover:bg-primary/90"
						// disabled={isSubmitting}
						// onClick={handleSubmit}
					>
						Publish Meetup
					</Button> */}
					{/* <ErrorList id={form.errorId} errors={form.errors} /> */}
				</Form>
				<div className={floatingToolbarClassName}>
					<Button variant="destructive" {...form.reset.getButtonProps()}>
						Reset
					</Button>
					<StatusButton
						form={form.id}
						type="submit"
						disabled={isPending}
						status={isPending ? 'pending' : 'idle'}
					>
						Submit
					</StatusButton>
				</div>
			</FormProvider>
		</div>
	)
}
