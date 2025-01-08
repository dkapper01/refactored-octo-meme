import {
	FormProvider,
	getFormProps,
	getInputProps,
	useForm,
} from '@conform-to/react'

import { getZodConstraint, parseWithZod } from '@conform-to/zod'

import { type Meetup } from '@prisma/client'
import { type SerializeFrom } from '@remix-run/node'

import {
	Form,
	useLoaderData,
	// useActionData
} from '@remix-run/react'
import React, { useState } from 'react'
import { z } from 'zod'
// import CreatableMultiselect from '#app/components/creatable-multiselect.tsx'
// import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import CommandPreview from '#app/components/command-preveiw.tsx'
import { floatingToolbarClassName } from '#app/components/floating-toolbar.tsx'
import { Field, TextareaField } from '#app/components/forms.tsx'
import { Button } from '#app/components/ui/button.tsx'
// import {
// 	Command,
// 	CommandEmpty,
// 	CommandInput,
// 	CommandItem,
// 	CommandList,
// } from '#app/components/ui/command'
import { Icon } from '#app/components/ui/icon'
// import { Label } from '#app/components/ui/label.tsx'
// import {
// 	Popover,
// 	PopoverContent,
// 	PopoverTrigger,
// } from '#app/components/ui/popover'
import { StatusButton } from '#app/components/ui/status-button.tsx'
import {
	// cn,
	useIsPending,
} from '#app/utils/misc.tsx'

import { type loader } from './__meetup-editor.server'

// const TopicSchema = z.object({
// 	id: z.string().optional(),
// 	name: z.string(),
// })

export const MeetupEditorSchema = z.object({
	id: z.string().optional(),
	title: z.string().min(3, {
		message: 'Title must be at least 3 characters.',
	}),
	description: z.string().min(10, {
		message: 'Description must be at least 10 characters.',
	}),
	// topics: z.array(TopicSchema).min(1, {
	// 	message: 'Please select at least one topic.',
	// }),
})

export function MeetupEditor({
	meetup,
}: {
	meetup?: SerializeFrom<
		Pick<Meetup, 'id' | 'title' | 'description'> & {
			topics: Array<{ id: string; name: string }>
		}
	>
}) {
	const data = useLoaderData<typeof loader>()

	// const actionData = useActionData<typeof action>()

	const isPending = useIsPending()

	const [form, fields] = useForm({
		id: 'meetup-form',
		constraint: getZodConstraint(MeetupEditorSchema),
		// lastResult: actionData?.result,
		// shouldValidate: 'onBlur',
		onValidate({ formData }) {
			return parseWithZod(formData, {
				schema: MeetupEditorSchema,
			})
		},
		defaultValue: {
			id: meetup?.id,
			title: meetup?.title ?? '',
			description: meetup?.description ?? '',
			// topics: meetup?.topics ?? [{}],
		},
	})

	// const [open, setOpen] = useState(false)
	// const [inputValue, setInputValue] = useState('')
	// const [selectedValues, setSelectedValues] = useState<
	// 	Array<{ id: string; name: string }>
	// >(meetup?.topics ?? [])
	// const [items, setItems] = useState(topics)

	// function onSelect(item: { id: string; name: string }) {
	// 	setSelectedValues((prev) =>
	// 		prev.some((i) => i.id === item.id)
	// 			? prev.filter((i) => i.id !== item.id)
	// 			: [...prev, item],
	// 	)
	// 	setOpen(false)
	// }

	// function onCreate(value: string) {
	// 	// For demonstration, just use the same string for `id` & `name`
	// 	// In reality, you might do something like:
	// 	// const generatedId = nanoid();
	// 	// { id: generatedId, name: value }
	// 	const newItem = { id: value, name: value }

	// 	setItems((prev) => [...prev, newItem])
	// 	setSelectedValues((prev) => [...prev, newItem])
	// 	setInputValue('')
	// 	setOpen(false)
	// }

	const [openLocation, setOpenLocation] = useState(false)
	const [location, setLocation] = useState({ name: '', address: '' })

	const locationNotEmpty = location.name !== '' && location.address !== ''

	return (
		<div className="absolute inset-0">
			<FormProvider context={form.context}>
				<Form
					method="post"
					className="space-y-6"
					{...getFormProps(form)}
					encType="multipart/form-data"
				>
					{/*
					This hidden submit button is here to ensure that when the user hits
					"enter" on an input field, the primary form function is submitted
					rather than the first button in the form (which is delete/add image).
				*/}
					<button type="submit" className="hidden" />

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

					<div className="space-y-2">
						<Button
							variant="outline"
							role="button"
							aria-expanded={openLocation}
							className="w-full justify-between"
							onClick={() => setOpenLocation(true)}
						>
							{locationNotEmpty ? (
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
							locations={data.locations}
							open={openLocation}
							setOpen={setOpenLocation}
							setLocation={setLocation}
						/>
					</div>

					{/* <div className="space-y-2">
						<Label
							htmlFor="topics"
							className="flex items-center text-sm font-medium"
						>
							Tags
						</Label>

						{selectedValues.map((topic, index) => (
							<React.Fragment key={topic.id}>
								<input
									type="hidden"
									name={`topics[${index}].id`}
									value={topic.id}
								/>
								<input
									type="hidden"
									name={`topics[${index}].name`}
									value={topic.name}
								/>
							</React.Fragment>
						))}

						<Popover open={open} onOpenChange={setOpen}>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									role="combobox"
									aria-expanded={open}
									className="w-full justify-between"
								>
									{selectedValues.length > 0
										? items
												.filter((item) =>
													selectedValues.some((i) => i.id === item.id),
												)
												.map((item) => item.name)
												.join(', ')
										: 'Select or create...'}
									<Icon
										name="chevron-up-down"
										className="ml-2 h-4 w-4 shrink-0 opacity-50"
									/>
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-80 p-0">
								<Command>
									<CommandInput
										placeholder="Search or create..."
										value={inputValue}
										onValueChange={setInputValue}
									/>

									<CommandEmpty>
										{inputValue && (
											<Button
												variant="ghost"
												className="w-full justify-start"
												onClick={() => onCreate(inputValue)}
											>
												<Icon name="plus-circle" className="mr-2 h-4 w-4" />
												Create "{inputValue}"
											</Button>
										)}
									</CommandEmpty>
									<CommandList>
										{(items || []).map((item) => (
											<CommandItem
												key={item.id}
												value={item.name}
												onSelect={() => {
													onSelect(item)
												}}
											>
												<Icon
													name="check"
													className={cn(
														'mr-2',
														selectedValues.some((i) => i.id === item.id)
															? 'opacity-100'
															: 'opacity-0',
													)}
												/>
												{item.name}
											</CommandItem>
										))}
									</CommandList>
								</Command>
							</PopoverContent>
						</Popover>
					</div>
					{fields.topics.errors?.length
						? fields.topics.errors.map((err, i) => (
								<p key={i} className="mt-1 text-sm text-red-500">
									{err}
								</p>
							))
						: null} */}
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

// export function ErrorBoundary() {
// 	return (
// 		<GeneralErrorBoundary
// 			statusHandlers={{
// 				404: ({ params }) => (
// 					<p>No note with the id "{params.noteId}" exists</p>
// 				),
// 			}}
// 		/>
// 	)
// }
