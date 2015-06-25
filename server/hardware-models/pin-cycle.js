var Q = require("q");

/*
  Utility function for handling the interaction between an input and output pin.
  
  Params:
    startOutput:OutputPin Object - The pin that needs to be turned on to begin the cycle
    endInput:InputPin Object - The pin that signals the end of the cycle (resolves returned promise)
    timeoutMS:Integer - The number of milliseconds to wait before failing the cycle (rejects returned promise)

  Returns:
    Promise
      Resolves once a signal is received on endInput
      Rejects on error or when the timeout finishes

  Takes an output and input pin and a timeout (in milliseconds), and follows these steps:
    start the timeout
    begins listening to the input pin
    turns on the output pin
    waits to either receive a signal on the input (resolve) or a signal on the timeout (reject)
    clears the timeout
    turns off the output pin
    stops listening to the input pin
*/
function pinCycle(startOutput, endInput, timeoutMS) {
  var timeout;

  function cleanup() {
    clearTimeout(timeout); // this is a no-op if the timeout is cleared or doesn't exist
    startOutput.turnOff(); // stop outputting start signal
    endInput.detach(); // stop listening for end signal
  }

  return Q.Promise(function(resolve, reject) {
    // start timeout
    timeout = setTimeout(function() {
      reject(new Error("Timeout reached"));
    }, timeoutMS);

    // begin listening for end signal
    endInput.once(function() {
      resolve();
    });

    // output start signal
    startOutput.turnOn();
  }).finally(cleanup);
}

module.exports = pinCycle;
