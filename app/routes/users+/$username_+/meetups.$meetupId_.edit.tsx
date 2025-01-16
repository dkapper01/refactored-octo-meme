import { invariantResponse } from '@epic-web/invariant'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
// import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { MeetupEditor } from './__meetup-editor.tsx'

export { action } from './__meetup-editor.server.tsx'

export async function loader({ params, request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)
	const locations = await prisma.location.findMany({
		select: {
			id: true,
			name: true,
			address: true,
		},
	})
	const meetup = await prisma.meetup.findFirst({
		select: {
			id: true,
			title: true,
			description: true,
			startTime: true,
			location: {
				select: {
					id: true,
					name: true,
					address: true,
				},
			},
		},
		where: {
			id: params.meetupId,
			ownerId: userId,
		},
	})
	invariantResponse(meetup, 'Not found', { status: 404 })
	return json({ meetup, locations })
}

export default function MeetupEdit() {
	const data = useLoaderData<typeof loader>()

	return <MeetupEditor meetup={data.meetup} />
}

// export function ErrorBoundary() {
// 	return (
// 		<GeneralErrorBoundary
// 			statusHandlers={{
// 				404: ({ params }) => (
// 					<p>No meetup with the id "{params.meetupId}" exists</p>
// 				),
// 			}}
// 		/>
// 	)
// }
