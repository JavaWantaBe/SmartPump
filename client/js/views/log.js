"use strict";

var $ = require("jquery"),
	Backbone = require("backbone");

var Logs = Backbone.View.extend({
	render: function() {
		var $el = this.$el = $("<div class='logs'></div>"),
			logs = this.model.get("logs");
		var $table = $("<table></table>").append(
			$("<tr></tr>").append(
				$("<th>Timestamp</th>"),
				$("<th>Message</th>")
			),
			logs.map(function(log) {
				return $("<tr></tr>").append(
					$("<td></td>").text(log.timestamp),
					$("<td></td>").text(log.message)
				);
			})
		);

		return $el.append($table);
	}
});

module.exports = Logs;