var _ = require("lodash");
var device = require("../device");

/*
  Params:
    startOutputPin: OutputPin Object - The pin that signals the pump to turn on
    valve: Valve Object - The valve that corresponds to this pump
*/
function Pump(startOutputPin, valve) {
  this.startOutputPin = startOutputPin;
  this.valve = valve;
  _.bindAll(this); // binds all of this objects methods to itself
}

_.extend(Pump.prototype, {
  /* 
    Signal the pump to run and signal the valve to open
    
    Returns: null
  */
  start: function() {
    // valve.open returns a promise, but we don't want to halt execution,
    // so I'm not returning the promise. I am catching its errors so they can be 
    // handled and logged

    this.startOutputPin.turnOn();
    this.valve.open().catch(function(error) {
      console.log("Error: Valve failed to open: " + error);
    });
  },

  /* 
    Stop signalling the pump to run and signal the valve to close

    Returns: Promise
      resolves when the valve closes
      rejects if the valve times out while closing
  */
  stop: function() {
    this.startOutputPin.turnOff();
    return this.valve.close();
  }
});

module.exports = Pump;
