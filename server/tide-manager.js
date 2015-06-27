var _ = require("lodash");
var EventEmitter = require("events").EventEmitter;
var logger = require("./logger")("tide-manager");
var downloadTideData = require("./download-tide-data");
var parseTideData = require("./parse-tide-data");
var getNextTideDate = require("./queries/get-next-tide-date");
var storeTideDates = require("./queries/store-tide-dates");
var getTideDates = require("./queries/get-tide-dates");

function saveTideDates(tideDates) {
  logger.info("Saving tide dates to MySQL server");
  return storeTideDates(tideDates)
    .then(function() {
      logger.info("Tide dates successfully saved to MySQL server");
    }.bind(this))
    .catch(function(error) {
      throw new Error("Failed to save tide data to MySQL server: " + error);
    });
}

/*
  This module should handle all getting/setting of tide dates.

  The tide manager object is an event emitter and emits a change event
  when it receives new tide data either internally from inside
  `fetchNewTideDates` or externally (such as from the webserver).
*/

module.exports = _.extend(new EventEmitter(), {
  // Returns a promise that resolves to either a date or null
  getNextTideDate: getNextTideDate,
  // Returns a promise that resolves to an array of Date objects
  getTideDates: getTideDates,
  // Requests, parses, and stores tide dates from NOAA.
  // Returns a promise, but does not cause an event to be emitted
  fetchNewTideDates: function() {
    var oneMonth = 1000 * 60 * 60 * 24 * 30;
    var now = Date.now();
    logger.info("Downloading new tide data");
    return downloadTideData({
      startDate: new Date(now),
      endDate: new Date(now + oneMonth)
    })
      .then(parseTideData)
      .catch(function(error) {
        throw new Error("Failed to download tide data: " + error);
      })
      .then(saveTideDates);
  },

  // Stores the passed tide dates in the mysql server
  // Returns a promise and causes a change event to be emitted.
  setTideDates: function(tideDates) {
    return saveTideDates(tideDates)
      .then(function() {
        this.emit("change", tideDates);
      });
  }
});
