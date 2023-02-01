import { merge } from 'webpack-merge';
import commonConfig from './config/webpack.common';
import devConfig from './config/webpack.dev';
import prodConfig from './config/webpack.prod';

import pangu from './pangu';

const config = (env, args) => {
	const panguConfig = pangu();
	let options = commonConfig(env, args, panguConfig);

	if (env.prod) {
		options = merge(options, prodConfig(env, args, panguConfig));
	} else {
		options = merge(options, devConfig(env, args, panguConfig));
	}

	return options;
};

export default config;