"use strict";

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
var pm2 = require("pm2");

pm2.connect(function() {
    pm2.start({
        script: __dirname + "/smartpump.js"
    }, function(err, apps) {
        if(err) {
            console.log("PM2 failed to start script: " + err);
        }
        pm2.disconnect();
    });
});