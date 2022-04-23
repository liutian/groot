// const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const proxyMap = require('./proxy');


module.exports = (env, args) => {
  return {
    mode: "development",
    output: {
    },
    devtool: 'inline-source-map',
    cache: {
      type: 'filesystem',
    },
    devServer: {
      historyApiFallback: true,
      proxy: proxyMap[env.APP_ENV],
      hot: true
    },
    plugins: [
      new ForkTsCheckerWebpackPlugin({

      }),
      new ReactRefreshWebpackPlugin()
    ],
  }
}