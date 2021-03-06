const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');


module.exports = (env, args) => {
	return {
		entry: './src/index.tsx',
		output: {
			filename: '[name].js',
			path: path.resolve(__dirname, '../dist'),
			clean: true,
		},
		resolve: {
			extensions: ['.tsx', '.ts', '.less', '.js'],
			alias: {
				styles: path.resolve(__dirname, 'src/styles/'),
			},
			plugins: [
				new TsconfigPathsPlugin({

				})
			]
		},
		optimization: {
			runtimeChunk: {
				name: (entrypoint) => `runtimechunk~${entrypoint.name}`,
			},
			splitChunks: {
				chunks: 'all',
				cacheGroups: {
					vendor: {
						name: 'vendor',
						test: /[\\/]node_modules[\\/]/,
						priority: -10,
					},
					common: {
						name: 'common',
						minChunks: 2,
						priority: -20,
					},
				},
			}
		},
		module: {
			rules: [
				{
					test: /\.css$/,
					use: ['style-loader', 'css-loader']
				},
				{
					test: /\.ttf$/,
					use: ['file-loader']
				},
				{
					test: /\.(tsx|ts)$/i,
					loader: 'ts-loader',
					exclude: env.prod ? /node_modules/ : undefined,
					options: {
						transpileOnly: !env.prod,
						allowTsInNodeModules: !env.prod,
						compilerOptions: {
							declaration: !env.prod
						}
					}
				},
				{
					test: /\.less$/i,
					use: [
						env.prod ? {
							loader: MiniCssExtractPlugin.loader,
						} : 'style-loader',

						{
							loader: 'css-loader',
							options: {
								modules: {
									auto: /\.module\.less$/i,
									localIdentName: '[name]__[local]--[hash:base64:5]'
								}
							}
						},
						{
							loader: 'less-loader',
							options: {
								lessOptions: { javascriptEnabled: true },
							},
						}
					],
				}
			],
		},
		plugins: [
			new HtmlWebpackPlugin({
				// ?????????????????????????????????????????????????????????
				// hash: true,
				publicPath: '/',
				templateParameters: {
					title: 'playground'
				},
				minify: env.prod ? {
					removeComments: true,
					collapseWhitespace: true,
					removeRedundantAttributes: true,
					useShortDoctype: true,
					removeEmptyAttributes: true,
					removeStyleLinkTypeAttributes: true,
					keepClosingSlash: true,
					minifyJS: true,
					minifyCSS: true,
					minifyURLs: true,
				} : undefined,
			}),

			new webpack.DefinePlugin({
				'process.env.APP': JSON.stringify('dev'),
			}),

			new CopyPlugin({
				patterns: [
					{ from: "public/**/*.*" }
				],
			}),

			new MonacoWebpackPlugin()
		]
	}
}