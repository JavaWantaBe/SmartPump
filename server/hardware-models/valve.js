var _ = require("lodash");
var pinCycle = require("./pin-cycle");

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
    return pinCycle(this.openOutput, this.openSuccessInput, this.openTimeoutMS);
  },

  /*
    Same as #open, but closes the valve instead of opening it
  */
  close: function() {
    return pinCycle(this.closeOutput, this.closeSuccessInput, this.closeTimeoutMS);
  }
});

module.exports = Valve;
