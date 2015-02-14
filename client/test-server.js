"use strict";

var express     = require("express"),
	bodyParser  = require("body-parser"),
	cookieParser= require("cookie-parser"),
	session	    = require("express-session"),
	morgan		= require("morgan"),
	flash		= require("connect-flash"),
	passport	= require("passport"),
	LocalStrategy = require("passport-local").Strategy,
	app         = express(),
	port        = 1080,
	staticFiles = __dirname + "/../server/public";

var settings = {
	settings: {
		ip: [192,168,1,1],
		subnet: [255,255,255,0],
		gateway: [192,168,1,1]
	}
};

var schedule = {
	entries: [ //format: YYYY-MM-DD HH:MM:SS
		"2014-11-12 07:23:00",
		"2014-11-12 08:37:00",
		"2014-11-12 13:42:00",
		"2014-11-12 15:21:00",
		"2014-11-13 03:18:00",
		"2014-11-13 08:44:00",
		"2014-11-13 12:48:00",
		"2014-11-13 16:59:00",
		"2014-11-13 19:11:00",
		"2014-11-13 22:14:00"
	]
};

function error(message) {
	return {
		error: {
			message: message
		}
	};
}

app.use(morgan("dev"));
app.use(bodyParser());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(flash());
app.use(session({secret: "this is my really creative secret"}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(staticFiles));

// Settings
app.route("/settings")
	.get(checkAuthenticated, function(req, res) {
		res.json(settings);
	})
	.post(checkAuthenticated, function(req, res) {
		if(req.body && req.body.settings) {
			settings = req.body;
			console.log("Set settings",settings);
		}
		else {
			console.log(req.body);
		}
		res.json(settings);
	});

// Schedule
app.route("/schedule")
	.get(checkAuthenticated, function(req, res) {
		res.json(schedule);
	})
	.post(checkAuthenticated, function(req, res) {
		if(req.body && req.body.entries) {
			schedule = req.body;
			console.log("Set schedule",schedule);
		}
		else {
			console.log(req.body);
		}
		res.json(schedule);
	});

// Log
app.route("/log")
	.get(checkAuthenticated, function(req, res) {
		req.json({
			log: "this is the log"
		})
	});

app.route("/login")
	.post(passport.authenticate("local-login"), 
	function(req, res) {
		console.log("/login authenticated successfully", req.body);
		res.json("success");
	});

passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(user, done) {
	done(null, user);
});

function validateUser(username, password) {
	return username === "jimmy" && password === "password123";
}

function checkAuthenticated(req, res, next) {
	if(req.isAuthenticated()) {
		return next();
	}
	res.json({
		autherror: true
	});
}

var strategy = new LocalStrategy({
	usernameField: "username",
	passwordField: "password",
	passReqToCallback: true
}, function(req, username, password, done) {
	if(validateUser(username, password)) {
		done(null, {
			username: username
		});
	}
	else {
		done("User not valid");
	}
});

passport.use("local-login", strategy);

console.log("Listening on port " + port);
app.listen(port);