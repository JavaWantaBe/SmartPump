"use strict";

var $ = require("jquery"),
	Form = require("./form");

var Settings = Form.extend({
	addressInputs: function(bytes, label) {
		return $("<div class='address-input'></div>")
			.append($("<p></p>").text(label))
			.append(bytes.map(function(value, index) {
				return this.input({
					type: "number",
					min: 0,
					max: 255,
					value: value
				}, function(newVal) {
					bytes[index] = newVal;
				});
			}.bind(this)));
	},

	render: function() {
		var model = this.model,
			$el = this.$el,
			settings = model.get("settings"),
			$form = $("<form></form>").append(
				$("<p>Read Only</p>"),
				this.readonlyCheckbox(),
				this.addressInputs(settings.ip,      "IP Address"),
				this.addressInputs(settings.subnet,  "Subnet Mask"),
				this.addressInputs(settings.gateway, "Default Gateway"),
				$("<button>Save</button>")
			).on("submit", function(e) {
				e.preventDefault();
				model.sync().then(this.render.bind(this));
			}.bind(this));

		$el.html($form);

		return $el;
	}
});

module.exports = Settings;