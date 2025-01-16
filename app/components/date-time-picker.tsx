import {
	format,
	addMinutes,
	setHours,
	setMinutes,
	isBefore,
	startOfDay,
	addMonths,
	isAfter,
} from 'date-fns'
import { useState, useRef, useEffect } from 'react'
import { Alert, AlertDescription } from '#app/components/ui/alert.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { Calendar } from '#app/components/ui/calendar.tsx'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogClose,
} from '#app/components/ui/dialog.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { ScrollArea } from '#app/components/ui/scroll-area.tsx'

import { cn } from '#app/utils/misc.tsx'

type BusyLevel = 'Quiet' | 'Moderate' | 'Busy'

const getBusyLevel = (hour: number): BusyLevel => {
	if (hour >= 7 && hour <= 9) return 'Busy'
	if (hour >= 12 && hour <= 14) return 'Busy'
	if (hour >= 17 && hour <= 19) return 'Busy'
	if ((hour >= 10 && hour <= 11) || (hour >= 15 && hour <= 16))
		return 'Moderate'
	return 'Quiet'
}

const getBusyLevelColor = (level: BusyLevel): string => {
	switch (level) {
		case 'Quiet':
			return 'bg-green-500 text-green-100'
		case 'Moderate':
			return 'bg-yellow-500 text-yellow-100'
		case 'Busy':
			return 'bg-red-500 text-red-100'
	}
}

const isDateDisabled = (date: Date) => {
	const today = startOfDay(new Date())
	const twoMonthsFromNow = addMonths(today, 2)
	return isBefore(date, today) || isAfter(date, twoMonthsFromNow)
}

export default function DateTimePicker({
	date,
	setDate,
}: {
	date: Date
	setDate: (date: Date) => void
}) {
	// const [date, setDate] = useState<Date>()
	const [time, setTime] = useState<string>()
	const [confirmedDate, setConfirmedDate] = useState<Date>()
	const [confirmedTime, setConfirmedTime] = useState<string>()
	const timeListRef = useRef<HTMLDivElement>(null)

	const handleDateSelect = (selectedDate: Date | undefined) => {
		if (selectedDate) {
			setDate(selectedDate)
			setTime(undefined) // Reset time when date changes
		}
	}

	const handleTimeSelect = (selectedTime: string) => {
		setTime(selectedTime)
		if (date) {
			const [timeStr, period] = selectedTime.split(' ') as [string, string]
			const timeParts = timeStr.split(':')
			if (timeParts.length !== 2) return
			const [hoursStr, minutesStr] = timeParts as [string, string]
			const hours = parseInt(hoursStr, 10)
			const minutes = parseInt(minutesStr, 10)

			if (isNaN(hours) || isNaN(minutes)) return

			let adjustedHours = hours
			if (period === 'PM' && hours !== 12) {
				adjustedHours += 12
			} else if (period === 'AM' && hours === 12) {
				adjustedHours = 0
			}
			const newDate = new Date(date)
			newDate.setHours(adjustedHours)
			newDate.setMinutes(minutes)
			setDate(newDate)
		}
		if (timeListRef.current) {
			const selectedElement = timeListRef.current.querySelector(
				`[data-time="${selectedTime}"]`,
			)
			selectedElement?.scrollIntoView({ behavior: 'smooth', block: 'center' })
		}
	}

	useEffect(() => {
		const now = new Date()
		const currentHour = now.getHours()
		const currentMinute = now.getMinutes()

		// Calculate next available 30-minute slot
		let nextHour = currentHour
		let nextMinute = currentMinute < 30 ? 30 : 0
		if (nextMinute === 0) nextHour = currentHour + 1

		// Format the time string
		const period = nextHour >= 12 ? 'PM' : 'AM'
		const displayHour =
			nextHour === 0 ? 12 : nextHour > 12 ? nextHour - 12 : nextHour
		const nextValidTime = `${displayHour.toString().padStart(2, '0')}:${nextMinute.toString().padStart(2, '0')} ${period}`

		// Set initial date and time
		const newDate = new Date(now)
		newDate.setHours(nextHour)
		newDate.setMinutes(nextMinute)
		setDate(newDate)
		setTime(nextValidTime)
	}, [setDate])

	useEffect(() => {
		const scrollToSelectedTime = () => {
			if (timeListRef.current && time) {
				const selectedElement = timeListRef.current.querySelector(
					`[data-time="${time}"]`,
				)
				if (selectedElement) {
					// Scroll the selected element into view on render
					selectedElement.scrollIntoView({
						behavior: 'smooth',
						block: 'center',
					})
				}
			}
		}

		// Call the function to scroll to the selected time
		scrollToSelectedTime()
	}, [time]) // Add time as a dependency

	const formatSummary = (
		selectedDate: Date | undefined,
		selectedTime: string | undefined,
	) => {
		if (!selectedDate || !selectedTime) return null
		const parts = selectedTime.split(' ')
		if (parts.length !== 2) return null
		const [timeStr, period] = parts as [string, string]
		const timeParts = timeStr.split(':')
		if (timeParts.length !== 2) return null
		const [hoursStr, minutesStr] = timeParts as [string, string]
		const hours = parseInt(hoursStr, 10)
		const minutes = parseInt(minutesStr, 10)

		if (isNaN(hours) || isNaN(minutes)) return null

		let adjustedHours = hours
		if (period === 'PM' && hours !== 12) {
			adjustedHours += 12
		} else if (period === 'AM' && hours === 12) {
			adjustedHours = 0
		}

		const startDateTime = setMinutes(
			setHours(selectedDate, adjustedHours),
			minutes,
		)
		const endDateTime = addMinutes(startDateTime, 30)
		const busyLevel = getBusyLevel(adjustedHours)
		return {
			date: format(startDateTime, 'MMMM d, yyyy'),
			startTime: format(startDateTime, 'h:mm a'),
			endTime: format(endDateTime, 'h:mm a'),
			busyLevel,
		}
	}

	const handleConfirm = () => {
		setConfirmedDate(date)
		setConfirmedTime(time)
		console.log('Confirmed:', formatSummary(date, time))
	}

	const handleOpenChange = (open: boolean) => {
		if (!open && confirmedDate) {
			setDate(confirmedDate)
			setTime(confirmedTime)
		}
	}

	const isTimeInPast = (timeString: string) => {
		if (!date) return false
		const now = new Date()
		const parts = timeString.split(' ')
		if (parts.length !== 2) return false
		const [timeStr, period] = parts as [string, string]
		const timeParts = timeStr.split(':')
		if (timeParts.length !== 2) return false
		const [hoursStr, minutesStr] = timeParts as [string, string]
		const hours = parseInt(hoursStr, 10)
		const minutes = parseInt(minutesStr, 10)

		if (isNaN(hours) || isNaN(minutes)) return false

		let adjustedHours = hours
		if (period === 'PM' && hours !== 12) {
			adjustedHours += 12
		} else if (period === 'AM' && hours === 12) {
			adjustedHours = 0
		}

		const selectedDateTime = setMinutes(setHours(date, adjustedHours), minutes)
		return isBefore(selectedDateTime, now)
	}

	const summary = formatSummary(date, time)

	console.log('confirmedDate && confirmedTime', {
		date,
		time,
		confirmedDate,
		// confirmedTime,
		// formatSummary: formatSummary(confirmedDate, confirmedTime),
		timeListRef,
	})

	return (
		<div className="flex items-center">
			<Dialog onOpenChange={handleOpenChange}>
				<DialogTrigger asChild>
					<Button
						variant="outline"
						className="w-full justify-start bg-transparent text-left font-normal transition-colors hover:bg-primary/10 hover:text-primary"
					>
						<Icon name="calendar" className="mr-2 h-4 w-4" />
						{confirmedDate && confirmedTime ? (
							formatSummary(confirmedDate, confirmedTime)?.date +
							', ' +
							formatSummary(confirmedDate, confirmedTime)?.startTime +
							' - ' +
							formatSummary(confirmedDate, confirmedTime)?.endTime
						) : (
							<span>Pick a date and time</span>
						)}
					</Button>
				</DialogTrigger>
				<DialogContent className="border-0 bg-background p-0 shadow-lg sm:max-w-[600px]">
					<DialogHeader className="p-6 pb-0">
						<DialogTitle className="text-2xl font-bold text-primary">
							Choose a date and time
						</DialogTitle>
					</DialogHeader>
					<div className="flex flex-col gap-6 p-6 sm:flex-row">
						<div className="flex-1">
							<Calendar
								mode="single"
								selected={date}
								onSelect={handleDateSelect}
								disabled={isDateDisabled}
								fromDate={new Date()}
								toDate={addMonths(new Date(), 2)}
								className="rounded-lg p-3"
							/>
						</div>
						<div className="flex flex-1 flex-col">
							<ScrollArea
								className="h-[300px] w-[220px] rounded-lg"
								ref={timeListRef}
							>
								<div className="flex flex-col gap-2 p-2">
									{Array.from({ length: 24 * 2 }, (_, i) => {
										const hour = Math.floor(i / 2)
										const minute = (i % 2) * 30
										const period = hour < 12 ? 'AM' : 'PM'
										const displayHour =
											hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
										const timeString = `${displayHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`
										const busyLevel = getBusyLevel(hour)
										const isPast = isTimeInPast(timeString)
										return (
											<Button
												key={timeString}
												variant="outline"
												className={cn(
													'flex h-12 w-full items-center justify-between rounded-md border-none bg-gray-50 px-3 transition-colors',
													time === timeString
														? 'border-none bg-primary text-primary-foreground'
														: 'hover:bg-primary/10 hover:text-primary',
													isPast && 'cursor-not-allowed opacity-50',
												)}
												onClick={() => !isPast && handleTimeSelect(timeString)}
												disabled={isPast}
												data-time={timeString}
											>
												<span className="text-sm font-medium">
													{timeString}
												</span>
												<span
													className={cn(
														'rounded-full px-2 py-0.5 text-xs',
														getBusyLevelColor(busyLevel),
													)}
												>
													{busyLevel}
												</span>
											</Button>
										)
									})}
								</div>
							</ScrollArea>
						</div>
					</div>
					<div className="p-6 pt-0">
						<div className="mb-4 min-h-[80px] rounded-2xl bg-gray-50 p-4">
							{summary ? (
								<div className="space-y-2">
									{/* <h3 className="text-md flex items-center font-semibold">
										Selected Meetup
									</h3> */}
									<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
										<div className="flex items-center">
											<Icon
												name="calendar"
												className="mr-2 h-4 w-4 text-muted-foreground"
											/>
											<span className="text-sm">{summary.date}</span>
										</div>
										<div className="flex items-center">
											<Icon
												name="clock"
												className="mr-2 h-4 w-4 text-muted-foreground"
											/>
											<span className="text-sm">
												{summary.startTime} - {summary.endTime}
											</span>
										</div>
										<div className="flex items-center sm:col-span-2">
											<Icon
												name="users"
												className="mr-2 h-4 w-4 text-muted-foreground"
											/>
											<span className="text-sm">Busy Level: </span>
											<span
												className={cn(
													'ml-1 rounded-full px-2 py-0.5 text-xs',
													getBusyLevelColor(summary.busyLevel),
												)}
											>
												{summary.busyLevel}
											</span>
										</div>
									</div>
									{summary.busyLevel === 'Busy' && (
										<Alert variant="warning" className="mt-2">
											<Icon name="exclamation-triangle" className="h-4 w-4" />
											<AlertDescription>
												This is a busy time. We recommend arriving 30 minutes
												early to secure a table.
											</AlertDescription>
										</Alert>
									)}
									{summary.busyLevel === 'Moderate' && (
										<Alert variant="warning" className="mt-2">
											<Icon name="exclamation-circle" className="h-4 w-4" />
											<AlertDescription>
												This is a moderately busy time. We suggest arriving 15
												minutes early to find a table.
											</AlertDescription>
										</Alert>
									)}
								</div>
							) : (
								<p className="flex items-center justify-center text-sm text-slate-500">
									Please select a date and time for your 30-minute meetup.
								</p>
							)}
						</div>
						<div className="flex justify-end">
							<DialogClose asChild>
								<Button
									onClick={handleConfirm}
									disabled={!date || !time}
									className="w-full"
								>
									Select
								</Button>
							</DialogClose>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}
