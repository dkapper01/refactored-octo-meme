import { MeetupEditor } from './__meetup-editor'

export { action as action } from './__meetup-editor.server'

export default function MeetupNewRoute() {
	return <MeetupEditor />
}
