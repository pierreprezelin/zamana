// A zone with daylight saving time, so date tests run the same on every machine
module.exports = () => {
	process.env.TZ = "Europe/Paris";
};
