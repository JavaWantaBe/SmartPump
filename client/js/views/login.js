"use strict";

var $ = require("jquery"),
	history = require("backbone").history,
	io = require("../utility/io"),
	View = require("backbone").View;

var LoginView = View.extend({
	submit: function() {
		var username = $("#username").val(),
			password = $("#password").val();

		io.post("/login", {
			username: username,
			password: password
		}).then(function(result) {
			history.navigate("/", {trigger: true});
		}, function(err) {
			$(".login-message").text("Invalid username or password");
		});
	},
	render: function() {
		var $el = this.$el;
		return $el.html(
			$("<form action='login'></form>").append(
				$("<p class='login-message'></p>"),
				$("<p>Username</p>"),
				$("<input type='text' name='username' id='username' />"),
				$("<p>Password</p>"),
				$("<input type='password' name='password' id='password' />"),
				$("<br/>"),
				$("<button>Login</button>")
			).on("submit", function(e) {
				e.preventDefault();
				this.submit();
			}.bind(this))
		);
	}
});

module.exports = LoginView;