"use strict";

var _             = require("lodash"),
    Q             = require("q"),
    logger        = require("./logger")("webserver"),
    express       = require("express"),
    bodyParser    = require("body-parser"),
    cookieParser  = require("cookie-parser"),
    session       = require("express-session"),
    morgan        = require("morgan"),
    flash         = require("connect-flash"),
    passport      = require("passport"),
    LocalStrategy = require("passport-local").Strategy,
    TideEntry     = require("./tide-entry"),
    scheduler     = require("./pump-scheduler"),
    getUser       = require("./queries/getUser"),
    getLogs       = require("./queries/getLogs"),
    network       = require("./network-settings"),
    timeout       = require("./timeout-settings"),
    app           = express(),
    port          = 1080,
    staticFiles   = __dirname + "/public";

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
    return getUser(username, password).then(function(user) {
        return !!user;
    });
}

// TODO: Move this variable somewhere more fittings
var manualMode = false;
function getSchedule() {
    return scheduler.getEntries().then(function(entries) {
        return {
            schedule: {
                entries: entries,
                manualMode: manualMode
            }
        };
    });
}

function setSchedule(schedule) {
    manualMode = schedule.manualMode;
    return scheduler.setEntries(schedule.entries.map(function(time) {
        return TideEntry.fromDBModel({
            time: time
        });
    }));
}

function error(message) {
    return {
        error: {
            message: message
        }
    };
}


function getSettings() {
    // TODO: Richard retrieve actual network info
    return network.getSettings()
        .then(function(netSettings) {
            return _.extend({}, netSettings, timeout.getSettings());
        });
}

function setSettings(settings) {
    var networkSettings = {
        ip: settings.ip,
        subnet: settings.subnet,
        gateway: settings.gateway
    };
    var timeoutSettings = {
        primeTimeOut: settings.primeTimeOut,
        outletTimeOut: settings.outletTimeOut,
        pumpingTimeOut: settings.pumpingTimeOut,
        generalTimeOut: settings.generalTimeOut
    };
    network.setSettings(networkSettings);
    timeout.setSettings(timeoutSettings);
    return Q.resolve(settings);
}

// Settings
app.route("/settings")
    .get(checkAuthenticated, function(req, res) {
        getSettings()
            .then(function(settings) {
                res.json({settings: settings});
            })                
            .catch(function(error) {
                console.log("Failed to getSettings: " + error);
            })
    })
    .post(checkAuthenticated, function(req, res) {
        if(req.body && req.body.settings) {
            setSettings(req.body.settings)
                .then(function(settings) {
                    res.json({settings: settings});
                })
                .catch(function(error) {
                    console.log("Failed to setSettings: " + error);
                })
        }
        else {
            console.log("req.body.settings missing", req.body);
        }
    });

// Schedule
app.route("/schedule")
    .get(checkAuthenticated, function(req, res) {
        getSchedule().then(res.json.bind(res));
    })
    .post(checkAuthenticated, function(req, res) {
        if(req.body && req.body.schedule && req.body.schedule.entries) {
            setSchedule(req.body.schedule)
                .then(getSchedule)
                .then(res.json.bind(res));
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
    }
};