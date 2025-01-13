import { useState } from 'react'
import { Button } from '#app/components/ui/button'
import {
	Command,
	CommandEmpty,
	CommandInput,
	CommandItem,
	CommandList,
} from '#app/components/ui/command'
import { Icon } from '#app/components/ui/icon'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '#app/components/ui/popover'
import { cn } from '#app/utils/misc.tsx'

interface Item {
	value: string
	label: string
}

export default function CreatableMultiselect({
	topics = [],
	value = [],
	onChange,
	errors,
}: {
	topics?: Array<{ id: string; name: string }>
	value?: string[]
	onChange?: (value: string[]) => void
	errors?: string[]
}) {
	const [open, setOpen] = useState(false)
	const [selectedValues, setSelectedValues] = useState<string[]>(value)
	const [items, setItems] = useState<Item[]>(() => {
		return topics.map((topic) => ({
			value: topic.id,
			label: topic.name,
		}))
	})
	const [inputValue, setInputValue] = useState('')

	const onSelect = (itemValue: string) => {
		const newSelected = selectedValues.includes(itemValue)
			? selectedValues.filter((v) => v !== itemValue)
			: [...selectedValues, itemValue]

		setSelectedValues(newSelected)
		onChange?.(newSelected)
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="w-full justify-between"
				>
					{selectedValues.length > 0
						? items
								.filter((item) => selectedValues.includes(item.value))
								.map((item) => item.label)
								.join(', ')
						: 'Select or create...'}
					<Icon
						name="chevron-up-down"
						className="ml-2 h-4 w-4 shrink-0 opacity-50"
					/>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-80 p-0">
				<Command>
					<CommandInput
						placeholder="Search or create..."
						value={inputValue}
						onValueChange={setInputValue}
					/>

					<CommandEmpty>
						{inputValue && (
							<Button
								variant="ghost"
								className="w-full justify-start"
								onClick={() => {
									const newItem: Item = { value: inputValue, label: inputValue }
									setItems((prev) => [...prev, newItem])
									setSelectedValues([...selectedValues, inputValue])
									setInputValue('')
									setOpen(false)
								}}
							>
								<Icon name="plus-circle" className="mr-2 h-4 w-4" />
								Create "{inputValue}"
							</Button>
						)}
					</CommandEmpty>
					<CommandList>
						{(items || []).map((item) => (
							<CommandItem
								key={item.value}
								value={item.value}
								onSelect={() => onSelect(item.value)}
								className={cn(
									errors?.includes(item.value) ? 'text-red-500' : '',
								)}
							>
								<Icon
									name="check"
									className={cn(
										'mr-2',
										selectedValues.includes(item.value)
											? 'opacity-100'
											: 'opacity-0',
									)}
								/>
								{item.label}
							</CommandItem>
						))}
					</CommandList>
				</Command>
			</PopoverContent>
			{errors && <p className="text-sm text-red-500">{errors.join(', ')}</p>}
			<input
				type="hidden"
				name={'meetup-form'}
				value={selectedValues.join(',')}
				onChange={(e) => {
					setSelectedValues(e.target.value.split(','))
					onChange?.(e.target.value.split(','))
				}}
			/>
		</Popover>
	)
}
