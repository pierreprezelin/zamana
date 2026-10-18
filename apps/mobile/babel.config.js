module.exports = (api) => {
	api.cache(true);
	return {
		plugins: ["transform-remove-console"],
		presets: ["babel-preset-expo"],
	};
};
