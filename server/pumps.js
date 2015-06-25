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
  var pinConfig = config.pins;
  var timeouts = config.pumpTimeouts;

  // generate Pin objects from the pin configuration in config.json
  var outputPins = _.reduce(pins.outputs, function(outputPins, pinConfig, pinName) {
    outputPins[pinName] = new OutputPin(
      pinConfig.pin,
      pinConfig.onValue === "HIGH" ? HIGH : LOW,
      pinConfig.onValue === "HIGH" ? HIGH : LOW
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

var currentPumpId = "pump1";

// was "preCycle". I chose a name that describes what the function does, not when it's called
// timing out and turning off pins are both handled by the Valve close function
function closeValves() {
  return Promise.all([
    pump1.valve.close(),
    pump2.valve.close()
  ]);
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

  function cleanup() {
    clearTimeout(timeout);
    inputs.tankIsFull.detach();
    inputs.pressure.detach();
  }

  return Promise.race([
    new Promise(function(resolve, reject) { // timeout
      timeout = setTimeout(function() {
        cleanup();
        reject(new Error("Pump timed out"));
      });
    }),

    new Promise(function(resolve, reject) { // pressure
      // I'm not sure what this signal means,
      // so I'm not sure if this should be resolving or rejecting
      inputs.pressure.once(function() {
        cleanup();
        reject();
      });
    }),

    new Promise(function(resolve, reject) { // tank full
      inputs.tankIsFull.once(function() {
        cleanup();
        resolve();
      });
    })
  ]);
}

function cleanUp() {
  _.each(outputPins, function(outputPin) {
    outputPin.turnOff();
  });
}

function startCycle() {
  var pumps = getPumps();
  var pump;
  // switch pumps on each cycle
  currentPumpId = currentPumpId === "pump1" ? "pump2" : "pump1";
  pump = pumps[currentPumpId];

  return closeValves()
    .then(runPrimeCycle)
    .then(pump.start)
    .then(wait.bind(null, 30000))
    .then(monitorFlow.bind(null, pump))
    .then(pump.stop)
    .then(cleanup, function(error) {
      console.log("Pump cycle failed: " + error);
      cleanUp();
      return Promise.reject(error);
    });
}