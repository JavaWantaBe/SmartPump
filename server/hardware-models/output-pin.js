var _ = require("lodash");
var device = require("../device");
var digitalWrite = device.digitalWrite;

/*
  Used to describe an output pin, provides methods for turning the pin on and off
  to the given pin

  Params:
    pin: String - The pin ID that will be passed to bonescript
    onValue: Integer - The value to be passed to digitalWrite when the pin is turned on
      default: HIGH
    offValue: Integer - The value to be passed to digitalWrite when the pin is turned off
      default: LOW
*/
function OutputPin(pin, onValue, offValue) {
  this.pin = pin;
  this.onValue = onValue || device.HIGH;
  this.offValue = offValue || device.LOW;
}

_.extend(OutputPin.prototype, {
  /*
    Writes onValue to the pin

    Returns: null
  */
  turnOn: function() {
    digitalWrite(this.pin, this.onValue);
  },
  
  /*
    Writes offValue to the pin

    Returns null
  */
  turnOff: function() {
    digitalWrite(this.pin, this.offValue);
  }
});

module.exports = OutputPin;
