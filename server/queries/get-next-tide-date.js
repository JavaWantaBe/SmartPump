var db = require("../database");
var QUERY = "SELECT * FROM tide";

/*
	returns a promise that resolves to a javascript date object or null if no valid date is found
*/
module.exports = function getNextTideDateQuery() {
	return db.query(QUERY).then(function(entries) {
		var validEntries = entries.map(function(entry) {
			return new Date(entry.tide_time);
		}).filter(function(date) {
			return date.getTime() > Date.now();
		})

		return validEntries.reduce(function(nearestDate, date) {
			return date.getTime() < nearestDate.getTime() ? date : nearestDate;
		}, validEntries[0]);
	});
};
