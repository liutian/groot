const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;


module.exports = (env, args) => {
	const plugins = [
		new MiniCssExtractPlugin({
			filename: '[name].[contenthash].bundle.css',
			chunkFilename: '[id].[contenthash].bundle.css',
		})
	];

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
		optimization: {
			minimizer: [
				new CssMinimizerPlugin(),
				'...'
			],
		},
		plugins
	}
}