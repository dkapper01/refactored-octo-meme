import { default as defaultConfig } from '@epic-web/config/eslint'

/** @type {import("eslint").Linter.Config} */
export default [
	...defaultConfig,
	{
		files: ['**/tests/**/*.ts'],
		rules: { 'react-hooks/rules-of-hooks': 'off' },
	},
]
