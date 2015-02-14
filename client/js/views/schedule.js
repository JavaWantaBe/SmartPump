"use strict";

var Form     = require("./form"),
	_        = require("underscore"),
	$        = require("jquery");

var Schedule = Form.extend({

	setEntry: function(entry, key) {
		return function(value) {
			entry[key] = value;
		}.bind(this);
	},

	render: function() {
		var entries = this.model.get("entries");
		var el = $("<div></div>");
		var table = $("<table></table>");
		var rows = entries.map(function(entry) {
			var dateInput = this.input({type: "date", value: entry.date}, this.setEntry(entry, "date")),
				timeInput = this.input({type: "time", value: entry.time}, this.setEntry(entry, "time"));

			return $("<tr></tr>")
				.append(
					$("<td></td>").append(dateInput),
					$("<td></td>").append(timeInput)
				);
		}.bind(this));

		var saveButton = $("<button>Save</button>")
			.on("click", function() {
				this.model.sync.call(this.model).then(function() {
					this.render();
				});
			}.bind(this));

		var addButton = $("<button></button>");

		el.append(
			table.append(rows),
			saveButton
		);

		return el;
	}
});

module.exports = Schedule;