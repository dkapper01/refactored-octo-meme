import { json, type MetaFunction } from '@remix-run/node'
// import ExploreEvents from '#app/components/explore-events.tsx'
// import { Link, useLocation } from '@remix-run/react'

// import { Icon } from '#app/components/ui/icon.tsx'
import { useLoaderData } from '@remix-run/react'
import { prisma } from '#app/utils/db.server.ts'

export const meta: MetaFunction = () => [{ title: 'Epic Notes' }]

export async function loader() {
	const meetups = await prisma.meetup.findMany()
	return json({ meetups })
}

export default function Index() {
	// const currentView = 'map'
	// const location = useLocation()

	// const navigation = useNavigation()
	const data = useLoaderData<typeof loader>()
	console.log(data)

	return (
		<div className="relative flex flex-col text-gray-800">
			<main className="container fixed left-0 right-0 top-0 mt-20">
				{/* <ExploreEvents /> */}
				{data?.meetups?.map((meetup) => (
					<div key={meetup.id}>{meetup.title}</div>
				))}
			</main>
		</div>
	)
}
