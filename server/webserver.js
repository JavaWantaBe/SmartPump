var _             = require("lodash");
var Q             = require("q");
var logger        = require("./logger")("webserver");
var express       = require("express");
var bodyParser    = require("body-parser");
var cookieParser  = require("cookie-parser");
var session       = require("express-session");
var morgan        = require("morgan");
var flash         = require("connect-flash");
var passport      = require("passport");
var LocalStrategy = require("passport-local").Strategy;

var getUser       = require("./queries/get-user");
var getLogs       = require("./queries/get-logs");
var getpumpdata   = require("./queries/get-pumping-data");
var nextTide      = require("./queries/get-next-tide-date");
var network       = require("./network-settings");
var configManager = require("./config-manager");
var tideManager   = require("./tide-manager");
var app           = express();
var port          = 8080;
var staticFiles   = __dirname + "/../public";

app.use(morgan("dev"));
app.use(bodyParser());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(flash());
app.use(session({
    secret: "this is my really creative secret",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(staticFiles));

function checkAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.status(401).end();
}

function validateUser(username, password) {
    logger.info("Login attempt with username: " + username);
    return getUser(username, password).then(function(user) {
        return !!user;
    });
}

function getSettings() {
    // TODO: Richard retrieve actual network info
    return network.getSettings()
        .then(function(netSettings) {
            return _.extend({}, netSettings, {timeouts: configManager.getConfig().pumpTimeouts});
        });
}

function setSettings(settings) {
    var networkSettings = {
        ip: settings.ip,
        subnet: settings.subnet,
        gateway: settings.gateway
    };

    return network.setSettings(networkSettings).then(function() {
        configManager.merge({
            pumpTimeouts: settings.timeouts 
        });
        return settings;
    });
}

// Settings
app.route("/settings")
    .get(checkAuthenticated, function(req, res) {
        Q.resolve()
            .then(getSettings)
            .then(function(settings) {
                res.json({settings: settings});
            })                
            .catch(function(error) {
                console.log("getSettings failed: " + error);
            })
    })
    .post(checkAuthenticated, function(req, res) {
        logger.info("User submitted new configuration:", req.body.settings);
        console.log("GOT ", req.body);
        Q.resolve()
            .then(setSettings.bind(null, req.body.settings))
            .then(function(settings) {
                logger.info("Sucessfully saved new settings to disc");
                res.json({settings: settings});
            })
            .catch(function(error) {
                console.log("setSettings failed: " + error);
            });
    });

function getSchedule() {
    return tideManager.getTideDates()
        .then(function(tideDates) {
            return {
                dates: tideDates.map(function(date) {
                    return date.toISOString();
                }),
                manualMode: configManager.getConfig().manualMode
            };
        });
}

function setSchedule(schedule) {
    var manualMode = !!schedule.manualMode;
    var dates = schedule.dates.map(function(dateString) {
        return new Date(dateString);
    });

    if(manualMode !== configManager.getConfig().manualMode) {
        configManager.merge({
            manualMode: manualMode
        });
    }

    return tideManager.setTideDates(dates).then(Q.resolve({dates: dates, manualMode: manualMode}));
}

// Schedule
app.route("/schedule")
    .get(checkAuthenticated, function(req, res) {
        getSchedule()
            .then(function(schedule) {
                res.json({schedule: schedule});
            })
            .catch(function(error) {
                console.log("getSchedule failed: " + error);
            });
    })
    .post(checkAuthenticated, function(req, res) {
        if(req.body && req.body.schedule) {
            console.log("Got dates: " + req.body.schedule.dates);
            setSchedule(req.body.schedule)
                .then(function(schedule) {
                    res.json({schedule: schedule});
                })
                .catch(function(error) {
                    console.log("setSchedule failed: " + error);
                });
        }
    });

app.route("/start-pumps") // used to manually start the pumps
    .get(checkAuthenticated, function(req, res) {
        // TODO: Add code for actually starting the pumps
        logger.info("Manually starting the pumps from web interface");
        res.status(200).end();
    });

// Logs
app.route("/logs")
    .get(checkAuthenticated, function(req, res) {
        getLogs().then(function(logs) {
            res.json({logs: logs});
        });
    });

app.route("/login")
    .post(passport.authenticate("local-login"), 
    function(req, res) {
        res.status(200).end(); // success
    });

app.route("/logout")
    .post(function(req, res) {
        console.log("Logging user out");
        req.logout();
        req.session.destroy();
        res.status(200).end();
    });

app.route("/is-authenticated")
    .get(function(req, res) {
        res.status(200).json({
            isAuthenticated: req.isAuthenticated()
        });
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
    validateUser(username, password).then(function(isValid) {
        if(isValid) {
            done(null, {
                username: username
            });
        }
        else {
            done("User not found");
        }
    });
});

passport.use("local-login", strategy);

module.exports = {
    init: function() {
        app.listen(port);
        logger.info("Listening on port: " + port);
    }
};