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
import { useState, useEffect } from 'react'
import { z } from 'zod'
// import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
// import CommandPreview from '#app/components/command-preveiw.tsx'
import DateTimePicker from '#app/components/date-time-picker.tsx'
import { floatingToolbarClassName } from '#app/components/floating-toolbar.tsx'
import { Field, TextareaField, ErrorList } from '#app/components/forms.tsx'
import CoffeeShopsCommand from '#app/components/location-command.tsx'
import { Button } from '#app/components/ui/button.tsx'
// import { Icon } from '#app/components/ui/icon'
import { Label } from '#app/components/ui/label.tsx'
import { StatusButton } from '#app/components/ui/status-button.tsx'
import { combineAddress } from '#app/utils/combine-address.ts'
import { useIsPending } from '#app/utils/misc.tsx'

import { type loader } from './__meetup-editor.server'

// const PLACEHOLDER_IMAGE =
// 	'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNODAgOTBIMTIwVjExMEg4MFY5MFoiIGZpbGw9IiM5Q0EzQUYiLz48cGF0aCBkPSJNNjUgNzBIMTM1VjEzMEg2NVY3MFoiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+'

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
	startTime: z.string().min(1, {
		message: 'Please select a start time.',
	}),
})

export function MeetupEditor({
	meetup,
}: {
	meetup?: SerializeFrom<
		Pick<Meetup, 'id' | 'title' | 'description' | 'startTime'> & {
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
	const actionData = useLoaderData<typeof loader>()
	console.log({ actionData })

	const isPending = useIsPending()

	const [form, fields] = useForm({
		id: 'meetup-form',
		constraint: getZodConstraint(MeetupEditorSchema),
		// lastResult: actionData,
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
			startTime: meetup?.startTime ?? '',
			locationId: meetup?.location?.id ?? '',
		},
	})
	const [date, setDate] = useState<Date>(
		meetup?.startTime ? new Date(meetup.startTime) : new Date(),
	)
	// const [openLocation, setOpenLocation] = useState(false)
	const [locationId, setLocationId] = useState('')

	const address = meetup?.location?.address
		? combineAddress(meetup.location.address)
		: ''

	useEffect(() => {
		if (meetup?.location) {
			setLocationId(meetup?.location?.id)
		}
	}, [meetup?.location, address])

	// console.log({ setLocationId })

	return (
		<div className="relative min-h-[700px] rounded-lg bg-white p-6 shadow-md">
			<h1 className="text-2xl font-bold">Create a Meetup</h1>
			<p className="text-sm text-muted-foreground">
				Each meetup lasts for one hour, and the maximum number of attendees is
				six.
			</p>
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
					{locationId ? (
						<input
							type="hidden"
							name="locationId"
							value={locationId}
							className="h-10 w-full"
						/>
					) : null}
					{date ? (
						<input type="hidden" name="startTime" value={date.toISOString()} />
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
						<Label>Location</Label>
						<CoffeeShopsCommand
							locations={actionData.locations}
							setLocationId={setLocationId}
						/>
						{/* <Button
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
									<img
										src={PLACEHOLDER_IMAGE}
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
						</Button> */}
						{/* Update to get locationId from setLocation */}
						<div className="min-h-[24px] px-4 pb-0 pt-1">
							<ErrorList errors={fields.locationId.errors} />
						</div>

						{/* <CommandPreview
							locations={actionData.locations}
							open={openLocation}
							setOpen={setOpenLocation}
							setLocation={({ id, name, address }) =>
								setLocation({ id, name, address })
							}
						/> */}

						{/* {location.id && ( */}
						<>
							<Label>Time</Label>
							<DateTimePicker
								// locationId={loc    ation.id}
								// hoursOfOperation={
								// 	data?.locations?.find(
								// 		(location) => location.id === location.id,
								// 	)?.hoursOfOperation ?? []
								// }
								date={date}
								setDate={setDate}
								// errors={fields.startTime.errors}
							/>
							{/* <input
									type="hidden"
									name="startTime"
									value={date.toISOString()}
								/> */}

							<div className="min-h-[24px] px-4 pb-0 pt-1">
								<ErrorList errors={fields.startTime.errors} />
							</div>
						</>
						{/* )} */}
					</div>
				</Form>
				<div className={floatingToolbarClassName}>
					<Button
						variant="destructive"
						{...form.reset.getButtonProps()}
						onClick={() => {
							setLocationId('')
							setDate(new Date())
						}}
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
