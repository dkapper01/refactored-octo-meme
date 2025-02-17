import {
	FormProvider,
	getFormProps,
	getInputProps,
	useForm,
} from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { type Meetup, type Location } from '@prisma/client'
import { type SerializeFrom } from '@remix-run/node'
import { Form, useLoaderData, useActionData } from '@remix-run/react'
import { useState } from 'react'
import { z } from 'zod'
import DateTimePicker from '#app/components/date-time-picker.tsx'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { floatingToolbarClassName } from '#app/components/floating-toolbar.tsx'
import { Field, TextareaField, ErrorList } from '#app/components/forms.tsx'
import LocationPicker from '#app/components/location-picker.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { Label } from '#app/components/ui/label.tsx'
import { StatusButton } from '#app/components/ui/status-button.tsx'
import { useIsPending } from '#app/utils/misc.tsx'

import { type loader, type action } from './__meetup-editor.server'

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

// TODO: Add a time picker

export function MeetupEditor({
	meetup,
}: {
	meetup?: SerializeFrom<
		Pick<Meetup, 'id' | 'title' | 'description' | 'startTime'> & {
			location: Pick<
				Location,
				'id' | 'name' | 'street' | 'city' | 'state' | 'zip'
			>
		}
	>
}) {
	const loaderData = useLoaderData<typeof loader>()
	const lastResult = useActionData<typeof action>()
	const [date, setDate] = useState<Date>(
		meetup?.startTime ? new Date(meetup.startTime) : new Date(),
	)

	const isPending = useIsPending()

	const [form, fields] = useForm({
		id: 'meetup-form',
		lastResult: lastResult?.result,
		constraint: getZodConstraint(MeetupEditorSchema),
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
			startTime: meetup?.startTime ?? '',
		},
	})

	return (
		<div className="relative min-h-[700px] rounded-lg bg-white p-6 shadow-md">
			<h1 className="text-2xl font-bold">Create a Meetup</h1>
			<p className="text-sm text-muted-foreground">
				Each meetup lasts for one hour, and the maximum number of attendees is
				six.
			</p>
			<FormProvider context={form.context}>
				<Form method="post" className="space-y-6" {...getFormProps(form)}>
					{/*
					This hidden submit button is here to ensure that when the user hits
					"enter" on an input field, the primary form function is submitted
					rather than the first button in the form (which is delete/add image).
				*/}
					<button type="submit" className="hidden" />

					{meetup ? <input type="hidden" name="id" value={meetup.id} /> : null}
					<input type="hidden" name="startTime" value={date.toISOString()} />
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
						<LocationPicker
							meta={fields.locationId}
							locations={loaderData?.locations}
							location={meetup?.location || null}
						/>

						<div className="min-h-[24px] px-4 pb-0 pt-1">
							<ErrorList errors={fields.locationId.errors} />
						</div>

						<Label>Time</Label>
						<DateTimePicker date={date} setDate={setDate} />

						<div className="min-h-[24px] px-4 pb-0 pt-1">
							<ErrorList errors={fields.startTime.errors} />
						</div>
					</div>
				</Form>
				<div className={floatingToolbarClassName}>
					<Button
						variant="destructive"
						{...form.reset.getButtonProps()}
						// onClick={() => {
						// 	setDate(new Date())
						// }}
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

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				404: ({ params }) => (
					<p>No note with the id "{params.noteId}" exists</p>
				),
			}}
		/>
	)
}
