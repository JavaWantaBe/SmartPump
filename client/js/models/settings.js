"use strict";

var RestModel = require("./rest-model");

var Settings = RestModel.extend({
	initialize: function() {
		this.set("path", "/settings");
	}
});

module.exports = Settings;