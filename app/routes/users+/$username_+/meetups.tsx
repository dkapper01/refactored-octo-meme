// External packages
import { invariantResponse } from '@epic-web/invariant'
import { type SEOHandle } from '@nasa-gcn/remix-seo'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import {
	Link,
	Outlet,
	useLoaderData,
	useLocation,
	useParams,
	useMatches,
} from '@remix-run/react'
import { z } from 'zod'

// Internal components
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { Icon } from '#app/components/ui/icon.tsx'

// Utils
import { prisma } from '#app/utils/db.server.ts'
import { cn } from '#app/utils/misc.tsx'

export const BreadcrumbHandle = z.object({ breadcrumb: z.any() })
export type BreadcrumbHandle = z.infer<typeof BreadcrumbHandle>

export const handle: BreadcrumbHandle & SEOHandle = {
	breadcrumb: <Icon name="calendar">Meetups</Icon>,
	getSitemapEntries: () => null,
}

export async function loader({ params }: LoaderFunctionArgs) {
	const owner = await prisma.user.findFirst({
		select: {
			id: true,
			name: true,
			username: true,
			image: { select: { id: true } },
			meetups: {
				select: {
					id: true,
					title: true,
					createdAt: true,
					startTime: true,
					location: true,
					description: true,
				},
				orderBy: {
					startTime: 'desc',
				},
			},
		},
		where: { username: params.username },
	})

	invariantResponse(owner, 'Owner not found', { status: 404 })

	return json({ owner })
}

const BreadcrumbHandleMatch = z.object({
	handle: BreadcrumbHandle,
})

export default function MeetupsRoute() {
	const data = useLoaderData<typeof loader>()
	const location = useLocation()
	const params = useParams()
	const matches = useMatches()

	const isNew = location.pathname.endsWith('/new')
	const isEdit = location.pathname.includes('/edit')

	const currentMeetup = params.meetupId
		? data.owner.meetups.find((m) => m.id === params.meetupId)
		: null

	const breadcrumbs = matches
		.map((m) => {
			const result = BreadcrumbHandleMatch.safeParse(m)
			if (!result.success || !result.data.handle.breadcrumb) return null
			return (
				<Link key={m.id} to={m.pathname} className="flex items-center">
					{result.data.handle.breadcrumb}
				</Link>
			)
		})
		.filter(Boolean)

	return (
		<div className="mx-auto max-w-5xl">
			<nav className="mb-6">
				<ol className="flex items-center gap-3">
					{breadcrumbs.length ? (
						<>
							{breadcrumbs.map((breadcrumb, i, arr) => (
								<li
									key={i}
									className={cn('flex items-center gap-3', {
										'text-muted-foreground': i < arr.length - 1,
									})}
								>
									{breadcrumb}
									{i < arr.length - 1 ? (
										<Icon name="chevron-right" className="h-4 w-4" />
									) : null}
								</li>
							))}
						</>
					) : null}
					{currentMeetup ? (
						<>
							<li>
								<Icon name="chevron-right" className="h-4 w-4" />
							</li>
							<li>
								<span className="text-gray-900 dark:text-gray-100">
									{isEdit ? 'Edit: ' : ''}
									{currentMeetup.title}
								</span>
							</li>
						</>
					) : isNew ? (
						<>
							<li>
								<Icon name="chevron-right" className="h-4 w-4" />
							</li>
							<li>
								<span className="text-gray-900 dark:text-gray-100">
									New Meetup
								</span>
							</li>
						</>
					) : null}
				</ol>
			</nav>
			<Outlet />
		</div>
	)
}

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				404: ({ params }) => (
					<p>No user with the username "{params.username}" exists</p>
				),
			}}
		/>
	)
}
