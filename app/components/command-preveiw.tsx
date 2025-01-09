import {
	Combobox,
	ComboboxInput,
	ComboboxOption,
	ComboboxOptions,
	Dialog,
	DialogPanel,
	DialogBackdrop,
} from '@headlessui/react'
import { useState } from 'react'
import { Button } from '#app/components/ui/button.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { cn } from '#app/utils/misc.tsx'

interface Location {
	id: string
	name: string
	address: {
		street: string
		city: string
		state: string
		zip: string
	} | null
}

const combineAddress = (address: {
	street: string
	city: string
	state: string
	zip: string
}) => {
	return `${address.street}, ${address.city}, ${address.state} ${address.zip}`
}

export default function CommandPreview({
	open,
	setOpen,
	setLocation,
	locations = [],
}: {
	open: boolean
	setOpen: (open: boolean) => void
	setLocation: (location: { id: string; name: string; address: string }) => void
	locations: Location[]
}) {
	const recent = [locations[0], locations[1]]

	const [query, setQuery] = useState<string>('')

	const filteredLocation =
		query === ''
			? []
			: locations.filter((location) => {
					return location.name.toLowerCase().includes(query.toLowerCase())
				})

	return (
		<Dialog
			className="relative z-10"
			open={open}
			onClose={() => {
				setOpen(false)
				setQuery('')
			}}
		>
			<DialogBackdrop
				transition
				className="fixed inset-0 bg-gray-500/25 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
			/>

			<div className="fixed inset-0 z-10 w-screen overflow-y-auto p-4 sm:p-6 md:p-20">
				<DialogPanel
					transition
					className="mx-auto max-w-3xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5 transition-all data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
				>
					<Combobox<Location> onChange={() => {}}>
						{({ activeOption }) => (
							<div>
								<div className="grid grid-cols-1">
									<ComboboxInput
										autoFocus
										value={query}
										className="col-start-1 row-start-1 h-12 w-full pl-11 pr-4 text-base text-gray-900 outline-none placeholder:text-gray-400 sm:text-sm"
										placeholder="Search..."
										onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
											setQuery(event.target.value)
										}
										onBlur={() => setQuery('')}
									/>

									<Icon
										name="magnifying-glass"
										className="pointer-events-none col-start-1 row-start-1 ml-4 size-5 self-center text-gray-400"
										aria-hidden="true"
									/>
								</div>

								{(query === '' || filteredLocation.length > 0) && (
									<ComboboxOptions
										as="div"
										static
										hold
										className="flex transform-gpu divide-x divide-gray-100"
									>
										<div
											className={cn(
												'max-h-96 min-w-0 flex-auto scroll-py-4 overflow-y-auto px-6 py-4',
												activeOption ? 'sm:h-96' : '',
											)}
										>
											{query === '' && (
												<h2 className="mb-4 mt-2 text-xs font-semibold text-gray-500">
													Available locations
												</h2>
											)}
											<div className="-mx-2 text-sm text-gray-700">
												{(query === '' ? recent : filteredLocation).map(
													(location) => {
														if (!location) return null
														return (
															<ComboboxOption
																as="div"
																key={location.id}
																value={location}
																className="group flex cursor-default select-none items-center rounded-md p-2 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
															>
																{/* <img
																	src={location.imageUrl}
																	alt=""
																	className="size-6 flex-none rounded-full"
																/> */}
																<span className="ml-3 flex-auto truncate">
																	{location.name}
																</span>
																<Icon
																	name="chevron-right"
																	className="ml-3 hidden size-5 flex-none text-gray-400 group-data-[focus]:block"
																	aria-hidden="true"
																/>
															</ComboboxOption>
														)
													},
												)}
											</div>
										</div>

										{activeOption && (
											<div className="hidden h-96 w-1/2 flex-none flex-col divide-y divide-gray-100 overflow-y-auto sm:flex">
												<div className="flex-none bg-red-500 text-center">
													{/* <img
														src={activeOption.imageUrl}
														alt=""
														className="mx-auto object-cover"
													/> */}
												</div>
												<div className="flex flex-auto flex-col justify-between p-6">
													<dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm text-gray-700">
														<dt className="col-end-1 font-semibold text-gray-900">
															Name
														</dt>
														<dd>{activeOption.name}</dd>
														<dt className="col-end-1 font-semibold text-gray-900">
															Address
														</dt>
														<dd>
															{activeOption.address
																? combineAddress(activeOption.address)
																: 'No address available'}
														</dd>
													</dl>
													<Button
														type="button"
														onClick={() => {
															setOpen(false)
															setLocation({
																id: activeOption.id,
																name: activeOption.name,
																address: activeOption.address
																	? combineAddress(activeOption.address)
																	: 'No address available',
															})
														}}
													>
														Select
													</Button>
												</div>
											</div>
										)}
									</ComboboxOptions>
								)}

								{query !== '' && filteredLocation.length === 0 && (
									<div className="px-6 py-14 text-center text-sm sm:px-14">
										<Icon
											name="users"
											className="mx-auto size-6 text-gray-400"
											aria-hidden="true"
										/>
										<p className="mt-4 font-semibold text-gray-900">
											No location found
										</p>
										<p className="mt-2 text-gray-500">
											Sorry, we are working on adding more locations.
										</p>
									</div>
								)}
							</div>
						)}
					</Combobox>
				</DialogPanel>
			</div>
		</Dialog>
	)
}
