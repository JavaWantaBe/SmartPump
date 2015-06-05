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
    log = require("./logger").bind(null, "pumps");
    settings = require( './config/pinconfig'), // Use this instead of fs for JSON objects
    timeOuts = require( './config/pumpsettings' );

var ON = 1,
    OFF = 0;

var stop = false;
var pumpUsed = "pump1";

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
 *
 * @returns {deferred.promise|*}
 */
function startPrime(){

    var deferred = Q.defer();
    var timer;

    b.digitalWrite( settings.relays.prime1, ON );

    timer = setTimeout( function(){
        b.detachInterrupt( settings.inputs.primeSignal );
        b.digitalWrite( settings.relays.prime1, OFF );
        deferred.reject( new Error( "Timeout on prime" ) );
    }, timeOuts.primeTimeOut );

    b.attachInterrupt( settings.inputs.primeSignal, inputHandler, b.RISING, function(){
        clearTimeout( timer );
        b.detachInterrupt( settings.inputs.primeSignal );
        b.digitalWrite( settings.relays.prime1, OFF );
        deferred.resolve();
    });

    return deferred.promise;
}

/**
 *
 * @param outlet
 * @returns {deferred.promise|*}
 */
function startOutlet( outlet ){
    var deferred = Q.defer();
    var timer;
    var signal = ( outlet === settings.relays.pump1Outlet ) ? settings.inputs.pump1Outlet : settings.inputs.pump2Outlet;

    b.digitalWrite( outlet, ON );

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
function startPump( pump ){
    var deferred = Q.defer();
    var timer;

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
    endCycle();
    stop = true;
    log("warn", "Emergency Stop Pressed" );
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
    var pump = settings.relays.pump1,               // Pump last used
        pumpOutlet = settings.relays.pump1Outlet;   // Pump outlet valve last used

    log("info", "Starting cycle");
    return Q.resolve().then(function( result ) { /*db.query( QUERYSTRING)*/
        pump = pumpUsed;//result[0].pump_used;

        if( pump === 'pump1' || pump === null ){
            pump = settings.relays.pump2;
            pumpOutlet = settings.relays.pump2Outlet;
        } else {
            pump = settings.relays.pump1;
            pumpOutlet = settings.relays.pump1Outlet;
        }

    }).catch(function( err ) {
        // error in database connect
        log("error", "Failed to connect to database: " + err );
    }).then( startPrime, function( err ) {
        endCycle();
        log("error", err );
    }, function( progress ) {
        // TODO: Add emergency stop

    }).then( startOutlet( pumpOutlet ), function( err ) {
        endCycle();
        log("error", err );
    }, function( progress ) {
        // TODO: Add emergency stop

    }).then( startPump( pump ), function( err ) {
        endCycle();
        log("error", err);
    }, function( progress ) {
        // TODO: Add emergency stop

    }).finally( function() {
        // TODO: Log a successful pumping cycle into the database.
        endCycle();
    });
}

/**
 *
 * @type {{init: init, start: startcycle}}
 */

 function init(){
    var errorFlag = false;
    stop = false;
    log("info", "Initializing pumps");

    // TODO: Pin needed for pressure switch
    b.attachInterrupt( settings.inputs.emergencyBtn, inputHandler, b.RISING, emergencyStop );

    _.forEach( settings.relays, function( pin ){
        if( b.pinMode( pin, b.OUTPUT ) === false ){
            errorFlag = true;
        }
    });

    _.forEach( settings.inputs, function( pin ){
        if( b.pinMode( pin, b.INPUT ) === false ){
            errorFlag = true;
        }
    });

    if( errorFlag === true ){
        log("info", "Pump pins initialized" );
    } else {
        log("error", "Pin assignment failed" );
        throw new Error( "Pin assignment failed" );
    }
}

init();

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
    start: startcycle,
    emergencyStop: emergencyStop
};