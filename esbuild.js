const { NodeModulesPolyfillPlugin } = require('@esbuild-plugins/node-modules-polyfill')
const { build } = require('esbuild')
build({
	entryPoints: ['./src/code-stats.ts'],
	plugins: [NodeModulesPolyfillPlugin()],
	bundle: true,
	minify: true,
	sourcemap: true,
	target: ['es2016', 'chrome90', 'firefox78', 'safari14', 'edge90'],
	external: ['vscode', 'node-fetch'],
	outfile: 'out/browser.js',
	format: 'cjs',
	platform: 'node'
})