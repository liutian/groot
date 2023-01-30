const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const path = require('path');

module.exports = (env, args) => {
	const plugins = [];

	if (env.analyzer) {
		plugins.push(new BundleAnalyzerPlugin());
	}

	return {
		mode: 'production',
		bail: true,
		devtool: 'hidden-source-map',
		output: {
			filename: '[name].[contenthash].bundle.js',
			path: path.resolve(__dirname, '../dist'),
			clean: true
		},
		plugins
	}
}