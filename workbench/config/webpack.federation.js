const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { merge } = require('webpack-merge');
const webpack = require('webpack');
const path = require('path');


module.exports = (env, args) => {
  let options = commonConfig(env, args);

  if (env.prod) {
    options = merge(options, prodConfig(env, args));
  } else {
    options = merge(options, devConfig(env, args));
  }

  return options;
}

const commonConfig = (env, args) => {
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
            allowTsInNodeModules: !env.prod,
            compilerOptions: {
              declaration: false
            }
          }
        },
        {
          test: /\.less$/i,
          use: [
            'style-loader',
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

      new webpack.DefinePlugin({
        'process.env.APP': JSON.stringify('dev'),
      }),

      new ModuleFederationPlugin({
        name: 'grootWorkbench',
        filename: 'workbench/index.js',
        exposes: {
          Instance: './src/pages/Instance',
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
            requiredVersion: '^4.21.3',
          },
          '@ant-design/icons': {
            singleton: true,
            requiredVersion: '^4.7.0'
          },
          'zone.js': {
            singleton: true,
            requiredVersion: '^0.12.0'
          },
          axios: {
            singleton: true,
            requiredVersion: '^1.2.0'
          }
        },
      })
    ]
  }
}

const devConfig = (env, args) => {
  return {
    mode: "development",
    devtool: 'source-map',
    cache: {
      type: 'filesystem',
    },
    devServer: {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
      },
      hot: false // 热更新在模块联邦下无效
    }
  }
}

const prodConfig = (env, args) => {
  return {
    mode: 'production',
    output: {
      filename: '[name].[contenthash].bundle.js',
      path: path.resolve(__dirname, '../groot-workbench-dist'),
      clean: true,
    },
    bail: true,
    devtool: 'hidden-source-map',
    optimization: {
      minimizer: [
        new CssMinimizerPlugin(),
        '...'
      ],
    },
  }
}