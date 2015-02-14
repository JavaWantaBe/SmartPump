"use strict";

var Q = require("q"),
	Backbone = require("backbone"),
	history = Backbone.history,
	Model = Backbone.Model,
	io = require("../utility/io");

var RestModel = Model.extend({
	serialize: function() {
		return this.attributes;
	},

	deserialize: function(data) {
		return data;
	},

	fetch: function() {
		var path = this.get("path");

		return io.get(path).then(function(data) {
			if(data.autherror) {
				history.navigate("/login", {trigger: true});
			}
			else {
				this.set(this.deserialize(data));
			}
		}.bind(this));
	},

	sync: function() {
		var serialized = this.serialize(),
			path = this.get("path");

		return io.post(path, serialized).then(function(data) {
			this.set(this.deserialize(JSON.parse(data)));
		}.bind(this), function() {

		});
	}
});

module.exports = RestModel;