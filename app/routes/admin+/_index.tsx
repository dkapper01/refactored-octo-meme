import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Link } from '@remix-run/react'
import { Icon } from '#app/components/ui/icon.tsx'
import { Button } from '../../components/ui/button'
import { requireUserWithPermission } from '../../utils/permissions.server'

export async function loader({ request }: LoaderFunctionArgs) {
	await requireUserWithPermission(request, 'read:user:any')
	return json({})
}

export default function AdminIndexRoute() {
	return (
		<div className="container py-8">
			<h1 className="mb-8 text-h1">Admin Dashboard</h1>

			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				<Button
					asChild
					variant="outline"
					className="flex h-32 w-full flex-col items-center justify-center gap-2"
				>
					<Link to="users">
						= <Icon name="users" className="h-8 w-8" />
						<span className="text-lg font-semibold">Manage Users</span>
					</Link>
				</Button>

				<Button
					asChild
					variant="outline"
					className="flex h-32 w-full flex-col items-center justify-center gap-2"
				>
					<Link to="locations">
						<Icon name="map-pin" className="h-8 w-8" />
						<span className="text-lg font-semibold">Manage Locations</span>
					</Link>
				</Button>
			</div>
		</div>
	)
}
