import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import path from 'path';
import webpack from 'webpack';
import { PanguConfig } from '../pangu';

const config = (env, args, panguConfig: PanguConfig) => {
	const plugins: any[] = [];

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
	} as webpack.Configuration;
}

export default config;