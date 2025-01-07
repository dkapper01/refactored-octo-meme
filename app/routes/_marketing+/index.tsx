import { type MetaFunction } from '@remix-run/node'
import { Link, useLocation } from '@remix-run/react'

import { Icon } from '#app/components/ui/icon.tsx'

// import { prisma } from '#app/utils/db.server.ts'

export const meta: MetaFunction = () => [{ title: 'Epic Notes' }]

// export async function loader() {
// 	const meetups = await prisma.meetup.findMany()
// 	return json({ meetups })
// }

export default function Index() {
	// const currentView = 'map'
	const location = useLocation()

	// const navigation = useNavigation()
	// const data = useLoaderData<typeof loader>()

	return (
		<div className="relative flex flex-col text-gray-800">
			<main className="container flex flex-1 flex-col items-center justify-center">
				<div className="mt-5 flex w-full rounded-lg bg-white p-2 shadow-sm">
					<Link
						to="/"
						className={`flex items-center gap-2 rounded-md px-4 py-2 transition-colors ${
							location.pathname === '/'
								? 'bg-blue-500 text-white'
								: 'text-gray-600 hover:bg-gray-100'
						}`}
					>
						<Icon name="map" size="lg" />
						<span>Map</span>
					</Link>
					<Link
						to="/explore"
						className={`ml-2 flex items-center gap-2 rounded-md px-4 py-2 transition-colors ${
							location.pathname === '/explore'
								? 'bg-blue-500 text-white'
								: 'text-gray-600 hover:bg-gray-100'
						}`}
					>
						<Icon name="magnifying-glass" size="lg" />
						<span>Explore</span>
					</Link>
				</div>
			</main>
		</div>
	)
}
