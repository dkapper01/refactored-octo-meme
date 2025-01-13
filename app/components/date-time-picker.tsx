import { type HoursOfOperation } from '@prisma/client'
import {
	format,
	addMinutes,
	// startOfDay,
	isBefore,
	isToday,
	startOfToday,
	parse,
} from 'date-fns'
import { useState } from 'react'
import { Button } from '#app/components/ui/button'
import { Calendar } from '#app/components/ui/calendar'
import { Icon } from '#app/components/ui/icon.tsx'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '#app/components/ui/popover'
import { ScrollArea } from '#app/components/ui/scroll-area'

import { cn } from '#app/utils/misc.tsx'

interface DateTimePickerProps {
	date: Date | undefined
	setDate: (date: Date | undefined) => void
	hoursOfOperation?: HoursOfOperation[]
}

export default function DateTimePicker({
	date,
	setDate,
	hoursOfOperation = [],
}: DateTimePickerProps) {
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(date)
	const [selectedTime, setSelectedTime] = useState<string>(
		date ? format(date, 'HH:mm') : '',
	)

	const [open, setOpen] = useState(false)

	const generateTimeOptions = (selectedDate: Date | undefined) => {
		if (!selectedDate || !hoursOfOperation) return []

		const dayOfWeek = format(selectedDate, 'EEEE').toUpperCase()
		const todayHours = hoursOfOperation.find((h) => h.dayOfWeek === dayOfWeek)

		if (!todayHours) return []

		const options = []
		const startTime = parse(todayHours.openTime, 'HH:mm', selectedDate)
		const endTime = parse(todayHours.closeTime, 'HH:mm', selectedDate)

		let currentTime = startTime
		while (isBefore(currentTime, endTime)) {
			options.push(format(currentTime, 'HH:mm'))
			currentTime = addMinutes(currentTime, 30)
		}
		return options
	}

	const timeOptions = generateTimeOptions(selectedDate)

	const handleDateSelect = (newDate: Date | undefined) => {
		setSelectedDate(newDate)
		if (newDate) {
			const newTimeOptions = generateTimeOptions(newDate)
			if (newTimeOptions.length > 0) {
				const timeValue = newTimeOptions[0] ?? ''
				setSelectedTime(timeValue)
				if (timeValue) {
					const [hours, minutes] = timeValue.split(':')
					newDate.setHours(
						parseInt(hours ?? '0', 10),
						parseInt(minutes ?? '0', 10),
					)
					setDate(newDate)
				}
			}
		}
	}

	const handleTimeSelect = (newTime: string) => {
		setSelectedTime(newTime)
		if (selectedDate) {
			const [hours, minutes] = newTime.split(':')
			const newDate = new Date(selectedDate)
			newDate.setHours(parseInt(hours ?? '0', 10), parseInt(minutes ?? '0', 10))
			setDate(newDate)
		}
	}

	return (
		<div className="flex items-center space-x-2">
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant={'outline'}
						className={cn(
							'w-full justify-start text-left font-normal',
							!date && 'text-muted-foreground',
						)}
					>
						<Icon name="calendar" className="mr-2 h-4 w-4" />
						{date ? (
							format(date, 'PPP HH:mm')
						) : (
							<span>Pick a date and time</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<div className="flex flex-col sm:flex-row">
						<div className="border-b p-4 sm:border-b-0 sm:border-r">
							<Calendar
								mode="single"
								selected={selectedDate}
								onSelect={handleDateSelect}
								disabled={(date) => isBefore(date, startOfToday())}
								initialFocus
								className="rounded-md border-none"
							/>
						</div>
						<div className="flex h-full flex-col justify-between p-4">
							<div className="space-y-4">
								<div className="flex items-center space-x-2">
									<Icon
										name="clock"
										className="h-4 w-4 text-muted-foreground"
									/>
									<span className="text-sm font-medium">Select Time</span>
								</div>
								<ScrollArea className="h-[280px] pr-4">
									<div className="grid grid-cols-3 gap-2">
										{!date && (
											<div className="flex h-full w-24 items-center justify-center">
												<span className="text-muted-foreground">
													Please select a date
												</span>
											</div>
										)}
										{timeOptions.map((time) => {
											const isDisabled =
												selectedDate &&
												isToday(selectedDate) &&
												isBefore(parse(time, 'HH:mm', new Date()), new Date())
											return (
												<Button
													key={time}
													onClick={() => handleTimeSelect(time)}
													disabled={isDisabled}
													variant={
														selectedTime === time ? 'default' : 'outline'
													}
													className={cn(
														'h-8 text-xs',
														selectedTime === time &&
															'bg-primary text-primary-foreground',
														isDisabled && 'cursor-not-allowed opacity-50',
													)}
												>
													{time}
												</Button>
											)
										})}
									</div>
								</ScrollArea>
							</div>
							<div className="mt-4 flex justify-end">
								<Button
									onClick={() => setOpen(false)}
									className="bg-primary text-primary-foreground hover:bg-primary/90"
								>
									Confirm
								</Button>
							</div>
						</div>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	)
}
