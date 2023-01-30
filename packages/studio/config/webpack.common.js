const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = (env, args) => {

	return {
		output: {
			publicPath: 'auto'
		},
		resolve: {
			// 顺序很重要，惨痛教训！！！！！！！！！！
			extensions: ['.js', '.ts', '.d.ts', '.tsx', '.json'],
			plugins: [
				new TsconfigPathsPlugin({

				})
			]
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
				{
					test: /\.less$/i,
					use: [
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
			new CopyPlugin({
				patterns: [
					{ context: 'public/', from: '**/*.*' }
				],
			}),

			new ModuleFederationPlugin({
				name: 'grootStudio',
				filename: 'studio/index.js',
				exposes: {
					Main: './src',
				},
				shared: {
					react: {
						singleton: true,
						requiredVersion: '^18.2.0'
					},
					'react/jsx-runtime': {
						singleton: true,
						requiredVersion: '^18.2.0'
					},
					'react-dom': {
						singleton: true,
						requiredVersion: '^18.2.0'
					},
					antd: {
						singleton: true,
						requiredVersion: '^5.1.6',
					},
					'@ant-design/icons': {
						singleton: true,
						requiredVersion: '^5.0.1'
					},
					axios: {
						singleton: true,
						requiredVersion: '^1.2.6'
					},
					dayjs: {
						singleton: true,
						requiredVersion: '^1.11.7'
					},
					'@grootio/common': {
						singleton: true,
						requiredVersion: '^0.0.1'
					}
				},
			})
		]
	}
}