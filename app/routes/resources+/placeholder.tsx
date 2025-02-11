// import { type LoaderFunctionArgs } from '@remix-run/node'

export async function loader() {
	const svg = `<svg width="800" height="400" viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
		<rect width="800" height="400" fill="#E5E7EB"/>
		<path d="M369.3 174.3c5.3-5.3 5.3-13.8 0-19.1l-28.3-28.3c-5.3-5.3-13.8-5.3-19.1 0l-84.6 84.6c-5.3 5.3-5.3 13.8 0 19.1l28.3 28.3c5.3 5.3 13.8 5.3 19.1 0l84.6-84.6z" fill="#9CA3AF"/>
		<path d="M430.7 174.3c-5.3-5.3-5.3-13.8 0-19.1l28.3-28.3c5.3-5.3 13.8-5.3 19.1 0l84.6 84.6c5.3 5.3 5.3 13.8 0 19.1l-28.3 28.3c-5.3 5.3-13.8 5.3-19.1 0l-84.6-84.6z" fill="#9CA3AF"/>
		<text x="400" y="220" text-anchor="middle" font-family="system-ui" font-size="24" fill="#4B5563">No Image Available</text>
	</svg>`

	return new Response(svg, {
		headers: {
			'Content-Type': 'image/svg+xml',
			'Cache-Control': 'public, max-age=31536000, immutable',
		},
	})
}
