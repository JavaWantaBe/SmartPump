"use strict";

var _ = require("lodash"),
	$ = require("jquery"),
	View = require("backbone").View;

var Form = View.extend({
	initialize: function() {
		this.readonly = true;
	},

	readonlyCheckbox: function() {
		return this.input({
			type: "checkbox",
			checked: this.readonly
		}, this.toggleReadonly.bind(this), true);
	},

	toggleReadonly: function() {
		this.readonly = !this.readonly;
		$(".form-input").prop("disabled", this.readonly);
	},

	input: function(options, onChange, noDisable) {
		options = _.pairs(options || {}).map(function(pair) {
			return pair[0] + "=" + "'" + pair[1] + "'";
		}).join(" ");

		return $("<input "+options+" />")
			.addClass(noDisable ? "form-input-no-disable" : "form-input")
			.prop("disabled", this.readonly && !noDisable)
			.on("change", function(e) {
				(onChange || _.noop).call(this, $(this).val(), e);
			});
	}
});

module.exports = Form;