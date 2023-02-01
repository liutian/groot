import webpack from 'webpack';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import { PanguConfig } from '../pangu';

const config = (env, args, panguConfig: PanguConfig) => {
  return {
    mode: "development",
    devtool: 'source-map',
    cache: {
      type: 'filesystem',
    },
    plugins: [
      new ForkTsCheckerWebpackPlugin({

      }),
    ],
  } as webpack.Configuration;
}

export default config;