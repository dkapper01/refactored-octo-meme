import { useState } from 'react'
import { ActionMeta, MultiValue, StylesConfig } from 'react-select'
import CreatableSelect from 'react-select/creatable'

// Define the shape of our option object
interface Option {
	readonly label: string
	readonly value: string
}

// Define props for our component
interface CreatableMultiselectProps {
	placeholder?: string
}

export default function CreatableMultiselect({
	placeholder = 'Select or create...',
}: CreatableMultiselectProps): JSX.Element {
	// Sample options
	const [options, setOptions] = useState<readonly Option[]>([
		{ value: 'react', label: 'React' },
		{ value: 'full-stack-development', label: 'Full Stack Development' },
		{ value: 'interview-prep', label: 'Interview Prep' },
	])

	const [selectedOptions, setSelectedOptions] = useState<readonly Option[]>([])

	// Handler for changes in selection
	const handleChange = (
		newValue: MultiValue<Option>,
		actionMeta: ActionMeta<Option>,
	) => {
		setSelectedOptions(newValue as readonly Option[])
	}

	// Handler for creating a new option
	const handleCreate = (inputValue: string) => {
		const newOption: Option = {
			value: inputValue.toLowerCase(),
			label: inputValue,
		}
		setOptions((prev) => [...prev, newOption] as readonly Option[])
		setSelectedOptions((prev) => [...prev, newOption] as readonly Option[])
	}

	// Custom styles
	const customStyles: StylesConfig<Option, true> = {
		control: (provided) => ({
			...provided,
			backgroundColor: 'white',
			borderColor: '#d1d5db',
			width: '100%',
			'&:hover': {
				borderColor: '#9ca3af',
			},
		}),
		multiValue: (provided) => ({
			...provided,
			backgroundColor: '#e5e7eb',
		}),
		multiValueLabel: (provided) => ({
			...provided,
			color: '#374151',
		}),
		multiValueRemove: (provided) => ({
			...provided,
			color: '#6b7280',
			'&:hover': {
				backgroundColor: '#d1d5db',
				color: '#1f2937',
			},
		}),
	}

	return (
		<div className="mx-auto w-full">
			<CreatableSelect<Option, true>
				isMulti
				options={options}
				value={selectedOptions}
				onChange={handleChange}
				onCreateOption={handleCreate}
				placeholder={placeholder}
				styles={customStyles}
				className="text-sm"
				classNamePrefix="react-select"
			/>
		</div>
	)
}
