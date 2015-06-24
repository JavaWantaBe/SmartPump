var _ = require("lodash");
var EventEmitter = require("events").EventEmitter;
var tideRetriever = require("./tide-retriever");
var getNextTideDate = require("./queries/get-next-tide-date");
var storeTideDates = require("./queries/store-tide-dates");
var getTideDates = require("./queries/get-tide-dates");

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
	// Returns a promise and causes a change event to be emitted.
	fetchNewTideDates: function() {
		var oneMonth = 1000 * 60 * 60 * 24 * 30;
		var now = Date.now();

		return tideRetriever.fetchTideDates(new Date(now), new Date(now + oneMonth))
			.then(this.setTideDates.bind(this));
	},

	// Stores the passed tide dates in the mysql server
	// Returns a promise and causes a change event to be emitted.
	setTideDates: function(tideDates) {
		return storeTideDates(tideDates).then(function() {
			this.emit("change", tideDates);
		});
	}
});
