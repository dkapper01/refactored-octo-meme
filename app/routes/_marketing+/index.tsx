import { type MetaFunction } from '@remix-run/node'
import ExploreEvents from '#app/components/explore-events.tsx'
// import { Link, useLocation } from '@remix-run/react'

// import { Icon } from '#app/components/ui/icon.tsx'

// import { prisma } from '#app/utils/db.server.ts'

export const meta: MetaFunction = () => [{ title: 'Epic Notes' }]

// export async function loader() {
// 	const meetups = await prisma.meetup.findMany()
// 	return json({ meetups })
// }

export default function Index() {
	// const currentView = 'map'
	// const location = useLocation()

	// const navigation = useNavigation()
	// const data = useLoaderData<typeof loader>()

	return (
		<div className="relative flex flex-col text-gray-800">
			<main className="container">
				<ExploreEvents />
			</main>
		</div>
	)
}
