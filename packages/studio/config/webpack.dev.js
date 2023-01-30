const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = (env, args) => {
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
    },
    plugins: [
      new ForkTsCheckerWebpackPlugin({

      }),
    ],
  }
}