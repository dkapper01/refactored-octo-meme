import { type MetaFunction } from '@remix-run/node'
import { Button } from '#app/components/ui/button.tsx'

export const meta: MetaFunction = () => [{ title: 'Epic Notes' }]

export default function Index() {
	return (
		<div className="relative flex flex-col bg-white text-gray-800">
			<main className="flex flex-1 flex-col items-center justify-center">
				<div className="mx-auto w-full max-w-6xl space-y-24 px-6 py-12 lg:px-10">
					<section className="space-y-8 py-16 text-center">
						<div className="relative overflow-hidden rounded-3xl px-8 py-16">
							<div className="absolute inset-0 -z-10 bg-blue-50"></div>
							<h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
								Network in Boston,
								<br />
								<span className="text-blue-600">Elevate Your Career</span>
							</h1>
							<p className="mx-auto mb-8 max-w-3xl text-xl text-gray-600">
								Host or join professional micro-meetups of 2-5 people in
								Boston's finest cafes. Expand your network, exchange industry
								insights, and foster valuable connections in the Hub.
							</p>
							<div className="flex flex-col justify-center gap-4 sm:flex-row">
								<Button
									size="lg"
									className="bg-blue-600 text-white shadow-md transition-colors hover:bg-blue-700"
								>
									Host a Meetup
								</Button>
								<Button
									size="lg"
									variant="outline"
									className="border-blue-600 bg-white text-blue-600 shadow-md transition-colors hover:bg-blue-50"
								>
									Find a Meetup
								</Button>
							</div>
						</div>
					</section>
				</div>
			</main>
		</div>
	)
}
