
const { merge } = require('webpack-merge');
const commonConfig = require('./config/webpack.common');
const devConfig = require('./config/webpack.dev');
const prodConfig = require('./config/webpack.prod');

module.exports = (env, args) => {
	let options = commonConfig(env, args);

	if(env.prod){
		options = merge(options, prodConfig(env, args));
	}else{
		options = merge(options, devConfig(env, args));
	}

	return options;
};