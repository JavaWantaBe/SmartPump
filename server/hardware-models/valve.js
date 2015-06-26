var _ = require("lodash");
var Q = require("q");
var pinCycle = require("./pin-cycle");
var device = require("../device");

/*
  params:
    openOutput: OutputPin Object - The pin that needs to be turned on to begin opening the valve
    openSuccessInput: InputPin Object - The pin that signals the valve has finished opening
    openTimeoutMS: Integer - The amount of time in milliseconds to wait before throwing a timeout error during opening

    openOutput: OutputPin Object - The pin that needs to be turned on to begin closing the valve
    openSuccessInput: InputPin Object - The pin that signals the valve has finished closing
    openTimeoutMS: Integer - The amount of time in milliseconds to wait before throwing a timeout error during closing
*/
function Valve(openOutput, openSuccessInput, openTimeoutMS,      // open options 
               closeOutput, closeSuccessInput, closeTimeoutMS) { // close options
  this.openOutput = openOutput;
  this.openSuccessInput = openSuccessInput;
  this.openTimeoutMS = openTimeoutMS;

  this.closeOutput = closeOutput;
  this.closeSuccessInput = closeSuccessInput;
  this.closeTimeoutMS = closeTimeoutMS;
}

_.extend(Valve.prototype, {
  /*
    This function signals the valve to open, then waits to receive
    a valve open signal. Once the valve open signal is received,
    the function stops listening for the valve open signal and stops
    signalling the valve to open.

    Returns: Promise
      Resolves when the valve finishes opening
      Rejects if the timeout finishes before the valve opens
  */
  open: function() {
    if(this.openSuccessInput.read() === device.LOW) { // check if already open
      return Q.resolve();
    }
    return pinCycle(this.openOutput, this.openSuccessInput, this.openTimeoutMS);
  },

  /*
    Same as #open, but closes the valve instead of opening it
  */
  close: function() {
    if(this.closeSuccessInput.read() === device.LOW) { // check if already closed
      return Q.resolve();
    }
    return pinCycle(this.closeOutput, this.closeSuccessInput, this.closeTimeoutMS);
  }
});

module.exports = Valve;
