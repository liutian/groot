const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;


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
		},
		plugins
	}
}