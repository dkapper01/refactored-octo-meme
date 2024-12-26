import { Link, NavLink, Outlet, useLoaderData } from '@remix-run/react'

export default function MeetupsRoute() {
	return (
		<div className="container mx-auto mt-10 max-w-2xl p-4">
			<Outlet />
		</div>
	)
}
