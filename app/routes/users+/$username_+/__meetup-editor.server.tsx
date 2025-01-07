import { parseWithZod } from '@conform-to/zod'
import {
	json,
	type ActionFunctionArgs,
	redirect,
	type LoaderFunctionArgs,
} from '@remix-run/node'
// import { z } from 'zod'
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

	const submission = await parseWithZod(formData, {
		schema: MeetupEditorSchema,
	})

	if (submission.status !== 'success') {
		return json({ result: submission.reply() }, { status: 400 })
	}

	const { id: meetupId, title, description, topics } = submission.value

	// Prepare topics for upsert
	const topicData = topics.map((topic) => ({
		where: { id: topic.id }, // Assuming topic.id is provided for existing topics
		create: { name: topic.name },
	}))

	// Upsert the meetup
	const meetup = await prisma.meetup.upsert({
		where: { id: meetupId ?? '__new_meetup__' }, // Use a placeholder for new meetups
		create: {
			ownerId: userId,
			title,
			description,
			topics: {
				connectOrCreate: topicData,
			},
		},
		update: {
			title,
			description,
			topics: {
				connectOrCreate: topicData,
			},
		},
		select: {
			id: true,
			owner: {
				select: { username: true },
			},
		},
	})

	return redirect(`/users/${meetup.owner.username}/meetups/${meetup.id}`)
}
