var _ = require("lodash");
var Q = require("q");
var express = require("express");
var morgan = require("morgan");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var session = require("express-session");
var flash = require("connect-flash");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var app = express();
var port = 1080;
var staticFiles = __dirname + "/public";
require("babel/register");

var log = require("./logger").bind(null, "server");
var user = require("./config/auth");
var networkManager = require("./network-manager");
var tideManager = require("./tide-manager");
var scheduler = require("./scheduler");
var pumps = require("./pumps");
var getLogs = log.getLogs;



function checkAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.status(401).end();
}

function validateUser(username, password) {
    return user.username === username && user.password === password ? Q.resolve() : Q.reject();
}

function getSettings() {
    return networkManager.getNetworkConfig();
}

function setSettings(settings) {
    return networkManager.setNetworkConfig(settings);
}

function getSchedule() {
    return tideManager.getEntries().then(function(entries) {
        return {
            entries: entries.slice(0, 20).map(function(timestamp) {
                return {
                    date: timestamp
                };
            }),
            manualMode: tideManager.getManualMode()
        };
    });
}

function setSchedule(schedule) {
    if(!!schedule.manualMode !== !!tideManager.getManualMode()) {
        tideManager.setManualMode(schedule.manualMode);
    }

    if(schedule.manualMode) {
        return tideManager.setEntries(schedule.entries).then(function() {
            scheduler.run();
        });
    }
    else {
        return Q.resolve().then(function() {
            scheduler.run();
        });
    }
}

function error(message) {
    return {
        error: {
            message: message
        }
    };
}

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(flash());
app.use(session({
    secret: "this is my really creative secret",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(staticFiles));

// Settings
app.route("/settings")
    .get(checkAuthenticated, function(req, res) {
        getSettings().then(function(settings) {
            res.json(settings);
        }).catch(function(error) {
            res.status(400).end(error.toString());
        });
    })
    .post(checkAuthenticated, function(req, res) {
        if(req.body && req.body.settings) {
            setSettings(req.body.settings)
                .then(function() {
                    res.status(200).end();
                })
                .catch(function(error) {
                    res.status(400).end(error.toString());
                });
        }
    });

// Schedule
app.route("/schedule")
    .get(checkAuthenticated, function(req, res) {
        getSchedule()
            .then(function(schedule) {
                res.status(200).json(schedule);
            })
            .catch(function(error) {
                res.status(400).end(error.toString());
            });
    })
    .post(checkAuthenticated, function(req, res) {
        var schedule = req.body.schedule;

        if(schedule) {
            setSchedule(schedule)
                .then(getSchedule)
                .then(function(schedule) {
                    res.status(200).json(schedule);
                })
                .catch(function(error) {
                    res.status(400).end(error.toString());
                });
        }
    });

app.route("/start-pumps") // used to manually start the pumps
    .get(checkAuthenticated, function(req, res) {
        pumps.start();
        res.status(200).end();
    });

// Logs
app.route("/logs")
    .get(checkAuthenticated, function(req, res) {
        try {
            res.status(200).json(getLogs());
        }
        catch(error) {
            res.status(400).end(error.toString());
        }
    });

app.route("/login")
    .post(passport.authenticate("local-login"), 
    function(req, res) {
        res.status(200).end(); // success
    });

app.route("/logout")
    .get(function(req, res) {
        req.logout();
        res.status(200).end();
    });

app.route("/is-authorized")
    .get(checkAuthenticated, function(req, res) {
        res.status(200).end();
    });

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});


var strategy = new LocalStrategy({
    usernameField: "username",
    passwordField: "password",
    passReqToCallback: true
}, function(req, username, password, done) {
    validateUser(username, password)
        .then(function() {
            done(null, {
                username: username
            });
        })
        .catch(function() {
            done("User not found");
        });
});

passport.use("local-login", strategy);

module.exports = function() {
    log("info", "Listening on port " + port);
    app.listen(port);
};