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
    b         = require( 'bonescript' ),
    Q         = require( 'q' );

var onBoard = false;

function printBoard( values ){
    logger.debug( "*****Startup Sequence*****" );
    if( values.version ){
        onBoard = true;
        logger.debug( "Name: " + values.name + "\nVersion: " + values.version + "\nSerialNumber: " + values.serialNumber + "\nBonescript: " + values.bonescript );
    }   
}

b.getPlatform( printBoard );

db.connect().then(
    function() {
        logger.info( "Successfully connected to mysql database" );


        if( onBoard ){
            logger.debug("Found beaglebone");
            
            try{
                pumps.init();
            } catch( e ){
                logger.error( "Fatal Error: " + e );
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
).then( function( result ){
    return webserver.init();
}, function( err ){
    logger.debug( "Error: " + err );
});