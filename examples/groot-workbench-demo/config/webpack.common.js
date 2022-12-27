const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const ReactRefreshTypeScript = require('react-refresh-typescript');
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = (env, args) => {
	return {
		entry: './src/index.tsx',
		output: {
			filename: '[name].js',
			path: path.resolve(__dirname, '../dist'),
			clean: true,
		},
		resolve: {
			// 顺序很重要，惨痛教训！！！！！！！！！！
			extensions: ['.js', '.ts', '.d.ts', '.tsx', '.json'],
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
					test: /\.(tsx|ts)$/i,
					loader: 'ts-loader',
					exclude: env.prod ? /node_modules/ : undefined,
					options: {
						// 快速刷新
						getCustomTransformers: () => ({
							before: !env.prod ? [ReactRefreshTypeScript()] : [],
						}),
						// 快速刷新依赖 transpileOnly = true
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
				// 源码为修改需要紧急中止客户端缓存时使用
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
					{ from: 'public/**/*.*' }
				],
			}),

			new ModuleFederationPlugin({
				name: 'groot-workbench-demo',
				shared: {
					react: {
						eager: true,
						singleton: true,
						requiredVersion: '^18.2.0'
					},
					'react-dom': {
						eager: true,
						singleton: true,
						requiredVersion: '^18.2.0'
					},
					'react/jsx-runtime': {
						eager: true,
						singleton: true,
						requiredVersion: '^18.2.0'
					},
					antd: {
						eager: true,
						singleton: true,
						requiredVersion: '^4.21.3'
					},
					'@ant-design/icons': {
						singleton: true,
						eager: true,
						requiredVersion: '^4.7.0'
					},
					axios: {
						singleton: true,
						eager: true,
						requiredVersion: '^1.2.0'
					}
				},
			})
		]
	}
}