module.exports = {
	root: true,
	extends: ['@walless/eslint-config'],
	ignorePatterns: ['node_modules'],
	env: {
		node: true,
	},
	rules: {
		'@typescript-eslint/no-explicit-any': 'off',
	},
	globals: {
		window: true,
		document: true,
		navigator: true,
		fetch: true,
		WebAssembly: true,
	},
};
