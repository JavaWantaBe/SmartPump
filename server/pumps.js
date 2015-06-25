"use-strict";

/**
 * @file pumps.js
 * 
 * @brief Logic for pumping systems
 * 
 * Algorithm for pumping system:
 *  1. Turn on all close valves
 *  2. Check if closed
 *  3. If closed, turn off close valves relay
 *  4. Turn on priming system
 *  5. Wait for prime
 *  6. If prime signal received, turn off prime
 *  7. Turn on selected pump and open valve
 *  8. Wait for open valve signal
 *  9. Turn off open valve relay
 *  10. Wait 30 seconds
 *  11. Watch pressure sensor, if triggered or timeout pump is turned off
 *  12. Watch for tank sensor, if triggered or timeout pump is turned off
 *  13. Wait for 5 minutes for drainage
 *  14. Close valve relay
 *  15. Wait for close valve signal
 *  16. Log data to database
 *  17. Turn off all relays
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
function getPin(pins, label) {
    return _.filter(pins, function(input) {
        return input.label === label;
    }).map(function(input) {
        return input.pin;
    })[0];
}

/**
 * @brief Async pin writing function
 *
 * @param pin
 * @param value
 * @returns {*|promise}
 */
function pinWrite( pin, value ) {
    var deferred = Q.defer();

    if(b.digitalWrite( pin, value) === true){
        deferred.resolve;
    } else {
        deferred.reject( new Error("Pin " + pin + " failed to be written"));
    }

    return deferred.promise;
}


/**
 * @brief Listens on a pin for an interrupt for `timeoutMS` milliseconds
 * @param pin
 * @param mode
 * @param timeoutMS
 * @returns {*}
 */
function timedInterrupt(pin, mode, timeoutMS) {
    /* 
        race returns a promise that is resolved/rejected
        when the first promise in the passed array resolves/rejects
    */
    var time;

    return Q.race([
        // start timeout
        Q.promise(function(resolve, reject) {
            time = setTimeout(function() {
                reject(new Error("interrupt timed out"));
            }, timeoutMS);
        }),
        // attach interrupt
        Q.promise(function(resolve, reject) {
            b.attachInterrupt(pin, function(x) {
                if (x.value === b.LOW) {
                    clearTimeout(time);
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
            b.detachInterrupt(pin);
        });
}

/**
 * @brief Starts the preCycle checks
 *
 * @returns {*}
 */
function preCycle() {
    b.digitalWrite(getPin(settings.relays, "valve1close"), b.HIGH );
    b.digitalWrite(getPin(settings.relays, "valve2close"), b.HIGH );

    return Q.all([timedInterrupt(getPin(settings.inputs, "valve1closed"), b.FALLING, timeOuts.valveTimeOut),
        timedInterrupt(getPin(settings.inputs, "valve2closed"), b.FALLING, timeOuts.valveTimeOut)])
        .finally(function(){
            b.digitalWrite(getPin(settings.relays, "valve1close"), b.LOW);
            b.digitalWrite(getPin(settings.relays, "valve2close"), b.LOW);
        });
}

/**
 * @brief Starts priming cycle
 * 
 * @retval promise
 */
function startPrime() {
    return pinWrite(getPin(settings.relays, "prime"), b.HIGH)
        .then(function(){
            timedInterrupt(getPin(settings.inputs, "primed"), b.FALLING, timeOuts.primeTimeOut);
        })
        .finally(function(){
            b.digitalWrite(getPin(settings.relays, "prime"), b.LOW);
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
function startPump(pump, valveOpen, valveSignal) {
    var valveTime = setTimeout(function(){
        logger.error("Valve " + valveOpen + " failed to open completely");
        b.detachInterrupt(valveSignal);
        b.digitalWrite(valveOpen, b.LOW);
    }, timeOuts.valveTimeOut);

    b.attachInterrupt(valveSignal, function(x) {
        if(x.value == b.LOW ) {
            b.detachInterrupt(valveSignal);
            b.digitalWrite(valveOpen, b.LOW);
            clearTimeout(valveTime);
        }
    }, b.FALLING);

    return pinWrite(pump, b.HIGH)
        .then(function(){
            return pinWrite(valveOpen, b.HIGH);
        });
}

/**
 *
 */
function monitorFlow(pump) {
    // Wait for 3o seconds before monitoring pressure
    Q.delay(timeOuts.pressureTimeOut).then(function(){
        return Q.race([timedInterrupt(getPin(settings.inputs, "tankfull"), b.RISING, timeOuts.pumpingTimeOut),
            timedInterrupt(getPin(settings.inputs, "pressure"), b.FALLING, timeOuts.pumpingTimeOut)]);
    } ).finally(function(){
        b.digitalWrite(pump, b.LOW);
    });
}

/**
 *
 */
function endCycle(valveClose, valveCloseSignal) {
    Q.delay(timeOuts.finishTimeOut).then(function(){
        return pinWrite( valveClose, b.HIGH);
    }).then(function(){
        return timedInterrupt(valveCloseSignal, b.FALLING, timeOuts.valveTimeOut);
    } ).finally(function(){
        b.digitalWrite(valveClose, b.LOW);
    });
}

/**
 * @brief Resets all relays to OFF position
 */
function cleanup() {
    _.forEach( settings.relays, function(relay){
        b.digitalWrite(relay.pin, b.LOW);
    });
}

/**
 * @brief Emergency Stop
 *
 * @param state
 */
function emergencyStop(state) {
    if(state.value === b.HIGH) {
        cleanup();
        logger.warn("Emergency Stop Pressed");
        b.detachInterrupt(getPin(settings.inputs, "emergency"));
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
        pump = "pump1",
        pumpPin = getPin(settings.relays, "pump1"), // Pump last used
        valveOpen = getPin(settings.relays, "valve1open"), // Pump outlet valve last used
        valveOpenSignal = getPin(settings.inputs,"valve1opened" ),
        valveClose = getPin(settings.relays, "valve1close" ),
        valveCloseSignal = getPin(settings.inputs, "valve1closed" ),
        startTime = new Date();

    return db.query(QUERYSTRING).then(function(result) {
            //pump = result[0].pump_used;

            if(pump === 'pump1') {
                pumpPin = getPin(settings.relays, "pump2");
                valveOpen = getPin(settings.relays, "valve2open");
                valveOpenSignal = getPin(settings.inputs, "valve2opened");
                valveCloseSignal = getPin(settings.inputs, "valve2closed");
                pump = 'pump2';
            }
            else {
                pump = 'pump1';
            }
        } )
        .then(preCycle)
        .then(startPrime)
        .then(startPump.bind(null, pumpPin, valveOpen, valveOpenSignal))
        .then(monitorFlow.bind(null, pumpPin))
        .then(endCycle.bind(null, valveClose, valveCloseSignal))
        .catch(function(err) {
            /*
                I removed the many additional error handlers.
                Errors will cascade through .then calls until they hit a
                catch call, so you don't need to handle each .then's
                error seperately.
            */
            logger.error("Error: " + err);
        } ).finally( function(){
            var endTime = new Date();
            cleanup();
            //db.query(INSERTSTRING + pump + ", 0, 0, " + new Date( endTime - startTime ) + " , " + tidetime);
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

        b.attachInterrupt(getPin(settings.inputs, "emergency"), emergencyStop, b.RISING);

        if(relaysAreValid && inputsAreValid) {
            logger.debug("pump pins initialized");
        }
        else {
            logger.error("pump pin assignment failed");
            throw new Error("pump pin assignment failed");
        }
        
        startcycle( Date.now() );

    },
    start: startcycle
};
