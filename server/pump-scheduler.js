var Q = require("q");
var Job = require("node-schedule").Job;
var configManager = require("./config-manager");
var tideManager = require("./tide-manager");
var logger = require("./logger")("pump-scheduler");
var oneMonth = 2592000000; // milliseconds in a month
var currentJob = null;

function isValidDate(date) {
	return !!date && date.getTime() > Date.now();
}

/*
	Steps:
		get tide data from database,
		check for valid time
		
		get high tide times from database
			if valid
				schedule pumps
			else if automatic mode
				fetch new data
					schedule pumps
			else
				throw fatal error "No valid tide times"

		after pumps are run, repeat process
*/
function start() {
	return tideManager.getNextTideDate()
		.then(function(date) {
			var manualMode = configManager.getConfig().manualMode;

			//date = new Date(Date.now() + 10000);

			if(isValidDate(date)) {
				logger.info("Scheduling pump job at '" + date + "'");
				return Q.promise(function(resolve, reject) {
					currentJob = new Job(function() {
						logger.info("Starting pumps at '" + (new Date()) + "'");
						setTimeout(resolve.bind(null, false), 3000);
					})
						.on("canceled", resolve.bind(null, true))
						.on("error", reject);

					currentJob.schedule(date);
				}).then(function(canceled) {
					logger.info("Pump cycle " + (canceled ? "canceled" : "finished") + " at '" + (new Date()) + "'")
				});
			} else {
				var now;
				if(manualMode) { // No valid times in manual mode is a fatal error
					logger.error("No valid dates found. Cannot fetch new dates in manual mode");
					return Q.reject(new Error("No valid dates found. Cannot fetch new dates in manual mode"));
				} else { // fetch and save tide dates
					logger.info("No valid date found. Fetching new data");
					return tideManager.fetchNewTideDates().then(start); // fetch new tide entries, run start once that's done
				}
			}
		});
}

function stop() {
	if(currentJob) {
		logger.info("Cancelling currently scheduled pump job");
		currentJob.cancel();
		currentJob = null;
	}
}

module.exports = {
	start: start,
	stop: stop
};