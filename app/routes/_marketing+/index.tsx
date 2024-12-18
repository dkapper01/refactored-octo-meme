import { type MetaFunction } from '@remix-run/node'
import { Button } from '#app/components/ui/button.tsx'
import { Link } from '@remix-run/react'
// import { MapPin, Users, ArrowRight } from 'lucide-react'

export const meta: MetaFunction = () => [{ title: 'Epic Notes' }]

export default function Index() {
	return (
		<main className="">
			<div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-purple-200 p-4">
				<h1 className="mb-4 text-6xl font-bold text-blue-800">Micro Meetup</h1>
				<p className="mb-8 text-xl text-blue-700">
					Connect with people nearby for spontaneous meetups!
				</p>
				<div className="flex flex-col justify-center gap-4 sm:flex-row">
					<Link to="/host">
						<Button
							size="lg"
							className="w-full transform bg-blue-600 transition-all duration-300 ease-in-out hover:scale-105 hover:bg-blue-700 sm:w-auto"
						>
							{/* <MapPin className="mr-2 h-5 w-5" />  */}
							Host a Micro Meetup
						</Button>
					</Link>
					<Link to="/map">
						<Button
							size="lg"
							variant="outline"
							className="w-full transform border-blue-600 text-blue-600 transition-all duration-300 ease-in-out hover:scale-105 hover:bg-blue-100 sm:w-auto"
						>
							{/* <Users className="mr-2 h-5 w-5" /> */}
							Find Nearby Meetups
						</Button>
					</Link>
				</div>
				<span className="mr-2">Learn how it works</span>
				{/* <ArrowRight className="h-5 w-5" /> */}
			</div>
		</main>
	)
}
