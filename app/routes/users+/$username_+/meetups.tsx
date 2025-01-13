import { invariantResponse } from '@epic-web/invariant'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { NavLink, Outlet, useLoaderData } from '@remix-run/react'
import { useState } from 'react'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { prisma } from '#app/utils/db.server.ts'
// import { cn, getUserImgSrc } from '#app/utils/misc.tsx'
// import { useOptionalUser } from '#app/utils/user.ts'

export async function loader({ params }: LoaderFunctionArgs) {
	const owner = await prisma.user.findFirst({
		select: {
			id: true,
			name: true,
			username: true,
			image: { select: { id: true } },
			meetups: {
				select: {
					id: true,
					title: true,
					createdAt: true,
					location: true,
					description: true,
				},
			},
		},
		where: { username: params.username },
	})

	invariantResponse(owner, 'Owner not found', { status: 404 })

	return json({ owner })
}

export default function MeetupsRoute() {
	const data = useLoaderData<typeof loader>()
	// const user = useOptionalUser()
	// const isOwner = user?.id === data.owner.id
	// const ownerDisplayName = data.owner.name ?? data.owner.username
	// const navLinkDefaultClassName =
	// 	'line-clamp-2 block rounded-l-full py-2 pl-8 pr-6 text-base lg:text-xl'

	const [selectedMeetup, setSelectedMeetup] = useState<
		(typeof data.owner.meetups)[number] | null
	>(null)

	return (
		<div className="container flex min-h-[600px] flex-col space-y-6 bg-gray-50 p-6 lg:flex-row lg:space-x-6 lg:space-y-0">
			<div className="w-full space-y-4 lg:w-1/2">
				{data.owner.meetups.map((meetup) => (
					<NavLink key={meetup.id} to={meetup.id} className={'block'}>
						<div
							className={`w-full cursor-pointer overflow-hidden rounded-2xl transition-all duration-300 ${
								selectedMeetup?.id === meetup.id
									? 'bg-primary/5 ring-2 ring-primary'
									: 'bg-white hover:bg-gray-100'
							}`}
							onClick={() => setSelectedMeetup(meetup)}
						>
							<div className="flex items-center p-4">
								<div className="flex-grow pr-4">
									<h3 className="mb-2 text-lg font-semibold">{meetup.title}</h3>
									<div className="mb-1 flex items-center text-sm text-gray-600">
										<Icon
											name="calendar"
											className="mr-2 h-4 w-4 text-primary"
										/>
										{/* <span>{meetup.date}</span> */}
										<span>Date here</span>
									</div>
									<div className="mb-1 flex items-center text-sm text-gray-600">
										<Icon
											name="map-pin"
											className="mr-2 h-4 w-4 text-primary"
										/>
										<span>{meetup.location?.name}</span>
										{/* <span>Location here</span> */}
									</div>
									<div className="flex items-center text-sm text-gray-600">
										{/* {meetup.userStatus === 'hosted' ? (
										<StarIcon className="mr-2 h-4 w-4 text-yellow-500" />
									) : (
										<UsersIcon className="mr-2 h-4 w-4 text-green-500" />
									)} */}
										<Icon
											name="star"
											className="mr-2 h-4 w-4 text-yellow-500"
										/>
										<span className="capitalize">Hosted</span>
									</div>
								</div>

								<img
									src={
										'https://images.unsplash.com/photo-1446226760091-cc85becf39b4?q=80&w=3474&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
									}
									// alt={meetup.location}
									alt="Meetup image"
									width={100}
									height={100}
									className="rounded-xl object-cover"
								/>
							</div>
						</div>
					</NavLink>
				))}
			</div>
			<div className="w-full lg:w-1/2">
				<Outlet />
			</div>
		</div>
	)
}

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				404: ({ params }) => (
					<p>No user with the username "{params.username}" exists</p>
				),
			}}
		/>
	)
}
