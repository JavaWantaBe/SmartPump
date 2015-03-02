/**
 * @file index.js
 * @brief Application entry point
 *
 * Starting point of application.  Also looks for beaglebone and if not found does not initialize relays.
 *
 * @code node index.js
 */

/**
 * @brief Required modules for system startup
 * @type {exports}
 */
var logger = require("./logger")("index");
var webserver = require("./webserver");
var configManager = require("./config-manager");
var tideManager = require("./tide-manager");
var scheduler = require("./pump-scheduler");
var db = require("./database");
var pumps = require("./pumps");
var Q = require("q");
var status = require("./global-status");

function log(type, message) {
    return function() {
        logger[type](message);
    };
}

function initializePumps() {
    if(status.onBeagleBone()) {
        logger.info("Beagle bone detected. Initializing pumps");
        return pumps.init();
    } else {
        logger.info("Beagle bone not found. Skipping pump initialization");
    }
}

function fatalErrorHandler(error) {
    logger.error("FATAL " + error + ": " + error.stack);
    console.log("\n -- ALERT -- Restart this system once the issue has been resolved...");
}

status.init()
    .then(log("info", "Beagle bone status determined"))
    .then(db.connect)
    .then(log("info", "Successfully connected to mysql server"))
    .then(initializePumps)
    .then(log("info", "Successfully initialized pumps"))
    .then(webserver.init)
    .then(log("info", "Successfully initialized webserver"))
    .then(function() {
        function run() {
            return scheduler.start().then(function() {
                // setTimeout will allow the stack to unwind before `run`
                // is called again, so we can avoid stackoverflows from recursion
                setTimeout(run, 0);
            }).catch(fatalErrorHandler);
        }

        configManager.on("change", function() {
            logger.info("Configuration changed. Restarting scheduler");
            scheduler.stop();
        });

        tideManager.on("change", function() {
            logger.info("Tide data changed. Restarting scheduler");
            scheduler.stop();
        });
        run();
    })
    .catch(fatalErrorHandler);
