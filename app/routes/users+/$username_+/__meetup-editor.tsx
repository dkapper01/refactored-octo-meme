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
import { floatingToolbarClassName } from '#app/components/floating-toolbar.tsx'
import { Field, TextareaField } from '#app/components/forms.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { Icon } from '#app/components/ui/icon'
import { StatusButton } from '#app/components/ui/status-button.tsx'
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
})

export function MeetupEditor({
	meetup,
}: {
	meetup?: SerializeFrom<
		Pick<Meetup, 'id' | 'title' | 'description'> & {
			location: { id: string; name: string } | null
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

	const [openLocation, setOpenLocation] = useState(false)
	const [location, setLocation] = useState<{
		id?: string
		name: string
		address: string
	}>({ id: '', name: '', address: '' })

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
						{/* Update to get locationId from setLocation */}
						{location.name ? (
							<input type="hidden" name="locationId" value={location.id} />
						) : null}

						{fields.locationId.errors?.length
							? fields.locationId.errors.map((err, i) => (
									<p key={i} className="mt-1 text-sm text-red-500">
										{err}
									</p>
								))
							: null}

						<CommandPreview
							locations={data.locations}
							open={openLocation}
							setOpen={setOpenLocation}
							setLocation={({ id, name, address }) =>
								setLocation({ id, name, address })
							}
						/>
					</div>
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
