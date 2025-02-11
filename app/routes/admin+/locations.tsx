import {
	json,
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
} from '@remix-run/node'
import {
	useLoaderData,
	Form,
	useNavigation,
	isRouteErrorResponse,
	useRouteError,
} from '@remix-run/react'
import { useState } from 'react'
import { prisma } from '../../utils/db.server'
import { requireUserWithPermission } from '../../utils/permissions.server'

type Location = {
	id: string
	name: string
	street: string
	city: string
	state: string
	zip: string
	country: string
	image?: {
		id: string
		altText?: string | null
	} | null
}

export async function loader({ request }: LoaderFunctionArgs) {
	try {
		await requireUserWithPermission(request, 'read:meetup:any')

		const locations = await prisma.location.findMany({
			select: {
				id: true,
				name: true,
				street: true,
				city: true,
				state: true,
				zip: true,
				country: true,
				image: {
					select: {
						id: true,
						altText: true,
					},
				},
			},
			orderBy: { name: 'asc' },
		})

		return json({ locations })
	} catch (error) {
		if (isRouteErrorResponse(error)) {
			throw error
		}
		const message =
			error instanceof Error
				? error.message
				: 'An error occurred loading locations'
		throw json(
			{ message },
			{
				status: 403,
				statusText: 'Unauthorized',
			},
		)
	}
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	const intent = formData.get('intent')

	if (intent === 'create') {
		await requireUserWithPermission(request, 'create:meetup:any')

		const name = formData.get('name') as string
		const street = formData.get('street') as string
		const city = formData.get('city') as string
		const state = formData.get('state') as string
		const zip = formData.get('zip') as string
		const country = formData.get('country') as string

		await prisma.location.create({
			data: {
				name,
				street,
				city,
				state,
				zip,
				country,
			},
		})
	} else if (intent === 'delete') {
		await requireUserWithPermission(request, 'delete:meetup:any')

		const locationId = formData.get('locationId') as string
		await prisma.location.delete({
			where: { id: locationId },
		})
	} else if (intent === 'edit') {
		await requireUserWithPermission(request, 'update:meetup:any')

		const locationId = formData.get('locationId') as string
		const name = formData.get('name') as string
		const street = formData.get('street') as string
		const city = formData.get('city') as string
		const state = formData.get('state') as string
		const zip = formData.get('zip') as string
		const country = formData.get('country') as string

		await prisma.location.update({
			where: { id: locationId },
			data: {
				name,
				street,
				city,
				state,
				zip,
				country,
			},
		})
	}

	return json({ success: true })
}

export function ErrorBoundary() {
	const error = useRouteError()

	if (isRouteErrorResponse(error)) {
		if (error.status === 403) {
			return (
				<div className="container mx-auto py-8">
					<div className="rounded-lg bg-red-50 p-4">
						<div className="flex">
							<div className="flex-shrink-0">
								<svg
									className="h-5 w-5 text-red-400"
									viewBox="0 0 20 20"
									fill="currentColor"
									aria-hidden="true"
								>
									<path
										fillRule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
							<div className="ml-3">
								<h3 className="text-sm font-medium text-red-800">
									Access Denied
								</h3>
								<div className="mt-2 text-sm text-red-700">
									<p>
										You don't have permission to access this page. Please
										contact your administrator.
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			)
		}
	}

	return (
		<div className="container mx-auto py-8">
			<div className="rounded-lg bg-red-50 p-4">
				<div className="flex">
					<div className="flex-shrink-0">
						<svg
							className="h-5 w-5 text-red-400"
							viewBox="0 0 20 20"
							fill="currentColor"
							aria-hidden="true"
						>
							<path
								fillRule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
								clipRule="evenodd"
							/>
						</svg>
					</div>
					<div className="ml-3">
						<h3 className="text-sm font-medium text-red-800">Error</h3>
						<div className="mt-2 text-sm text-red-700">
							<p>An unexpected error occurred. Please try again later.</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default function AdminLocationsRoute() {
	const { locations } = useLoaderData<typeof loader>()
	const navigation = useNavigation()
	const [editingLocationId, setEditingLocationId] = useState<string | null>(
		null,
	)
	const [isCreating, setIsCreating] = useState(false)
	const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

	const isSubmitting = navigation.state === 'submitting'

	const handleImageError = (locationId: string) => {
		setImageErrors((prev) => ({ ...prev, [locationId]: true }))
	}

	return (
		<div className="container mx-auto py-8">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-2xl font-bold">Location Management</h1>
				<button
					onClick={() => setIsCreating(true)}
					className="inline-flex items-center rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
				>
					Add Location
				</button>
			</div>

			{isCreating && (
				<div className="mb-8 rounded-lg bg-white p-6 shadow-md">
					<h2 className="mb-4 text-xl font-semibold">Add New Location</h2>
					<Form method="post" className="space-y-4">
						<input type="hidden" name="intent" value="create" />
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div>
								<label
									htmlFor="name"
									className="block text-sm font-medium text-gray-700"
								>
									Name
								</label>
								<input
									type="text"
									name="name"
									id="name"
									required
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
								/>
							</div>
							<div>
								<label
									htmlFor="street"
									className="block text-sm font-medium text-gray-700"
								>
									Street
								</label>
								<input
									type="text"
									name="street"
									id="street"
									required
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
								/>
							</div>
							<div>
								<label
									htmlFor="city"
									className="block text-sm font-medium text-gray-700"
								>
									City
								</label>
								<input
									type="text"
									name="city"
									id="city"
									required
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
								/>
							</div>
							<div>
								<label
									htmlFor="state"
									className="block text-sm font-medium text-gray-700"
								>
									State
								</label>
								<input
									type="text"
									name="state"
									id="state"
									required
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
								/>
							</div>
							<div>
								<label
									htmlFor="zip"
									className="block text-sm font-medium text-gray-700"
								>
									ZIP Code
								</label>
								<input
									type="text"
									name="zip"
									id="zip"
									required
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
								/>
							</div>
							<div>
								<label
									htmlFor="country"
									className="block text-sm font-medium text-gray-700"
								>
									Country
								</label>
								<input
									type="text"
									name="country"
									id="country"
									defaultValue="USA"
									required
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
								/>
							</div>
						</div>
						<div className="flex justify-end gap-2">
							<button
								type="button"
								onClick={() => setIsCreating(false)}
								className="inline-flex items-center rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={isSubmitting}
								className="inline-flex items-center rounded border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
							>
								{isSubmitting ? 'Saving...' : 'Save'}
							</button>
						</div>
					</Form>
				</div>
			)}

			<div className="overflow-hidden rounded-lg bg-white shadow-md">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>
							<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
								Image
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
								Location
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
								Address
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-200 bg-white">
						{locations.map((location: Location) => (
							<tr key={location.id}>
								{editingLocationId === location.id ? (
									<td colSpan={4} className="px-6 py-4">
										<Form method="post" className="space-y-4">
											<input type="hidden" name="intent" value="edit" />
											<input
												type="hidden"
												name="locationId"
												value={location.id}
											/>
											<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
												<div>
													<label
														htmlFor="name"
														className="block text-sm font-medium text-gray-700"
													>
														Name
													</label>
													<input
														type="text"
														name="name"
														id="name"
														defaultValue={location.name}
														required
														className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
													/>
												</div>
												<div>
													<label
														htmlFor="street"
														className="block text-sm font-medium text-gray-700"
													>
														Street
													</label>
													<input
														type="text"
														name="street"
														id="street"
														defaultValue={location.street}
														required
														className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
													/>
												</div>
												<div>
													<label
														htmlFor="city"
														className="block text-sm font-medium text-gray-700"
													>
														City
													</label>
													<input
														type="text"
														name="city"
														id="city"
														defaultValue={location.city}
														required
														className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
													/>
												</div>
												<div>
													<label
														htmlFor="state"
														className="block text-sm font-medium text-gray-700"
													>
														State
													</label>
													<input
														type="text"
														name="state"
														id="state"
														defaultValue={location.state}
														required
														className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
													/>
												</div>
												<div>
													<label
														htmlFor="zip"
														className="block text-sm font-medium text-gray-700"
													>
														ZIP Code
													</label>
													<input
														type="text"
														name="zip"
														id="zip"
														defaultValue={location.zip}
														required
														className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
													/>
												</div>
												<div>
													<label
														htmlFor="country"
														className="block text-sm font-medium text-gray-700"
													>
														Country
													</label>
													<input
														type="text"
														name="country"
														id="country"
														defaultValue={location.country}
														required
														className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
													/>
												</div>
											</div>
											<div className="flex justify-end gap-2">
												<button
													type="button"
													onClick={() => setEditingLocationId(null)}
													className="inline-flex items-center rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
												>
													Cancel
												</button>
												<button
													type="submit"
													disabled={isSubmitting}
													className="inline-flex items-center rounded border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
												>
													{isSubmitting ? 'Saving...' : 'Save'}
												</button>
											</div>
										</Form>
									</td>
								) : (
									<>
										<td className="px-6 py-4">
											<div className="h-20 w-20 overflow-hidden rounded-lg">
												<img
													src={
														imageErrors[location.id]
															? '/resources/placeholder'
															: `/resources/location-images/${location.id}`
													}
													alt={location.name}
													className="h-full w-full object-cover"
													onError={() => handleImageError(location.id)}
												/>
											</div>
										</td>
										<td className="whitespace-nowrap px-6 py-4">
											<div className="text-sm font-medium text-gray-900">
												{location.name}
											</div>
										</td>
										<td className="px-6 py-4">
											<div className="text-sm text-gray-900">
												{location.street}
											</div>
											<div className="text-sm text-gray-500">
												{location.city}, {location.state} {location.zip}
											</div>
											<div className="text-sm text-gray-500">
												{location.country}
											</div>
										</td>
										<td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
											<div className="flex gap-2">
												<button
													onClick={() => setEditingLocationId(location.id)}
													className="text-indigo-600 hover:text-indigo-900"
												>
													Edit
												</button>
												<Form method="post" className="inline">
													<input type="hidden" name="intent" value="delete" />
													<input
														type="hidden"
														name="locationId"
														value={location.id}
													/>
													<button
														type="submit"
														className="text-red-600 hover:text-red-900"
														onClick={(e) => {
															if (
																!confirm(
																	'Are you sure you want to delete this location?',
																)
															) {
																e.preventDefault()
															}
														}}
													>
														Delete
													</button>
												</Form>
											</div>
										</td>
									</>
								)}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	)
}
