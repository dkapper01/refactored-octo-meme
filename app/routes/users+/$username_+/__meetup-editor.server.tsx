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
	const topics = await prisma.topic.findMany()
	return json({ topics })
}

export async function action({ request }: ActionFunctionArgs) {
	const userId = await requireUserId(request)
	const formData = await request.formData()
	const submission = parseWithZod(formData, { schema: MeetupEditorSchema })

	if (submission.status !== 'success') {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	const { id: meetupId, title, description } = submission.value

	const meetup = await prisma.meetup.upsert({
		select: { id: true, owner: { select: { username: true } } },
		where: { id: meetupId ?? '__new_meetup__' },
		create: {
			ownerId: userId,
			title,
			description,
		},
		update: {
			title,
			description,
		},
	})

	return redirect(`/users/${meetup.owner.username}/meetups/${meetup.id}`)
}
