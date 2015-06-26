var Q = require("q");
var _ = require("lodash");
var device = require("./device");
var InputPin = require("./hardware-models/input-pin");
var OutputPin = require("./hardware-models/output-pin");
var Valve = require("./hardware-models/valve");
var Pump = require("./hardware-models/pump");
var pinCycle = require("./hardware-models/pin-cycle");
var configManager = require("./config-manager");

var LOW = device.LOW;
var HIGH = device.HIGH;
var FALLING = device.FALLING;
var RISING = device.RISING;

var currentPumpId = "pump1";

// handler functions
function isLow(signal) {
  return signal.value === LOW;
}

function isHigh(signal) {
  return signal.value === HIGH;
}

function wait(ms) {
  return new Promise(function(resolve) {
    setTimeout(resolve, ms);
  });
}

/*
  This function generates the InputPin, OutputPin, Valve, and Pump objects
  that we will need to run the pumps.

  These objects need to be recreated on each run in order to ensure that
  only the most up-to-date configuration is used
*/
function getPumps() {
  var config = configManager.getConfig();
  var pins = config.pins;
  var timeouts = config.pumpTimeouts;

  // generate Pin objects from the pin configuration in config.json
  var outputPins = _.reduce(pins.outputs, function(outputPins, pinConfig, pinName) {
    outputPins[pinName] = new OutputPin(
      pinConfig.pin,
      pinConfig.onValue === "HIGH" ? HIGH : LOW,
      pinConfig.offValue === "HIGH" ? HIGH : LOW
    );

    return outputPins;
  }, {});

  var inputPins = _.reduce(pins.inputs, function(inputPins, pinConfig, pinName) {
    inputPins[pinName] = new InputPin(
      pinConfig.pin,
      pinConfig.handler === "HIGH" ? isHigh : isLow,
      pinConfig.mode === "RISING" ? RISING : FALLING
    );

    return inputPins;
  }, {});

  // pump constructor requires an output pin for signalling
  // the physical pump to start and a valve object, so it
  // can manage its own valve
  var pump1 = new Pump(
    outputPins.startPump1, 
    new Valve(
      // open output/input and timeout
      outputPins.openValve1,
      inputPins.valve1Opened,
      timeouts.valveTimeOut,

      // close output/input and timeout
      outputPins.closeValve1,
      inputPins.valve1Closed,
      timeouts.valveTimeOut
    )
  );

  var pump2 = new Pump(
    outputPins.startPump2, 
    new Valve(
      // open output/input and timeout
      outputPins.openValve2,
      inputPins.valve2Opened,
      timeouts.valveTimeOut,
    
      // close output/input and timeout
      outputPins.closeValve2,
      inputPins.valve2Closed,
      timeouts.valveTimeOut
    )
  );

  return {
    pump1: pump1,
    pump2: pump2
  };
}

// was "preCycle". I chose a name that describes what the function does, not when it's called
// timing out and turning off pins are both handled by the Valve close function
function closeValves(pumps) {
  return Q.all(_.map(pumps, function(pump) {
    return pump.valve.close();
  }));
}

function runPrimeCycle() {
  return pinCycle(
    outputPins.startPrime,
    inputPins.primeFinished,
    configManager.getConfig().pumpTimeouts.primeTimeOut
  );
}

/*
  Returns a promise and waits for either:
    timeout - reject
    pressure input signal - resolve
    tank full input signal - resolve

  I moved the delay from this function
  to the "starCycle" function.
*/
function monitorFlow(pump) {
  var timeout;

  function cleanupMonitorFlow() {
    clearTimeout(timeout);
    inputs.tankIsFull.detach();
    inputs.pressure.detach();
  }

  return Q.race([
    Q.Promise(function(resolve, reject) { // timeout
      timeout = setTimeout(function() {
        reject(new Error("Pump timed out"));
      });
    }),

    Q.Promise(function(resolve, reject) { // pressure
      inputs.pressure.once(function() {
        reject(new Error("Low pressure")); // TODO: Figure out what goes here
      });
    }),

    Q.Promise(function(resolve, reject) { // tank full
      inputs.tankIsFull.once(function() {
        resolve();
      });
    })
  ]).finally(cleanupMonitorFlow);
}

function cleanUp() {
  _.invoke(outputPins, "turnOff"); // runs .turnOff() on all output pins
}

function startCycle() {
  var pumps = getPumps();
  var pump;
  // switch pumps on each cycle
  currentPumpId = currentPumpId === "pump1" ? "pump2" : "pump1";
  pump = pumps[currentPumpId];

  return closeValves(pumps)
    .then(runPrimeCycle)
    .then(pump.start)
    .then(wait.bind(null, 30000))
    .then(monitorFlow.bind(null, pump))
    .then(pump.stop)
    .then(wait.bind(null, 1000 * 60 * 5))
    .catch(function(error) {
      throw new Error("Pump cycle failed: " + error);
    })
    .finally(cleanUp);
}


module.exports = {
  init: function() {
    var pins = configManager.getConfig().pins;
      /*
       _.every returns true only if the iterator function
       returns true for every value in the collection
       */
      var outputsAreValid = _.every(pins.outputs, function(output) {
          return device.pinMode(output.pin, device.OUTPUT, 7, "pulldown", "fast", function(x){
              device.digitalWrite(output.pin, output.offValue === "LOW" ? LOW : HIGH);
          });
      });

      var inputsAreValid = _.every(pins.inputs, function(input) {
          return device.pinMode(input.pin, device.INPUT, 7, "pullup", "fast");
      });

      if(outputsAreValid && inputsAreValid) {
          logger.debug("pump pins initialized");
      } else {
          logger.error("pump pin assignment failed");
          throw new Error("pump pin assignment failed");
      }
      
      //startCycle();
  },

  startCycle: startCycle
};