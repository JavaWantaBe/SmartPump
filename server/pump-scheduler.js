var Q = require("q");
var Job = require("node-schedule").Job;
var configManager = require("./config-manager");
var tideManager = require("./tide-manager");
var logger = require("./logger")("pump-scheduler");
var pumps = require("./pumps");
var getCurrentPump = require("./queries/get-current-pump");
var pushPumpCycle = require("./queries/push-pump-cycle");
//var oneMonth = 2592000000; // milliseconds in a month
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

  return tideManager.getNextTideDate()  // Returns a date from the tideManager
    .then(function(date) {

      var manualMode = configManager.getConfig().manualMode; // Retrieves manual mode setting from config

      //date = new Date(Date.now() + 10000);

      if(isValidDate(date)) {  // Checks for valid date returned from tide manager

        logger.info("Scheduling pump job for '" + date + "'");

        return Q.promise(function(resolve, reject) {

          currentJob = new Job(function() {

            logger.info("Starting pumps");

            return getCurrentPump()
              .catch(function(error) { // just run pump1 if we fail to retrieve current pump

                  logger.error("Failed to retrieve current pump ID from database, running pump 0 " + error);

                  return pumps.startCycle(pumps, 0);
              })
              .then(pumps.startCycle.bind(pumps))
              .then(resolve, reject);
          })
          .on("canceled", resolve.bind(null, true))
          .on("error", reject);
          currentJob.schedule(date);

        }).then(function(resultObject) {

          logger.info("Pump cycle finished. Saving data to database");

          pushPumpCycle(resultObject)
            .catch(function(error) {

              logger.error("Failed to store pump cycle result data to database: " + error);

            });
        });
      } else {  // This only runs if date data is invalid

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
