"use strict";

var RestModel = require("./rest-model");

var Log = RestModel.extend({
	initialize: function() {
		this.set("path", "/log");
	}
});

module.exports = Log;