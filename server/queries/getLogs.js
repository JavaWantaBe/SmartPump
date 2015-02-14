"use strict";

var db = require("../database");


/*
	@returns
		promise - resolves all logs
*/
module.exports = function() {
	var query = "SELECT level, message, timestamp FROM log";

	return db.query(query).then(function(result) {
		return result;
	});
};