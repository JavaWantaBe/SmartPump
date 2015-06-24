"use-strict";

/**
 * @file pumps.js
 * 
 * @brief Logic for pumping systems
 * 
 * 
 * 
 * 
 */


var Q = require('q'),
    b = require('bonescript'),
    _ = require('lodash'),
    db = require('./database'),
    logger = require('./logger')('pumps'),
    settings = require('./config/pinconfig'), // Use this instead of fs for JSON objects
    timeOuts = require('./config/pumpsettings');

/**
 * @brief Returns pin of assigned input or output based on label 
 * 
 * @param pins - settings.relays / settings.inputs
 * @param label - label assigned to input or output
 * 
 * @retval value of pin
 */
function _getPin(pins, label) {
    return _.filter(pins, function(input) {
        return input.label === label;
    }).map(function(input) {
        return input.pin;
    });
}


/*
    Listens on a pin for an interrupt for `timeoutMS` milliseconds
*/
function _timedInterrupt(pin, mode, timeoutMS) {
    /* 
        race returns a promise that is resolved/rejected
        when the first promise in the passed array resolves/rejects
    */
    var _time;

    return Q.race([
        // start timeout
        Q.promise(function(resolve, reject) {
            _time = setTimeout(function() {
                reject(new Error("interrupt timed out"));
            }, timeoutMS);
        }),
        // attach interrupt
        Q.promise(function(resolve, reject) {
            b.attachInterrupt(pin, function(x) {
                if (x.value === b.LOW) {
                    clearTimeout(_time);
                    resolve(x);
                }
            }, mode);

        })
    ]).finally(function() {
        /*
            Finally is used to clean up regardless of whether or not
            the promise resolved without affecting the resolved value or
            rejected log
        */
        return Q.promise(function(resolve, reject) {
            b.detachInterrupt(pin) ? resolve("detached") : reject(new Error("not detached from pin - " + pin));
        });

    });
}

/*
    Same as b.attachInterrupt except returns a promise and
    detaches the interrupt immediately after an interrupt is handled.

    The promise is resolved when the interrupt is detached successfully
*/
function onceInterrupt(pin, mode) {
    return Q.promise(function(resolve, reject) {
        b.attachInterrupt(pin, function(x) {
            if (x.value === b.LOW)
                b.detachInterrupt(pin) ? resolve("detached") : reject(new Error("not detached from pin - " + pin));
        }, mode);
    });
}

/**
 * @brief Starts priming cycle
 * 
 * @retval promise
 */
function startPrime() {

    return pinWrite(_getPin(settings.relays, "prime1"), b.HIGH)
        .then(function() {
            return timedInterrupt(_getPin(settings.inputs, "prime"), b.FALLING, timeOuts.primeTimeOut);
        })
        .finally(function() {
            return pinWrite(_getPin(settings.relays, "prime1"), b.LOW);
        });
}

/**
 * @brief Starts pumping cycle
 * 
 * @param pump - pump1 / pump2 to use
 * @param valveOpen - valve1open / valve2open
 * 
 * @retval promise
 */
function startPump(pump, valveOpen) {
    
    // TODO: NEEDS HELP
    var valveTimeout = setTimeout( function(){
        // TODO: Bad things happened.  Valve didn't close
    } , timeOuts.valveTimeOut)
    
    b.digitalWrite( valveOpen, b.HIGH );    // Open valve
    Q.delay( 3000 )                         // Give the valve a few seconds to start to open
        .then(
            b.digitalWrite( pump. b.HIGH )) ;         // Start pump
    
    
    // Set timeout
    /*
        If I'm understanding this correctly, in this function,
        we're waiting on either the timeout to reject, the flowSignal to reject,
        or the tankSignal to resolve then we're detaching all of the interrupts
    */
    return Q.race([
        // Start listening on tankSignal with a timeout
        timedInterrupt(_getPin(settings.inputs, "tankfull"), b.RISING, timeOuts.pumpingTimeOut),
        // Start listening on flowSignal if an event is caught, reject the promise
        onceInterrupt(settings.inputs.flowSignal, inputHandler, b.FALLING)
        .then(Q.reject(new Error("Flow dropped below acceptable levels")))
        // Q.race will ensure only the first promise to resolve/reject will be passed on
    ]);
    // onceInterrupt and timedInterrupt both handle detaching interrupts,
    // so there's no need for a detachInterrupt call for either of them
}

function endCycle() {
    /*
        digitalWrite can error asynchronously, so
        I've just wrapped up all the promises in a single promise

        This way, if any calls to digitalWrite fail, we can catch the error
    */
    return Q.all(_.map( settings.relays, function(relay) {
        return digitalWrite(relay.pin, b.LOW);
    }));
}

function emergencyStop(state) {

    if (state === b.HIGH) {
        logger.warn("Emergency Stop Pressed");
        endCycle();
    }
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
function startcycle(tidetime) {

    var QUERYSTRING = "SELECT pump_used FROM pump_cycle ORDER BY pump_used DESC LIMIT 1",
        INSERTSTRING = "INSERT INTO pump_cycle ( pump_used, avg_gpm, total_gallons, total_pumping_time, tide_tide_time ) VALUES(",
        pump,
        pumpPin = _getPin(settings.relays, "pump1"), // Pump last used
        valveOpen = _getPin(settings.relays, "valve1open"), // Pump outlet valve last used
        pumpingTime = new Date();

    if (b.digitalRead(_getPin(settings.inputs, "valve1closed")) != b.LOW || b.digitalRead(_getPin(settings.inputs, "valve2closed")) != b.LOW) {
        // TODO: Need to close valves and wait until received closed signal
    }

    return db.query(QUERYSTRING).then(function(result) {
            /*
                Why is pump set to settings.relay.pump1 if it's
                immediately being overwritten with the result of this query?
            */
            pump = result[0].pump_used;

            if (pump === 'pump1' || pump === null) {
                pumppin = _getPin(settings.relays, "pump2");
                valveOpen = _getPin(settings.relays, "pump2open");
                pump = 'pump2';
            }
            else {
                pump = 'pump1';
            }
        })
        .then(startPrime)
        .then(startPump.bind(null, pump, valveOpen))
        .then(db.query(INSERTSTRING + pump + ", 0, 0, " + Date.getTime() - pumpingTime + " , " + tidetime))
        .catch(function() {
            /*
                I removed the many additional error handlers.
                Errors will cascade through .then calls until they hit a
                catch call, so you don't need to handle each .then's
                error seperately.
            */
            logger.error("Error: " + err);
            return endCycle();
        })
        .finally(function() {
            return endCycle();
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
    init: function() {
        /*
            _.every returns true only if the iterator function
            returns true for every value in the collection
        */
        var relaysAreValid = _.every(settings.relays, function(relay) {
            return b.pinMode(relay.pin, b.OUTPUT, 7, 'pulldown', 'fast');
        });

        var inputsAreValid = _.every(settings.inputs, function(signal) {
            return b.pinMode(signal.pin, b.INPUT, 7, 'pullup', 'fast');
        });

        _.forEach(settings.relays, function(relay) {
            b.digitalWrite(relay.pin, b.LOW);
        });

        b.attachInterrupt(_getPin(settings.inputs, "emergency"), emergencyStop, b.RISING);

        if (relaysAreValid && inputsAreValid) {
            logger.debug("pump pins initialized");
        }
        else {
            logger.error("pump pin assignment failed");
            throw new Error("pump pin assignment failed");
        }

    },
    start: startcycle
};
