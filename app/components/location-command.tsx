import { useState } from 'react'
import { Button } from '#app/components/ui/button.tsx'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '#app/components/ui/command.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '#app/components/ui/popover.tsx'
import { ScrollArea } from '#app/components/ui/scroll-area.tsx'
import { combineAddress } from '#app/utils/combine-address.ts'
import { cn } from '#app/utils/misc.tsx'

const PLACEHOLDER_IMAGE =
	'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNODAgOTBIMTIwVjExMEg4MFY5MFoiIGZpbGw9IiM5Q0EzQUYiLz48cGF0aCBkPSJNNjUgNzBIMTM1VjEzMEg2NVY3MFoiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+'

interface CoffeeShop {
	name: string
	address: string
	image?: string
}

export default function CoffeeShopFinder({
	locations,
	setLocationId,
}: {
	locations: Array<{
		id: string
		name: string
		address: {
			street: string
			city: string
			state: string
			zip: string
		} | null
	}>
	setLocationId: (locationId: string) => void
}) {
	const [open, setOpen] = useState(false)
	const [selectedShop, setSelectedShop] = useState<CoffeeShop | null>()

	const openGoogleMaps = (shop: { name: string; address: string }) => {
		window.open(
			`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.name + ' ' + shop.address)}`,
			'_blank',
		)
	}

	const ShopItem = ({
		shop,
		showMapButton = true,
		isSelected = false,
	}: {
		shop: CoffeeShop
		showMapButton?: boolean
		isSelected?: boolean
	}) => (
		<div
			className={cn(
				'flex items-center rounded-lg px-4 py-3 transition-all duration-200',
				isSelected ? 'bg-primary/10' : 'hover:bg-muted/50',
			)}
		>
			<div className="relative mr-3 flex-shrink-0">
				<img
					src={PLACEHOLDER_IMAGE}
					alt={`${shop.name} coffee shop`}
					className="h-12 w-12 rounded-md object-cover"
				/>
			</div>
			<div className="mr-2 flex flex-grow flex-col">
				<h3 className="text-md font-medium">{shop.name}</h3>
				<p className="line-clamp-1 flex items-center text-xs text-muted-foreground">
					<Icon name="map-pin" className="mr-1 h-4 w-4 flex-shrink-0" />
					{shop.address}
				</p>
			</div>
			{showMapButton && (
				<Button
					variant="ghost"
					size="sm"
					className="absolute bottom-2 right-2 ml-auto h-8 px-2 transition-colors duration-200 hover:bg-primary/10"
					onClick={(e) => {
						e.stopPropagation()
						openGoogleMaps({
							name: shop.name,
							address: shop.address ?? 'No address available',
						})
					}}
				>
					<Icon
						name="arrow-top-right-on-square"
						className="h-4 w-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
					/>
					<span className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200">
						Open in Maps
					</span>
				</Button>
			)}
		</div>
	)

	return (
		<div className="mx-auto w-full">
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button variant="outline" className="mt-1 w-full justify-between">
						{selectedShop ? (
							<>
								<div className="flex items-center">
									<Icon
										name="building-storefront"
										className="mr-2 h-4 w-4 text-muted-foreground"
									/>
									{selectedShop.name}
								</div>
							</>
						) : (
							<>Select a coffee shop</>
						)}
						<Icon
							name="chevron-down"
							className="ml-2 h-4 w-4 text-muted-foreground"
						/>
					</Button>
				</PopoverTrigger>
				<PopoverContent
					className="max-h-[300px] w-[var(--radix-popover-trigger-width)] overflow-hidden p-0"
					align="start"
					sideOffset={5}
				>
					<Command className="w-full">
						<CommandInput placeholder="Search coffee shops..." />
						<CommandList>
							<CommandEmpty>No coffee shops found.</CommandEmpty>
							<CommandGroup heading="Coffee Shops">
								<ScrollArea className="h-[300px]">
									{locations.map((shop) => (
										<CommandItem
											key={shop.name}
											value={shop.name}
											onSelect={() => {
												setLocationId(shop.id)
												setSelectedShop({
													name: shop.name,
													address: shop.address
														? combineAddress(shop.address)
														: '',
													image: '',
												})
												setOpen(false)
											}}
											className="flex cursor-pointer items-center px-4 py-3 transition-colors hover:bg-muted/50"
										>
											<div className="mr-3 flex-shrink-0">
												<img
													src={PLACEHOLDER_IMAGE}
													alt={`${shop.name} coffee shop`}
													className="h-12 w-12 rounded-md object-cover"
												/>
											</div>
											<div className="mr-2 flex flex-grow flex-col">
												<h3 className="text-sm font-semibold">{shop.name}</h3>
												<p className="text-md mt-1 line-clamp-1 flex items-center text-muted-foreground">
													<Icon
														name="map-pin"
														className="mr-1 h-4 w-4 flex-shrink-0"
													/>
													{shop.address
														? combineAddress(shop.address)
														: 'No address available'}
												</p>
											</div>
											<Button
												variant="ghost"
												size="sm"
												className="ml-auto h-6 p-0 hover:bg-transparent"
												onClick={(e) => {
													e.stopPropagation()
													openGoogleMaps({
														name: shop.name,
														address: shop.address
															? combineAddress(shop.address)
															: 'No address available',
													})
												}}
											>
												<Icon
													name="arrow-top-right-on-square"
													className="h-4 w-4"
												/>
											</Button>
										</CommandItem>
									))}
								</ScrollArea>
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>

			{selectedShop && (
				<div
					className={cn(
						'mt-2 w-full overflow-hidden rounded-lg bg-white transition-all duration-300 ease-in-out',
						open ? 'opacity-50' : 'opacity-100',
					)}
				>
					<div className="relative">
						<ShopItem
							shop={selectedShop}
							showMapButton={true}
							isSelected={true}
						/>
					</div>
				</div>
			)}
		</div>
	)
}
