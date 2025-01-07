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
		async: true,
	})

	if (submission.status !== 'success') {
		return json({ result: submission.reply() }, { status: 400 })
	}

	const { id: meetupId, title, description, topics } = submission.value

	// Fetch the current meetup to get existing topics
	const currentMeetup = await prisma.meetup.findUnique({
		where: { id: meetupId ?? '__new_meetup__' },
		include: { topics: true }, // Include current topics
	})

	const existingTopics = topics.filter((topic) => topic.id) // Topics with IDs
	const newTopics = topics.filter((topic) => !topic.id) // Topics without IDs

	// Determine topics to disconnect (remove)
	const topicsToDisconnect = (currentMeetup?.topics ?? [])
		.filter(
			(currentTopic) =>
				!existingTopics.some((topic) => topic.id === currentTopic.id),
		)
		.map((topic) => ({ id: topic.id }))

	// Upsert the meetup
	const meetup = await prisma.meetup.upsert({
		where: { id: meetupId ?? '__new_meetup__' },
		create: {
			ownerId: userId,
			title,
			description,
			topics: {
				create: newTopics.map((topic) => ({ name: topic.name })),
				connect: existingTopics.map((topic) => ({ id: topic.id })),
			},
		},
		update: {
			title,
			description,
			topics: {
				connect: existingTopics.map((topic) => ({ id: topic.id })),
				create: newTopics.map((topic) => ({ name: topic.name })),
				disconnect: topicsToDisconnect,
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
