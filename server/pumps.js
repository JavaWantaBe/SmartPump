"use strict";

/**
 * @file pumps.js
 *
 * @brief Controls pumps attached to system
 *
 *
 */

// Variables
var Q        = require( 'q' ),
    b        = require( 'bonescript' ),
    _        = require( 'lodash' ),
    db       = require( './database' ),
    logger   = require( './logger' )( 'pumps' ),
    settings = require( './config/pinconfig'), // Use this instead of fs for JSON objects
    timeOuts = require( './config/pumpsettings' );

var ON = 1,
    OFF = 0,
    pump = "",
    stop = false;

// TODO: Flow counter variable needs to be created here.

/**
 * @brief Handles interrupt request and evaluates
 * @param result
 * @returns {boolean}
 */
function inputHandler( result ){
    return ( result.value === ON ) ? true : false;
}

/**
 * @brief Primes system for pumping
 *
 * Starts by opening primevalve then starts the prime system.  A timeout is set
 * with settings found in the pumpsettings.json file.  If the timeout expires, then
 * the system reports a prime error.
 *
 * Likewise a interrupt is attached to the primeSignal line.  If prime is
 * @returns {deferred.promise|*}
 */
function startPrime(){

    var deferred = Q.defer(),
        timer;

    if( !b.digitalWrite(settings.relays.primeOutOpen, ON) ||
        !b.digitalWrite(settings.relays.prime, ON) ){
        deferred.reject(new Error("Failed to start priming"));
    }

    timer = setTimeout(function(){
        b.detachInterrupt(settings.inputs.primeSignal);
        b.digitalWrite(settings.relays.prime, OFF);
        b.digitalWrite(settings.relays.primeOutOpen, OFF);
        deferred.reject(new Error( "Timeout on prime" ));
    }, timeOuts.primeTimeOut);

    b.attachInterrupt(settings.inputs.primeSignal, inputHandler, b.RISING, function(){
        clearTimeout(timer);
        b.detachInterrupt(settings.inputs.primeSignal);
        b.digitalWrite(settings.relays.prime, OFF);
        deferred.resolve();
    });

    return deferred.promise;
}

/**
 *
 * @param outlet
 * @returns {deferred.promise|*}
 */
function startOutlet(){
    var deferred = Q.defer(),
        timer,
        openValve = ( pump === "pump1" ) ? settings.relays.pump1OutOpen : settings.relays.pump2OutOpen,
        closeValue = ( pump === "pump1" ) ? settings.relays.pump1OutClose : settings.relays.pump2OutClose;

    b.digitalWrite(outlet, ON);

    timer = setTimeout( function(){
        b.digitalWrite( outlet, OFF );
        b.detachInterrupt( signal );
        deferred.reject( new Error( "Timeout on valve opening" ) );
    }, timeOuts.outletTimeOut );

    b.attachInterrupt( signal, inputHandler, b.RISING, function(){
        clearTimeout( timer );
        b.detachInterrupt( signal );
        deferred.resolve();
    });

    return deferred.promise;
}

/**
 *
 * @param pump
 * @returns {deferred.promise|*}
 */
function startPump(){
    var deferred = Q.defer();
    var timer;

    b.digitalWrite(settings.relays.primeOutOpen, OFF);
    b.digitalWrite( pump, ON );

    timer = setTimeout( function(){
        b.detachInterrupt( settings.inputs.tankSignal );
        deferred.reject( new Error( "Timeout on pumping cycle" ) );
    }, timeOuts.primeTimeOut );

    b.attachInterrupt( settings.inputs.flowSignal, inputHandler, b.FALLING, function(){
        b.detachInterrupt( settings.inputs.tankSignal );
        b.detachInterrupt( settings.inputs.flowSignal );
        deferred.reject( new Error( "Flow dropped below acceptable levels" ) );
    } );

    b.attachInterrupt( settings.inputs.tankSignal, inputHandler, b.RISING, function(){
        clearTimeout( timer );
        b.detachInterrupt( settings.inputs.flowSignal );
        b.detachInterrupt( settings.inputs.tankSignal );
        deferred.resolve();
    });

    return deferred.promise;
}

/**
 *
 */
function endCycle(){
    _.forEach( settings.relays, function( pin ) {
        b.digitalWrite( pin, OFF );
    });
}

/**
 *
 */
function emergencyStop(){
    var exec = require('child_process' ).exec,
        shutdown = exec('shutdown -P -h now', function( err, std, stderr){
            logger.info(std);
            logger.error(stderr);
            if(error != null){
                logger.error("Error executing shutdown - " + error );
            }
        });

    endCycle();
    stop = true;
}


/**
 * @brief Starts a pumping cycle
 *
 * Starts a cycle which follows these rules:
 *
 * 1. Start priming system -> Waits for prime signal || timeout
 *
 * 2. If prime indicator received turn off priming system
 *    a. Read database find last pumping cycles pump
 *    b. Open alternate pump outlet valve
 *    c. Wait for valve open signal or 2 minute timeout
 *    d. If valve signal received
 *    e. Turn on alternate pump
 *    f. Wait for water flow or timeout
 *       i. if timeout received run shutdown - error
 *    g. Wait for tank full signal
 *    h. If tank full received run shutdown
 *    i. Write to database
 * 3. If timeout run shutdown - error
 *
 *
 * @returns {*}
 */
function startcycle(){
    var QUERYSTRING = "SELECT pump_used FROM pump_cycle ORDER BY pump_used DESC LIMIT 1";

    return db.query( QUERYSTRING ).then( function( result ){
        pump = result[0].pump_used;

        if( pump === 'pump1' || pump === null ){
            pump = settings.relays.pump2;
        } else {
            pump = settings.relays.pump1;
        }

    }, function( err ) {
        // error in database connection
        logger.error( "Failed to connect to database " + err );

    }).then( startPrime, function( err ){
        endCycle();
        logger.error( "Error: " + err );
    }, function( progress ){
        // TODO: Add emergency stop

    }).then( startOutlet, function( err ){
        endCycle();
        logger.error( "Error: " + err );
    }, function( progress ){
        // TODO: Add emergency stop

    }).then( startPump, function( err ){
        endCycle();
        logger.error( "Error: " + err);
    }, function( progress ){
        // TODO: Add emergency stop

    }).finally( function(){
        // TODO: Log a successful pumping cycle into the database.
        endCycle();
    });
}

/**
 *
 * @type {{init: init, start: startcycle}}
 */

/**
 *  @brief Initializes pins for inputs and outputs
 *
 *  Uses the pinconfig.json file to retrieve pin values.
 *  There exists several categories of pin configurations
 *  so for each of the inputs and outputs the function
 *  iterates through them and turns them on.
 *
 */
module.exports = {
    init:function(){
            var errorFlag = false;
            stop = false;

            // Setup all relays as outputs
            _.forEach( settings.relays, function( pin ){
                if( b.pinMode( pin, b.OUTPUT, 7, 'pulldown' ) === false ){
                    errorFlag = true;
                }
            });

            // Setup all opto-isolated pins as inputs
            _.forEach( settings.inputs, function( pin ){
                if( b.pinMode( pin, b.INPUT, 7, 'pullup' ) === false ){
                    errorFlag = true;
                }
            });

            // Interrupt used for emergency button presses.
            if( !b.attachInterrupt( settings.inputs.emergencyBtn, true, b.FALLING, emergencyStop ) ){
                errorFlag = true;
            }

            // If all pin initialization assignments were successful then no error is triggered
            if( errorFlag === false ){
                logger.info( "pump pins initialized" );
            } else {
                logger.error( "pin assignment failed" );
                throw new Error( "Pin assignment failed" );
            }
        },
    start: startcycle
};