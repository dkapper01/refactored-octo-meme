import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { json, type ActionFunctionArgs } from '@remix-run/node'
import { Form, useActionData, useNavigation } from '@remix-run/react'
import { useId } from 'react'
import { z } from 'zod'
import { requireUserWithRole } from '#app/utils/permissions.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { Field } from '#app/components/forms.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { StatusButton } from '#app/components/ui/status-button.tsx'

const schema = z.object({
	name: z.string({ required_error: 'Name is required' }),
	street: z.string({ required_error: 'Street address is required' }),
	city: z.string({ required_error: 'City is required' }),
	state: z.string({ required_error: 'State is required' }),
	zip: z.string({ required_error: 'ZIP code is required' }),
	country: z.string().default('USA'),
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

	await prisma.location.create({
		data: submission.value,
	})

	return json(
		submission.reply({
			resetForm: true,
		}),
	)
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
			<Form method="post" {...getFormProps(form)} className="space-y-6">
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
