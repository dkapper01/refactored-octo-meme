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
import { useState } from 'react'
import { z } from 'zod'
// import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import CommandPreview from '#app/components/command-preveiw.tsx'
import DateTimePicker from '#app/components/date-time-picker.tsx'
import { floatingToolbarClassName } from '#app/components/floating-toolbar.tsx'
import { Field, TextareaField, ErrorList } from '#app/components/forms.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { Icon } from '#app/components/ui/icon'
import { Label } from '#app/components/ui/label.tsx'
import { StatusButton } from '#app/components/ui/status-button.tsx'
import { combineAddress } from '#app/utils/combine-address.ts'
import { useIsPending } from '#app/utils/misc.tsx'

import { type loader } from './__meetup-editor.server'

export const MeetupEditorSchema = z.object({
	id: z.string().optional(),
	title: z.string().min(3, {
		message: 'Title must be at least 3 characters.',
	}),
	description: z.string().min(10, {
		message: 'Description must be at least 10 characters.',
	}),
	locationId: z.string().min(1, {
		message: 'Please select a location.',
	}),
	// startTime: z.string().min(1, {
	// 	message: 'Please select a start time.',
	// }),
})

export function MeetupEditor({
	meetup,
}: {
	meetup?: SerializeFrom<
		Pick<Meetup, 'id' | 'title' | 'description'> & {
			location: {
				id: string
				name: string
				address: {
					street: string
					city: string
					state: string
					zip: string
				} | null
			} | null
		}
	>
}) {
	const data = useLoaderData<typeof loader>()

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
			locationId: meetup?.location?.id ?? '',
		},
	})
	const [date, setDate] = useState<Date | undefined>(undefined)
	const [openLocation, setOpenLocation] = useState(false)
	const [location, setLocation] = useState<{
		id?: string
		name: string
		address: string
	}>({ id: '', name: '', address: '' })

	const locationNotEmpty = location.name !== '' && location.address !== ''
	const address = meetup?.location?.address
		? combineAddress(meetup.location.address)
		: ''

	// useEffect(() => {
	// 	setLocation({
	// 		id: meetup?.location?.id ?? '',
	// 		name: meetup?.location?.name ?? '',
	// 		address: address,
	// 	})
	// }, [meetup?.location, address])

	return (
		<div className="relative min-h-[600px] rounded-2xl bg-white p-6 shadow-sm">
			<h1 className="text-2xl font-bold">Create a Meetup</h1>
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
					{location.id ? (
						<input
							type="hidden"
							name="locationId"
							value={location.id}
							className="h-10 w-full"
						/>
					) : null}
					<div className="">
						<Field
							labelProps={{ children: 'Title' }}
							inputProps={{
								...getInputProps(fields.title, { type: 'text' }),
								placeholder: 'Enter meetup title',
								className: 'mt-1',
							}}
							errors={fields.title.errors}
						/>
						<TextareaField
							labelProps={{ children: 'Description' }}
							textareaProps={{
								...getInputProps(fields.description, { type: 'text' }),
								placeholder: 'Write a short description of your meetup...',
								className: 'mt-1',
							}}
							errors={fields.description.errors}
						/>
						{/* </div>

					<div className="space-y-2"> */}
						<Label>Location</Label>
						<Button
							type="button"
							variant="outline"
							role="button"
							aria-expanded={openLocation}
							className={`mt-1 w-full justify-between ${
								fields.locationId.errors?.length ? 'border-destructive' : ''
							}`}
							onClick={(e) => {
								e.preventDefault()
								setOpenLocation(true)
							}}
						>
							{location.id ? (
								<span className="flex items-center">
									{/* <Icon name="map-pin" className="mr-2 h-4 w-4 text-primary" /> */}
									<img
										src={
											'https://images.unsplash.com/photo-1446226760091-cc85becf39b4?q=80&w=3474&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
										}
										className="mr-2 h-6 w-6 rounded-full"
									/>
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
						{/* Update to get locationId from setLocation */}
						<div className="min-h-[24px] px-4 pb-0 pt-1">
							<ErrorList errors={fields.locationId.errors} />
						</div>

						<CommandPreview
							locations={data.locations}
							open={openLocation}
							setOpen={setOpenLocation}
							setLocation={({ id, name, address }) =>
								setLocation({ id, name, address })
							}
						/>

						{location.id && (
							<>
								<Label>Time</Label>
								<DateTimePicker
									// locationId={location.id}
									hoursOfOperation={
										data?.locations?.find(
											(location) => location.id === location.id,
										)?.hoursOfOperation ?? []
									}
									date={date}
									setDate={setDate}
									// errors={fields.startTime.errors}
								/>
							</>
						)}
					</div>
				</Form>
				<div className={floatingToolbarClassName}>
					<Button
						variant="destructive"
						{...form.reset.getButtonProps()}
						onClick={() => setLocation({ id: '', name: '', address: '' })}
					>
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
