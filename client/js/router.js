"use strict";

var Backbone = require("backbone"),
	Q        = require("q"),
	$        = require("jquery"),
	$outlet  = $(".content");

// Model classes
var Settings = require("./models/settings"),
	Schedule = require("./models/schedule"),
	Log 	 = require("./models/log");

// View classes
var DashboardView = require("./views/dashboard"),
	SettingsView  = require("./views/settings"),
	ScheduleView  = require("./views/schedule"),
	LogView       = require("./views/log"),
	LoginView	  = require("./views/login");

// Model/View instances
var dashboardView = new DashboardView(),
	settingsView = new SettingsView({
		model: new Settings()
	}),
	scheduleView = new ScheduleView({
		model: new Schedule()
	}),
	logView = new LogView({
		model: new Log()
	}),
	loginView = new LoginView();


function renderView(view) {
	return function() {
		if(view.model) {
			view.model.fetch().then(function() {
				$outlet.html(view.render());
			});
		}
		else {
			$outlet.html(view.render());
		}
	};
}

var Router = Backbone.Router.extend({
	routes: {
		"settings": "settings",
		"schedule": "schedule",
		"logs":     "logs",
		"login":    "login",
		"*actions": "dashboard" // index/default route
	},

	dashboard: renderView(dashboardView),
	settings:  renderView(settingsView),
	schedule:  renderView(scheduleView),
	logs:      renderView(logView),
	login: 	   renderView(loginView)
});

$("[data-link]").each(function() {
	var $this = $(this),
		dest = $this.data().link;

	$this.on("click", function(e) {
		e.preventDefault();
		Backbone.history.navigate(dest, {trigger: true});
	});
});

new Router();
Backbone.history.start();