import webpack from 'webpack';
import CopyPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { PanguConfig } from '../pangu';

const { ModuleFederationPlugin } = webpack.container;

const config = (env, args, panguConfig: PanguConfig) => {
	return {
		entry: './src/index.tsx',
		resolve: {
			extensions: ['.tsx', '.ts', '.js'],
		},
		optimization: {
			/**
			 * src/index.tsx 必须强制引用所有公共依赖，然后必须强制将npm依赖单独打包，否则依赖包文件无法生成
			 */
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
				// 源码修改需要紧急中止客户端缓存时使用
				// hash: true,
				publicPath: '/',
				templateParameters: {
					rootId: panguConfig.rootId,
					APP_ENV: env.APP_ENV,
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
				'process.env.panguConfig': JSON.stringify(panguConfig)
			}),

			new CopyPlugin({
				patterns: [
					{ context: 'public/', from: '**/*.*' }
				],
			}),

			new ModuleFederationPlugin({
				name: 'pangu',
				shared: panguConfig.shared
			})
		]
	} as webpack.Configuration;
}

export default config;