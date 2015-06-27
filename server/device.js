/*
  This module exists to wrap the bonescript module
  with any checks or overwrites that we need.

  Any bonescript functions we're using should be exposed only through
  this module.

  The main reason I'm wrapping these functions is to throw errors when they
  fail (which normally just results in the function returning false)
*/

var b = require("bonescript");
var IS_ON_BEAGLEBONE = false;

function pinMode(pin, mode, muxMode, pullDirection, skew, callback) {
  if(!b.pinMode(pin, mode, muxMode, pullDirection, skew, callback)) {
    throw new Error("Failed to set pin mode on pin " + pin);
  }
}

/*
  This function does not need to return
  a promise if it's not actually asynchronous.
  
  An error thrown in a .then will still be caught
  and passed down the promise chain to a .catch
  even if the error was thrown using "thow" rather
  than "reject".
*/
function digitalWrite(pin, value) { 
  if(!b.digitalWrite(pin, value)) {
    throw new Error("Failed to write to pin " + pin + " value " + value);
  }
}

function detachInterrupt(pin) {
  if(!b.detachInterrupt(pin)) {
    throw new Error("Failed to detach interrupt on pin " + pin);
  }
}

function attachInterrupt(pin, handler, mode, callback) {
  // wrapper currently adds no additional functionality
  return b.attachInterrupt(pin, handler, mode, callback);
}

module.exports = IS_ON_BEAGLEBONE ? {
  pinMode: pinMode,
  digitalWrite: digitalWrite,
  digitalRead: b.digitalRead,
  detachInterrupt: detachInterrupt,
  attachInterrupt: attachInterrupt,
  LOW: b.LOW,
  HIGH: b.HIGH,
  FALLING: b.FALLING,
  RISING: b.RISING,
  OUTPUT: b.OUTPUT,
  INPUT: b.INPUT
} : getFakeDevice();

function getFakeDevice() {
  var EventEmitter = require("events").EventEmitter;
  var _ = require("lodash");

  function log(str) {
    console.log("[Fake-Hardware] " + str);
  }

  var hardware = _.extend(new EventEmitter(), {
    pins: {
      P9_23: b.LOW, // close valve 1
      P9_41: b.LOW, // close valve 2
      P8_9: b.LOW, // start priming
      P9_12: b.LOW, // start pump 1
      P9_27: b.LOW, // start pump 2
      P9_15: b.LOW, // open valve 1
      P8_7: b.LOW, // open valve 2
        
      P8_17: b.HIGH, // valve 1 closed
      P8_26: b.HIGH,  // valve 2 closed
      P8_14: b.HIGH, // prime finished
      P8_12: b.LOW, // tank is full
      P8_11: b.LOW, // low pressure
      P8_16: b.HIGH, // valve 1 opened
      P8_18: b.HIGH, // valve 2 opened
      P8_15: b.LOW // emergency stop
    },
    interrupts: {}
  });

  function emitAfter(target, eventName, event, delay, message) {
    return function() {
      if(message) log(message + " in " + delay + "ms");
      setTimeout(function() {
        target.emit(eventName, event);
      }, delay);
    };
  }

  hardware.on("P9_23", emitAfter(hardware, "P8_17", b.LOW, 1000, "Closing valve 1")); // close valve 1
  hardware.on("P9_41", emitAfter(hardware, "P8_26", b.LOW, 1500, "Closing valve 2")); // close valve 1
  
  hardware.on("P8_9", emitAfter(hardware, "P8_14", b.LOW, 3000, "Priming")); // priming cycle
  
  hardware.on("P9_12", emitAfter(hardware, "P8_12", b.HIGH, 3000, "Filling tank with pump 1")); // start pump 1
  hardware.on("P9_27", emitAfter(hardware, "P8_12", b.HIGH, 3000, "Filling tank with pump 2")); // start pump 2

  hardware.on("P9_15", emitAfter(hardware, "P8_16", b.LOW, 3000, "Opening valve 1")); // open valve 1
  hardware.on("P8_7", emitAfter(hardware, "P8_18", b.LOW, 3000, "Opening valve 2")); // open valve 2

  var fakeDevice = {
    pinMode: function() {return true;},

    digitalWrite: function(pin, value) {
      //log("[digitalWrite] " + pin + " " + value);
      hardware.emit(pin, value);
      hardware[pin] = value;
      return true;
    },

    digitalRead: function(pin) {
      return hardware[pin];
    },

    detachInterrupt: function(pin) {
      var interrupt = hardware.interrupts[pin];
      //log("[detachInterrupt] " + pin);
      if(interrupt) {
        hardware.removeListener(pin, interrupt);
        delete hardware.interrupts[pin];
      }
      return true;
    },

    attachInterrupt: function(pin, handler, mode, callback) {
      //log("[attachInterrupt] " + pin)
      hardware.interrupts[pin] = callback;
      hardware.on(pin, function() {
        //log("[interrupt] " + pin);
        callback();
      });
    },

    LOW: b.LOW,
    HIGH: b.HIGH,
    FALLING: b.FALLING,
    RISING: b.RISING,
    OUTPUT: b.OUTPUT,
    INPUT: b.INPUT
  };
  return fakeDevice;
}