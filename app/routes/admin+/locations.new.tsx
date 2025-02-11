// External packages
import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { json, type ActionFunctionArgs } from '@remix-run/node'
import { Form, useActionData, useNavigation } from '@remix-run/react'
import { useId } from 'react'
import { z } from 'zod'

// Internal components
import { Field } from '#app/components/forms.tsx'
// import { Button } from '#app/components/ui/button.tsx'
import { StatusButton } from '#app/components/ui/status-button.tsx'

// Internal utilities
import { prisma } from '#app/utils/db.server.ts'
import { requireUserWithRole } from '#app/utils/permissions.server.ts'

const MAX_UPLOAD_SIZE = 1024 * 1024 * 3 // 3MB

const schema = z.object({
	name: z.string({ required_error: 'Name is required' }),
	street: z.string({ required_error: 'Street address is required' }),
	city: z.string({ required_error: 'City is required' }),
	state: z.string({ required_error: 'State is required' }),
	zip: z.string({ required_error: 'ZIP code is required' }),
	country: z.string().default('USA'),
	image: z
		.instanceof(File)
		.refine(
			(file) => file.size <= MAX_UPLOAD_SIZE,
			'File size must be less than 3MB',
		)
		.refine(
			(file) => ['image/jpeg', 'image/png', 'image/gif'].includes(file.type),
			'Only jpeg, png, and gif images are allowed',
		)
		.optional(),
	imageAltText: z.string().optional(),
})

export async function loader({ request }: ActionFunctionArgs) {
	await requireUserWithRole(request, 'admin')
	return json({})
}

export async function action({ request }: ActionFunctionArgs) {
	await requireUserWithRole(request, 'admin')
	const formData = await request.formData()
	const submission = parseWithZod(formData, { schema })

	if (submission.status !== 'success') {
		return json(submission.reply())
	}

	const { image, imageAltText, ...locationData } = submission.value

	try {
		const location = await prisma.location.create({
			data: locationData,
		})

		if (image && image instanceof File && image.size > 0) {
			const buffer = Buffer.from(await image.arrayBuffer())
			await prisma.locationImage.create({
				data: {
					blob: buffer,
					contentType: image.type,
					altText: imageAltText,
					locationId: location.id,
				},
			})
		}

		return json(
			submission.reply({
				resetForm: true,
			}),
		)
	} catch (error) {
		console.error('Error creating location:', error)
		return json(
			submission.reply({
				formErrors: ['Failed to create location. Please try again.'],
			}),
			{ status: 500 },
		)
	}
}

export default function NewLocationRoute() {
	const lastResult = useActionData<typeof action>()
	const navigation = useNavigation()
	const id = useId()
	const [form, fields] = useForm({
		id,
		lastResult,
		shouldValidate: 'onBlur',
		onValidate({ formData }) {
			return parseWithZod(formData, { schema })
		},
	})

	const isSubmitting = navigation.state === 'submitting'

	return (
		<div className="container mx-auto max-w-md p-6">
			<h1 className="mb-8 text-2xl font-bold">Add New Location</h1>
			<Form
				method="post"
				{...getFormProps(form)}
				className="space-y-6"
				encType="multipart/form-data"
			>
				<Field
					labelProps={{ children: 'Location Name' }}
					inputProps={{
						...getInputProps(fields.name, { type: 'text' }),
						placeholder: 'Enter location name',
					}}
					errors={fields.name.errors}
				/>

				<Field
					labelProps={{ children: 'Street Address' }}
					inputProps={{
						...getInputProps(fields.street, { type: 'text' }),
						placeholder: 'Enter street address',
					}}
					errors={fields.street.errors}
				/>

				<Field
					labelProps={{ children: 'City' }}
					inputProps={{
						...getInputProps(fields.city, { type: 'text' }),
						placeholder: 'Enter city',
					}}
					errors={fields.city.errors}
				/>

				<Field
					labelProps={{ children: 'State' }}
					inputProps={{
						...getInputProps(fields.state, { type: 'text' }),
						placeholder: 'Enter state',
					}}
					errors={fields.state.errors}
				/>

				<Field
					labelProps={{ children: 'ZIP Code' }}
					inputProps={{
						...getInputProps(fields.zip, { type: 'text' }),
						placeholder: 'Enter ZIP code',
					}}
					errors={fields.zip.errors}
				/>

				<Field
					labelProps={{ children: 'Country' }}
					inputProps={{
						...getInputProps(fields.country, { type: 'text' }),
						defaultValue: 'USA',
						placeholder: 'Enter country',
					}}
					errors={fields.country.errors}
				/>

				<div className="space-y-2">
					<Field
						labelProps={{ children: 'Location Image' }}
						inputProps={{
							...getInputProps(fields.image, { type: 'file' }),
							accept: 'image/jpeg,image/png,image/gif',
						}}
						errors={fields.image.errors}
					/>
					<Field
						labelProps={{ children: 'Image Alt Text' }}
						inputProps={{
							...getInputProps(fields.imageAltText, { type: 'text' }),
							placeholder: 'Describe the image',
						}}
						errors={fields.imageAltText.errors}
					/>
					<p className="text-sm text-muted-foreground">
						Maximum file size: 3MB. Supported formats: JPEG, PNG, GIF
					</p>
				</div>

				<div className="mt-8">
					<StatusButton
						type="submit"
						status={
							isSubmitting
								? 'pending'
								: form.status === 'success'
									? 'success'
									: 'idle'
						}
						className="w-full"
					>
						Save New Location
					</StatusButton>
				</div>

				{form.status === 'success' && (
					<p className="mt-4 text-center text-green-600">
						Location added successfully!
					</p>
				)}
			</Form>
		</div>
	)
}
