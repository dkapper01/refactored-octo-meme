import { useEffect, useState } from 'react'
// import {} from // type ActionMeta,
// // type MultiValue,
// // type StylesConfig,
// 'react-select'
import CreatableSelect from 'react-select/creatable'

// Define the shape of our option object
interface Option {
	value: string
	label: string
}

export default function CreatableMultiselect({
	placeholder = 'Select or create...',
	topics,
}: {
	placeholder?: string
	topics: { id: string; name: string }[]
}) {
	const [options, setOptions] = useState<Option[]>([])
	// const [selectedOptions, setSelectedOptions] = useState<Option[]>([])

	useEffect(() => {
		setOptions(topics.map(({ id, name }) => ({ value: id, label: name })))
	}, [topics])

	// Handler for changes in selection
	// const handleChange = (newValue: MultiValue<Option>) => {
	// }

	// Handler for creating a new option
	// const handleCreate = (inputValue: string) => {
	// }

	return (
		<div className="mx-auto w-full">
			<CreatableSelect
				isMulti
				options={options}
				// value={selectedOptions}
				// onChange={handleChange}
				// onCreateOption={handleCreate}
				placeholder={placeholder}
				className="text-sm"
				classNamePrefix="react-select"
			/>
		</div>
	)
}
