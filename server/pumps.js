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
var PUMP1 = 0;
var PUMP2 = 1;

var currentPumpId = PUMP1;

// handler functions
function isLow(signal) {
  return signal.value === LOW;
}

function isHigh(signal) {
  return signal.value === HIGH;
}

function wait(ms) {
  return Q.promise(function(resolve) {
    setTimeout(resolve, ms);
  });
}

function logError(message) {
  return function(error) {
    console.log(message + ": " + error);
    throw error;
  };
}

function log(message) {
  return function() {
    console.log(message)
  };
}

/*
  This function generates the InputPin, OutputPin, Valve, and Pump objects
  that we will need to run the pumps.

  These objects need to be recreated on each run in order to ensure that
  only the most up-to-date configuration is used
*/
function getDeviceIO() {
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
    pumps: [pump1, pump2],
    outputPins: outputPins,
    inputPins: inputPins
  };
}

// was "preCycle". I chose a name that describes what the function does, not when it's called
// timing out and turning off pins are both handled by the Valve close function
function closeValves(pumps) {
  console.log("Closing valves");
  return Q.all(_.map(pumps, function(pump) {
    return pump.valve.close();
  }))
  .then(log("Valves closed"))
  .catch(logError("Failed to close valves"));
}

function runPrimeCycle(startOutput, endInput) {
  console.log("Running prime cycle");
  return pinCycle(
    startOutput, endInput,
    configManager.getConfig().pumpTimeouts.primeTimeOut
  )
  .then(log("Prime cycle finished"))
  .catch(logError("Prime cycle failed"));
}

/*
  Returns a promise and waits for either:
    timeout - reject
    pressure input signal - resolve
    tank full input signal - resolve

  I moved the delay from this function
  to the "starCycle" function.
*/
function monitorFlow(pump, tankIsFull, pressure) {
  var timeout;
  console.log("Monitoring flow");
  function cleanupMonitorFlow() {
    clearTimeout(timeout);
    tankIsFull.detach();
    pressure.detach();
  }

  return Q.race([
    Q.Promise(function(resolve, reject) { // timeout
      timeout = setTimeout(function() {
        console.log("monitorFlow timeout finished");
        cleanupMonitorFlow();
        reject(new Error("Pump timed out"));
      }, configManager.getConfig().pumpTimeouts.pumpingTimeOut);
    }),

    Q.Promise(function(resolve, reject) { // pressure
      pressure.once(function() {
        console.log("pressure received signal");
        cleanupMonitorFlow();
        reject(new Error("Low pressure")); // TODO: Figure out what goes here
      });
    }),

    Q.Promise(function(resolve, reject) { // tank full
      tankIsFull.once(function() {
        console.log("tankIsFull received signal");
        cleanupMonitorFlow();
        resolve("Tanks is full");
      });
    })
  ])
  .then(log("Pumping finished successfully (tank is full)"))
  .catch(log("Pumping failed"));
}

function cleanUp(outputPins) {
  _.invoke(outputPins, "turnOff"); // runs .turnOff() on all output pins
}

function startCycle() {
  var deviceIO = getDeviceIO();
  var pumps = deviceIO.pumps;
  var outputPins = deviceIO.outputPins;
  var inputPins = deviceIO.inputPins;
  var pump;
  // switch pumps on each cycle
  currentPumpId = (currentPumpId === PUMP1 ? PUMP2 : PUMP1);
  pump = pumps[currentPumpId];

  return closeValves(pumps)
    .then(runPrimeCycle.bind(null, outputPins.startPrime, inputPins.primeFinished))
    .then(function() {
      console.log("Starting pump");
      return Q.resolve()
        .then(pump.start.bind(pump))
        .then(log("Pump started successfully"))
        .catch(logError("Failed to start pump"));
    })
    .then(function() {
      console.log("Waiting to monitor flow");
      return wait(1000);
    })
    .then(monitorFlow.bind(null, pump, inputPins.tankIsFull, inputPins.pressure))
    .then(function() {
      return pump.stop()
        .then(log("Pump stopped successfully"))
        .catch(logError("Failed to stop pump"));
    })
    .then(wait.bind(null, 1000 * 60 * 5))
    .finally(cleanUp.bind(null, outputPins));
}


module.exports = {
  init: function() {
    var pins = configManager.getConfig().pins;

    _.each(pins.outputs, function(output) {
        device.pinMode(output.pin, device.OUTPUT, 7, "pulldown", "fast", function(x){
            device.digitalWrite(output.pin, output.offValue === "LOW" ? LOW : HIGH);
        });
    });

    _.each(pins.inputs, function(input) {
        device.pinMode(input.pin, device.INPUT, 7, "pullup", "fast");
    });

    return Q.resolve();
  },

  startCycle: startCycle
};