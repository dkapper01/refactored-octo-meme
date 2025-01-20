// import { useState } from 'react'
import { Button } from '#app/components/ui/button.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { Separator } from '#app/components/ui/separator.tsx'
// import { cn } from '#app/utils/misc.tsx'

interface CoffeeShop {
	id: number
	name: string
	address: string
	rating: number
}

const sampleCoffeeShops: CoffeeShop[] = [
	{ id: 1, name: 'Brew & Code Café', address: '123 Tech Street', rating: 4.5 },
	{ id: 2, name: 'Starbooks Coffee', address: '456 Novel Avenue', rating: 4.2 },
	{
		id: 3,
		name: "Entrepreneur's Espresso",
		address: '789 Startup Road',
		rating: 4.8,
	},
	{
		id: 4,
		name: 'Byte Bakery & Coffee',
		address: '101 Digital Drive',
		rating: 4.0,
	},
	{
		id: 5,
		name: 'Mocha Meetup Spot',
		address: '202 Network Lane',
		rating: 4.6,
	},
]

const PLACEHOLDER_IMAGE =
	'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNODAgOTBIMTIwVjExMEg4MFY5MFoiIGZpbGw9IiM5Q0EzQUYiLz48cGF0aCBkPSJNNjUgNzBIMTM1VjEzMEg2NVY3MFoiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+'

export default function CoffeeShopList() {
	// const [coffeeShops, setCoffeeShops] = useState<CoffeeShop[]>([])

	const openInGoogleMaps = (address: string) => {
		const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
		window.open(url, '_blank')
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="flex items-center text-2xl font-bold text-gray-900 dark:text-gray-100">
					Available Locations
				</h2>
			</div>
			<div className="space-y-0">
				{sampleCoffeeShops.map((shop, index) => (
					<div key={shop.id} className="bg-transparent p-2">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<img
									src={PLACEHOLDER_IMAGE}
									alt={`${shop.name} coffee shop`}
									className="h-12 w-12 rounded-md object-cover"
								/>
							</div>
							<div className="ml-3 flex-grow">
								<h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
									{shop.name}
								</h3>
								<p className="mt-0.5 flex items-center text-xs text-gray-500 dark:text-gray-400">
									<Icon name="map-pin" className="mr-1 h-3 w-3" />
									{shop.address}
								</p>
								<div className="mt-1 flex items-center justify-between">
									<div className="flex items-center">
										<Icon
											name="star"
											className="h-3 w-3 fill-current text-yellow-400"
										/>
										<span className="ml-1 text-xs font-medium text-gray-700 dark:text-gray-300">
											{shop.rating.toFixed(1)}
										</span>
									</div>
									<Button
										variant="ghost"
										size="sm"
										className="h-auto p-0 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
										onClick={() => openInGoogleMaps(shop.address)}
									>
										<Icon
											name="arrow-top-right-on-square"
											className="mr-1 h-3 w-3"
										/>
										Open in Maps
									</Button>
								</div>
							</div>
						</div>
						{index < sampleCoffeeShops.length - 1 && (
							<Separator className="my-2" />
						)}
					</div>
				))}
			</div>
			<p className="text-center text-sm italic text-gray-500 dark:text-gray-400">
				More coffee shops coming soon!
			</p>
		</div>
	)
}
