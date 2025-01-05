import { MeetupEditor } from './__meetup-editor'

export { action as action, loader as loader } from './__meetup-editor.server'

export default function MeetupNewRoute() {
	return <MeetupEditor />
}
