// import { type MetaFunction } from '@remix-run/react'
// import { type loader as notesLoader } from './notes.tsx'

export default function MeetupsIndexRoute() {
	return (
		<div className="flex h-full items-center justify-center rounded-2xl bg-white shadow-sm">
			<p className="text-gray-500">Select a meetup to view details</p>
		</div>
	)
}

// export const meta: MetaFunction<
// 	null,
// 	{ 'routes/users+/$username_+/notes': typeof notesLoader }
// > = ({ params, matches }) => {
// 	const notesMatch = matches.find(
// 		(m) => m.id === 'routes/users+/$username_+/notes',
// 	)
// 	const displayName = notesMatch?.data?.owner.name ?? params.username
// 	const noteCount = notesMatch?.data?.owner.notes.length ?? 0
// 	const notesText = noteCount === 1 ? 'note' : 'notes'
// 	return [
// 		{ title: `${displayName}'s Notes | Epic Notes` },
// 		{
// 			name: 'description',
// 			content: `Checkout ${displayName}'s ${noteCount} ${notesText} on Epic Notes`,
// 		},
// 	]
// }
