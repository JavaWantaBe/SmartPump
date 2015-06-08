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
var logger    = require("./logger")("index"),
    webserver = require("./webserver"),
    scheduler = require("./pump-scheduler"),
    db        = require("./database"),
    pumps     = require("./pumps"),
    Q         = require( 'q' ),
    status    = require("./global_status");


status.statusInit(); // Initializes the systems global variables and checks if installed on a beaglebone


db.connect().then(
    function() {
        logger.info( "Successfully connected to mysql database" );

        if( status.onBeagleBone() ){
            logger.debug("Found beaglebone");
            
            try{
                pumps.init();
            } catch( e ){
                logger.error("Fatal Error: " + e);
            }
        } else {
            logger.debug("Not a beaglebone platform, not initializing pumps");
        }

        return scheduler.init();
    },
    function(err) {
        logger.error("Fatal - " + err );
        return Q.reject();
    }
).then( function() {
    require("./test-user"); // TODO: Remove test user before we install
}).then( function(){
    return webserver.init();
}, function( err ){
    logger.debug( "Error: " + err );
});