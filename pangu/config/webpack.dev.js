const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = (env, args) => {
  return {
    mode: "development",
    output: {
    },
    devtool: 'source-map',
    cache: {
      type: 'filesystem',
    },
    plugins: [
      new ForkTsCheckerWebpackPlugin({

      }),
    ],
  }
}