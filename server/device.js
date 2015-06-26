/*
  This module exists to wrap the bonescript module
  with any checks or overwrites that we need.

  Any bonescript functions we're using should be exposed only through
  this module.

  The main reason I'm wrapping these functions is to throw errors when they
  fail (which normally just results in the function returning false)
*/

var b = require("bonescript");

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

module.exports = {
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
};