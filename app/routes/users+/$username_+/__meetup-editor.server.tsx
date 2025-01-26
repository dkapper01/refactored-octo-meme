import { parseWithZod } from '@conform-to/zod'
import {
	json,
	type ActionFunctionArgs,
	redirect,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { MeetupEditorSchema } from './__meetup-editor'

export async function loader({}: LoaderFunctionArgs) {
	const locations = await prisma.location.findMany({
		select: {
			id: true,
			name: true,
			street: true,
			city: true,
			state: true,
			zip: true,
		},
		// hoursOfOperation: {
		// 	select: {
		// 		id: true,
		// 		dayOfWeek: true,
		// 		openTime: true,
		// 		closeTime: true,
		// 		locationId: true,
		// 	},
		// },
		// },
	})

	return json({ locations })
}

export async function action({ request }: ActionFunctionArgs) {
	const userId = await requireUserId(request)
	const formData = await request.formData()

	const submission = await parseWithZod(formData, {
		schema: MeetupEditorSchema,
		async: true,
	})

	if (submission.status !== 'success') {
		return json({ result: submission.reply() }, { status: 400 })
	}

	const {
		id: meetupId,
		title,
		description,
		startTime,
		locationId,
	} = submission.value

	const meetup = await prisma.meetup.upsert({
		where: { id: meetupId ?? '__new_meetup__' },
		create: {
			ownerId: userId,
			title,
			description,
			locationId,
			startTime,
		},
		update: {
			title,
			description,
			locationId,
			startTime,
		},
		select: {
			id: true,
			owner: { select: { username: true } },
		},
	})

	return redirect(`/users/${meetup.owner.username}/meetups/${meetup.id}`)
}
