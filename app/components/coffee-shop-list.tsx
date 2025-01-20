// import { useState } from 'react'
import { Button } from '#app/components/ui/button.tsx'
import { Card, CardContent } from '#app/components/ui/card.tsx'
import { Icon } from '#app/components/ui/icon.tsx'

interface CoffeeShop {
	id: number
	name: string
	address: string
	rating: number
	distance: number
}

const sampleCoffeeShops: CoffeeShop[] = [
	{
		id: 1,
		name: 'Brew & Code Café',
		address: '123 Tech Street',
		rating: 4.5,
		distance: 0.3,
	},
	{
		id: 2,
		name: 'Starbooks Coffee',
		address: '456 Novel Avenue',
		rating: 4.2,
		distance: 0.7,
	},
	{
		id: 3,
		name: "Entrepreneur's Espresso",
		address: '789 Startup Road',
		rating: 4.8,
		distance: 1.1,
	},
	{
		id: 4,
		name: 'Byte Bakery & Coffee',
		address: '101 Digital Drive',
		rating: 4.0,
		distance: 1.5,
	},
	{
		id: 5,
		name: 'Mocha Meetup Spot',
		address: '202 Network Lane',
		rating: 4.6,
		distance: 0.9,
	},
]

export default function CoffeeShopList() {
	return (
		<div>
			<h2 className="mb-6 flex items-center text-2xl font-semibold text-gray-800 dark:text-gray-100">
				Available Locations
			</h2>
			<div className="space-y-0">
				{sampleCoffeeShops.map((shop) => (
					<div
						key={shop.id}
						className="flex items-center justify-between border-b border-gray-200 py-4 last:border-b-0 dark:border-gray-700"
					>
						<div>
							<h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-gray-100">
								{shop.name}
							</h3>
							<p className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
								<Icon name="map-pin" className="mr-1 h-4 w-4" />
								{shop.address}
							</p>
							<div className="mt-2 flex items-center text-sm text-yellow-500">
								<Icon name="star" className="mr-1 h-4 w-4" />
								<span>{shop.rating.toFixed(1)}</span>
							</div>
						</div>
						<div className="flex items-center">
							<img
								src={
									'https://images.unsplash.com/photo-1446226760091-cc85becf39b4?q=80&w=3474&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
								}
								alt={`${shop.name} thumbnail`}
								width={60}
								height={60}
								className="rounded-md"
							/>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
