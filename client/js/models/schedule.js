"use strict";

var RestModel = require("./rest-model");

var Schedule = RestModel.extend({
	initialize: function() {
		this.set("path", "/schedule");
	},

	serialize: function() {
		return {
			entries: this.get("entries").map(function(entry) {
				return entry.date + " " + entry.time;
			})
		};
	},

	deserialize: function(data) {
		return {
			entries: data.entries.map(function(entry) {
				var split = entry.split(" "),
					date = split[0],
					time = split[1];

				return {
					date: date,
					time: time
				};
			})
		};
	}
});

module.exports = Schedule;