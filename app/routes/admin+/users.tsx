import { useForm, getFormProps, getInputProps } from '@conform-to/react'
import { parseWithZod, getZodConstraint } from '@conform-to/zod'
import {
	json,
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
} from '@remix-run/node'
import { useLoaderData, Form, useActionData } from '@remix-run/react'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { z } from 'zod'
import { ErrorList } from '#app/components/forms.tsx'
import { prisma } from '#app/utils/db.server.ts'
import { requireUserWithPermission } from '#app/utils/permissions.server.ts'

const CreateRoleSchema = z.object({
	intent: z.literal('createRole'),
	name: z.string().min(1, 'Name is required'),
	description: z.string().min(1, 'Description is required'),
})

const UpdateRolesSchema = z.object({
	intent: z.literal('updateRoles'),
	userId: z.string().min(1),
	roles: z.array(z.string()),
})

const UpdatePermissionsSchema = z.object({
	intent: z.literal('updatePermissions'),
	roleId: z.string().min(1),
	permissionId: z.string().optional(),
	action: z.string().min(1),
	entity: z.string().min(1),
	access: z.string().min(1),
})

const DeletePermissionSchema = z.object({
	intent: z.literal('deletePermission'),
	permissionId: z.string().min(1),
})

const DeleteRoleSchema = z.object({
	intent: z.literal('deleteRole'),
	userId: z.string().min(1),
	roleId: z.string().min(1),
})

const ActionSchema = z.discriminatedUnion('intent', [
	CreateRoleSchema,
	UpdateRolesSchema,
	UpdatePermissionsSchema,
	DeletePermissionSchema,
	DeleteRoleSchema,
])

type User = {
	id: string
	email: string
	username: string
	name: string | null
	roles: Array<{
		id: string
		name: string
		permissions: Array<{
			id: string
			action: string
			entity: string
			access: string
		}>
	}>
}

// type ActionData = {
// 	result: SubmissionResult<z.infer<typeof CreateRoleSchema>>
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
					description: true,
					permissions: {
						select: {
							id: true,
							action: true,
							entity: true,
							access: true,
						},
					},
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
			permissions: {
				select: {
					id: true,
					action: true,
					entity: true,
					access: true,
				},
			},
		},
		orderBy: { name: 'asc' },
	})

	return json({ users, roles })
}

export async function action({ request }: ActionFunctionArgs) {
	await requireUserWithPermission(request, 'update:user:any')

	const formData = await request.formData()
	const submission = await parseWithZod(formData, {
		schema: ActionSchema.superRefine(async (data, ctx) => {
			if (data.intent === 'createRole') {
				const existingRole = await prisma.role.findFirst({
					where: { name: data.name },
				})
				if (existingRole) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: `A role with the name "${data.name}" already exists.`,
						path: ['name'],
					})
				}
			}
		}),
		async: true,
	})

	if (submission.status !== 'success') {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	const { intent } = submission.value

	try {
		switch (intent) {
			case 'createRole': {
				const { name, description } = submission.value
				await prisma.role.create({
					data: { name, description },
				})
				break
			}

			case 'updateRoles': {
				const { userId, roles } = submission.value
				await prisma.user.update({
					where: { id: userId },
					data: {
						roles: {
							set: roles.map((id) => ({ id })),
						},
					},
				})
				break
			}

			case 'updatePermissions': {
				const { roleId, permissionId, action, entity, access } =
					submission.value
				if (permissionId) {
					await prisma.permission.update({
						where: { id: permissionId },
						data: { action, entity, access },
					})
				} else {
					await prisma.permission.create({
						data: {
							action,
							entity,
							access,
							roles: {
								connect: { id: roleId },
							},
						},
					})
				}
				break
			}

			case 'deletePermission': {
				const { permissionId } = submission.value
				await prisma.permission.delete({
					where: { id: permissionId },
				})
				break
			}

			case 'deleteRole': {
				const { userId, roleId } = submission.value
				await prisma.user.update({
					where: { id: userId },
					data: {
						roles: {
							disconnect: { id: roleId },
						},
					},
				})
				break
			}
		}

		return json({ result: { status: 'success' as const } })
	} catch (error) {
		console.error('Action error:', error)
		return json(
			{
				result: {
					status: 'error' as const,
					errors: { '': ['An unexpected error occurred'] },
				},
			},
			{ status: 500 },
		)
	}
}

export default function AdminUsersRoute() {
	const { users, roles } = useLoaderData<typeof loader>()
	const actionData = useActionData<typeof action>()
	const [editingUserId, setEditingUserId] = useState<string | null>(null)
	const [editingPermissions, setEditingPermissions] = useState<{
		userId: string
		roleId: string
		roleName: string
		position: { top: number; left: number }
	} | null>(null)
	const [isCreatingRole, setIsCreatingRole] = useState(false)

	const [form, { name, description }] = useForm<
		z.infer<typeof CreateRoleSchema>
	>({
		id: 'create-role',
		constraint: getZodConstraint(CreateRoleSchema),
		lastResult: actionData?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: CreateRoleSchema })
		},
		shouldRevalidate: 'onBlur',
	})

	const actions = ['create', 'read', 'update', 'delete']
	const entities = ['user', 'note', 'meetup', 'location']
	const accessTypes = ['own', 'any']

	const handleOpenPermissions = (
		userId: string,
		roleId: string,
		roleName: string,
		event: React.MouseEvent,
	) => {
		const button = event.currentTarget
		const rect = button.getBoundingClientRect()
		setEditingPermissions({
			userId,
			roleId,
			roleName,
			position: {
				top: rect.bottom + window.scrollY + 4,
				left: rect.left + window.scrollX,
			},
		})
	}

	return (
		<div className="container mx-auto py-8">
			<div className="mb-8 flex items-center justify-between">
				<h1 className="text-2xl font-bold">User Management</h1>
				<button
					onClick={() => setIsCreatingRole(true)}
					className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
				>
					<svg
						className="h-4 w-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 4v16m8-8H4"
						/>
					</svg>
					Create Role
				</button>
			</div>

			{isCreatingRole && (
				<div className="mb-8 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
					<div className="mb-4 flex items-center justify-between">
						<h2 className="text-lg font-medium">Create New Role</h2>
						<button
							onClick={() => setIsCreatingRole(false)}
							className="text-gray-400 hover:text-gray-500"
						>
							<svg
								className="h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>
					<Form
						method="post"
						className="space-y-4"
						{...getFormProps(form)}
						onSubmit={(e) => {
							const form = e.currentTarget
							const nameInput = form.elements.namedItem(
								'name',
							) as HTMLInputElement
							const existingRole = roles.find(
								(role) =>
									role.name.toLowerCase() === nameInput.value.toLowerCase(),
							)
							if (existingRole) {
								e.preventDefault()
								alert(
									`A role with the name "${nameInput.value}" already exists.`,
								)
							}
						}}
					>
						<input type="hidden" name="intent" value="createRole" />
						<div>
							<label
								htmlFor="name"
								className="block text-sm font-medium text-gray-700"
							>
								Role Name
							</label>
							<input
								{...getInputProps(name, { type: 'text' })}
								required
								className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
									name.errors ? 'border-red-300' : 'border-gray-300'
								}`}
								placeholder="e.g., Editor, Moderator"
							/>
							<ErrorList errors={name.errors} id={name.id} />
						</div>
						<div>
							<label
								htmlFor="description"
								className="block text-sm font-medium text-gray-700"
							>
								Description
							</label>
							<input
								{...getInputProps(description, { type: 'text' })}
								required
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
								placeholder="Brief description of the role's responsibilities"
							/>
							<ErrorList errors={description.errors} id={description.id} />
						</div>
						<div className="flex justify-end">
							<button
								type="submit"
								className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
							>
								Create Role
							</button>
						</div>
					</Form>
				</div>
			)}

			<div className="relative">
				<div className="overflow-hidden rounded-lg bg-white shadow-md">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
									User
								</th>
								<th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
									Email
								</th>
								<th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
									Roles & Permissions
								</th>
								<th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200 bg-white">
							{users.map((user: User) => (
								<tr key={user.id} className="hover:bg-gray-50">
									<td className="whitespace-nowrap px-4 py-2">
										<div className="flex flex-col">
											<div className="text-sm font-medium text-gray-900">
												{user.name || user.username}
											</div>
											<div className="text-xs text-gray-500">
												@{user.username}
											</div>
										</div>
									</td>
									<td className="whitespace-nowrap px-4 py-2">
										<div className="text-sm text-gray-900">{user.email}</div>
									</td>
									<td className="px-4 py-2">
										{editingUserId === user.id ? (
											<Form method="post" className="flex gap-2">
												<input type="hidden" name="userId" value={user.id} />
												<input
													type="hidden"
													name="intent"
													value="updateRoles"
												/>
												<div className="flex flex-wrap gap-1.5">
													{roles.map((role) => (
														<label
															key={role.id}
															className="flex items-center gap-1 rounded bg-gray-50 px-2 py-1"
														>
															<input
																type="checkbox"
																name="roles"
																value={role.id}
																defaultChecked={user.roles.some(
																	(r) => r.id === role.id,
																)}
																className="h-3 w-3 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
															/>
															<span className="text-xs text-gray-700">
																{role.name}
															</span>
														</label>
													))}
												</div>
												<div className="flex gap-1">
													<button
														type="submit"
														className="inline-flex items-center rounded bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-700"
													>
														Save
													</button>
													<button
														type="button"
														onClick={() => setEditingUserId(null)}
														className="inline-flex items-center rounded bg-white px-2 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
													>
														Cancel
													</button>
												</div>
											</Form>
										) : (
											<div className="flex flex-wrap gap-2">
												{user.roles.map((role) => (
													<div
														key={role.id}
														className="group relative inline-flex items-center gap-1"
													>
														<div className="flex items-center gap-1 rounded-l bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
															{role.name}
															<button
																type="button"
																onClick={(e) =>
																	handleOpenPermissions(
																		user.id,
																		role.id,
																		role.name,
																		e,
																	)
																}
																className="ml-1 text-xs text-blue-600 hover:text-blue-800"
																title="Manage permissions"
															>
																<svg
																	className="h-3 w-3"
																	fill="none"
																	viewBox="0 0 24 24"
																	stroke="currentColor"
																>
																	<path
																		strokeLinecap="round"
																		strokeLinejoin="round"
																		strokeWidth={2}
																		d="M12 6v6m0 0v6m0-6h6m-6 0H6"
																	/>
																</svg>
															</button>
														</div>
														<Form
															method="post"
															className="inline-flex opacity-0 transition-opacity group-hover:opacity-100"
														>
															<input
																type="hidden"
																name="intent"
																value="deleteRole"
															/>
															<input
																type="hidden"
																name="userId"
																value={user.id}
															/>
															<input
																type="hidden"
																name="roleId"
																value={role.id}
															/>
															<button
																type="submit"
																className="rounded-r border-l border-blue-700/10 bg-blue-50 px-1 py-0.5 text-blue-700 hover:bg-blue-100"
																title="Remove role"
																onClick={(e) => {
																	if (
																		!confirm(
																			`Are you sure you want to remove the ${role.name} role from this user?`,
																		)
																	) {
																		e.preventDefault()
																	}
																}}
															>
																<svg
																	className="h-3 w-3"
																	fill="none"
																	stroke="currentColor"
																	viewBox="0 0 24 24"
																>
																	<path
																		strokeLinecap="round"
																		strokeLinejoin="round"
																		strokeWidth={2}
																		d="M6 18L18 6M6 6l12 12"
																	/>
																</svg>
															</button>
														</Form>
													</div>
												))}
											</div>
										)}
									</td>
									<td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">
										{editingUserId !== user.id && (
											<button
												className="rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 hover:text-indigo-500"
												onClick={() => setEditingUserId(user.id)}
											>
												Edit Roles
											</button>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{editingPermissions &&
				createPortal(
					<div
						className="fixed inset-0 z-50"
						onClick={(e) => {
							if (e.target === e.currentTarget) {
								setEditingPermissions(null)
							}
						}}
					>
						<div
							className="absolute w-[400px] rounded-lg border border-gray-200 bg-white p-3 shadow-xl"
							style={{
								top: editingPermissions.position.top,
								left: editingPermissions.position.left,
							}}
						>
							<div className="relative">
								<div className="mb-2 flex items-center justify-between border-b border-gray-100 pb-2">
									<h3 className="text-sm font-medium">
										Permissions for {editingPermissions.roleName}
									</h3>
									<button
										onClick={() => setEditingPermissions(null)}
										className="text-gray-400 hover:text-gray-500"
									>
										<svg
											className="h-4 w-4"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M6 18L18 6M6 6l12 12"
											/>
										</svg>
									</button>
								</div>
								<div className="max-h-48 space-y-1 overflow-y-auto">
									{roles
										.find((r) => r.id === editingPermissions.roleId)
										?.permissions.map((permission) => (
											<div
												key={permission.id}
												className="group/permission flex items-center justify-between rounded-md px-2 py-1 hover:bg-gray-50"
											>
												<div className="flex items-center gap-1 text-xs text-gray-600">
													<span className="font-medium text-gray-700">
														{permission.action}
													</span>
													<span>:</span>
													<span>{permission.entity}</span>
													<span className="text-gray-400">
														({permission.access})
													</span>
												</div>
												<Form
													method="post"
													className="opacity-0 transition-opacity group-hover/permission:opacity-100"
												>
													<input
														type="hidden"
														name="intent"
														value="deletePermission"
													/>
													<input
														type="hidden"
														name="permissionId"
														value={permission.id}
													/>
													<button
														type="submit"
														className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600"
														title="Delete permission"
														onClick={(e) => {
															if (
																!confirm(
																	'Are you sure you want to delete this permission?',
																)
															) {
																e.preventDefault()
															}
														}}
													>
														<svg
															className="h-3 w-3"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M6 18L18 6M6 6l12 12"
															/>
														</svg>
													</button>
												</Form>
											</div>
										))}
								</div>
								<Form
									method="post"
									className="mt-2 border-t border-gray-100 pt-2"
								>
									<input
										type="hidden"
										name="intent"
										value="updatePermissions"
									/>
									<input
										type="hidden"
										name="roleId"
										value={editingPermissions.roleId}
									/>
									<div className="grid grid-cols-3 gap-1">
										<select
											name="action"
											className="block w-full rounded-md border-0 py-1 text-xs text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
											required
										>
											<option value="">Action</option>
											{actions.map((action) => (
												<option key={action} value={action}>
													{action}
												</option>
											))}
										</select>
										<select
											name="entity"
											className="block w-full rounded-md border-0 py-1 text-xs text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
											required
										>
											<option value="">Entity</option>
											{entities.map((entity) => (
												<option key={entity} value={entity}>
													{entity}
												</option>
											))}
										</select>
										<select
											name="access"
											className="block w-full rounded-md border-0 py-1 text-xs text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
											required
										>
											<option value="">Access</option>
											{accessTypes.map((access) => (
												<option key={access} value={access}>
													{access}
												</option>
											))}
										</select>
									</div>
									<div className="mt-2 flex justify-end">
										<button
											type="submit"
											className="inline-flex items-center rounded-md bg-indigo-600 px-2 py-1 text-xs font-semibold text-white hover:bg-indigo-500"
										>
											Add Permission
										</button>
									</div>
								</Form>
							</div>
						</div>
					</div>,
					document.body,
				)}
		</div>
	)
}
