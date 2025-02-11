// External packages
import {
	json,
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
} from '@remix-run/node'
import { useLoaderData, Form } from '@remix-run/react'
import { useState } from 'react'
// Internal utilities
import { prisma } from '#app/utils/db.server.ts'
import { requireUserWithPermission } from '#app/utils/permissions.server.ts'

type User = {
	id: string
	email: string
	username: string
	name: string | null
	roles: Array<{
		id: string
		name: string
	}>
}

// type Role = {
// 	id: string
// 	name: string
// 	description: string
// }

export async function loader({ request }: LoaderFunctionArgs) {
	await requireUserWithPermission(request, 'read:user:any')

	const users = await prisma.user.findMany({
		select: {
			id: true,
			email: true,
			username: true,
			name: true,
			roles: {
				select: {
					id: true,
					name: true,
				},
			},
		},
		orderBy: { createdAt: 'desc' },
	})

	const roles = await prisma.role.findMany({
		select: {
			id: true,
			name: true,
			description: true,
		},
	})

	return json({ users, roles })
}

export async function action({ request }: ActionFunctionArgs) {
	await requireUserWithPermission(request, 'update:user:any')

	const formData = await request.formData()
	const userId = formData.get('userId') as string
	const roleIds = formData.getAll('roles') as string[]

	await prisma.user.update({
		where: { id: userId },
		data: {
			roles: {
				set: roleIds.map((id) => ({ id })),
			},
		},
	})

	return json({ success: true })
}

export default function AdminUsersRoute() {
	const { users, roles } = useLoaderData<typeof loader>()
	const [editingUserId, setEditingUserId] = useState<string | null>(null)

	return (
		<div className="container mx-auto py-8">
			<h1 className="mb-6 text-2xl font-bold">User Management</h1>

			<div className="overflow-hidden rounded-lg bg-white shadow-md">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>
							<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
								User
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
								Email
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
								Roles
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-200 bg-white">
						{users.map((user: User) => (
							<tr key={user.id}>
								<td className="whitespace-nowrap px-6 py-4">
									<div className="flex items-center">
										<div>
											<div className="text-sm font-medium text-gray-900">
												{user.name || user.username}
											</div>
											<div className="text-sm text-gray-500">
												@{user.username}
											</div>
										</div>
									</div>
								</td>
								<td className="whitespace-nowrap px-6 py-4">
									<div className="text-sm text-gray-900">{user.email}</div>
								</td>
								<td className="whitespace-nowrap px-6 py-4">
									{editingUserId === user.id ? (
										<Form method="post" className="flex gap-2">
											<input type="hidden" name="userId" value={user.id} />
											<div className="flex flex-wrap gap-2">
												{roles.map((role) => (
													<label
														key={role.id}
														className="flex items-center gap-1"
													>
														<input
															type="checkbox"
															name="roles"
															value={role.id}
															defaultChecked={user.roles.some(
																(r) => r.id === role.id,
															)}
															className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
														/>
														<span className="text-sm text-gray-700">
															{role.name}
														</span>
													</label>
												))}
											</div>
											<div className="flex gap-2">
												<button
													type="submit"
													className="inline-flex items-center rounded border border-transparent bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
												>
													Save
												</button>
												<button
													type="button"
													onClick={() => setEditingUserId(null)}
													className="inline-flex items-center rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
												>
													Cancel
												</button>
											</div>
										</Form>
									) : (
										<div className="flex flex-wrap gap-2">
											{user.roles.map((role) => (
												<span
													key={role.id}
													className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
												>
													{role.name}
												</span>
											))}
										</div>
									)}
								</td>
								<td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
									{editingUserId !== user.id && (
										<button
											className="text-indigo-600 hover:text-indigo-900"
											onClick={() => setEditingUserId(user.id)}
										>
											Edit
										</button>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	)
}
