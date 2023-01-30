const webpack = require('webpack');
const CopyPlugin = require("copy-webpack-plugin");
const { ModuleFederationPlugin } = require('webpack').container;
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, args) => {
	return {
		entry: './src/index.tsx',
		resolve: {
			extensions: ['.tsx', '.ts', '.js'],
		},
		optimization: {
			splitChunks: {
				chunks: 'all',
				cacheGroups: {
					vendor: {
						name: 'vendor',
						test: /[\\/]node_modules[\\/]/,
						priority: -10,
					}
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
						transpileOnly: !env.prod,
						allowTsInNodeModules: !env.prod,
						compilerOptions: {
							declaration: !env.prod
						}
					}
				},
			],
		},
		plugins: [
			new HtmlWebpackPlugin({
				// 源码为修改需要紧急中止客户端缓存时使用
				// hash: true,
				publicPath: '/',
				templateParameters: {
					/**
					 * @todo 可定制部分
					 */
					rootId: env.ROOT_ID
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
				'process.env.APP_ENV': JSON.stringify(env.APP_ENV),
				'process.env.ROOT_ID': JSON.stringify(env.ROOT_ID)
			}),

			new CopyPlugin({
				patterns: [
					{ context: 'public/', from: '**/*.*' }
				],
			}),

			new ModuleFederationPlugin({
				name: 'pangu',
				shared: {
					/**
					 * @todo 可定制部分
					 */
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
						requiredVersion: '^5.1.6'
					},
					'@ant-design/icons': {
						singleton: true,
						eager: true,
						requiredVersion: '^5.0.1'
					},
					axios: {
						singleton: true,
						eager: true,
						requiredVersion: '^1.2.6'
					},
					dayjs: {
						singleton: true,
						eager: true,
						requiredVersion: '^1.11.7'
					},
					'@grootio/common': {
						singleton: true,
						eager: true,
						requiredVersion: '^0.0.1'
					}
				}
			})
		]
	}
}