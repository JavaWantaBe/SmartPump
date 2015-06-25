var _ = require("lodash");
var device = require("../device");
var attachInterrupt = device.attachInterrupt;
var detachInterrupt = device.detachInterrupt;

/*
  Used to describe an input pin, provides methods for attaching and detaching interrupts
  to the given pin

  Params:
    pin: String - The pin ID that will be passed to bonescript for attaching/detaching interrupts
    handler: Function - The handler function used by bonescript's attachInterrupt and detachInterrupt
    mode: String - The mode used by bonescript's attachInterrupt and detachInterrupt
*/
function InputPin(pin, handler, mode) {
  this.pin = pin;
  this.handler = handler;
  this.mode = mode;
  this._isAttached = false; // private
}

_.extend(InputPin.prototype, {
  /*
    Attaches an interrupt to this pin
    Params:
      callback: Function - The function to be called when the interrupt fires

    Returns: null
  */
  attach: function(callback) {
    if(this._isAttached) {
      console.log("Warning: attaching an interrupt to a pin that already has an interrupt attached: " + this.pin);
    }
    attachInterrupt(this.pin, this.handler, this.mode, callback);
    this._isAttached = true;
  },

  /*
    Detaches the interrupt from this pin. 
    Does nothing if no interrupts are attached.

    Returns: null
  */
  detach: function() {
    if(this._isAttached) {
      detachInterrupt(this.pin);
      this._isAttached = false;
    }
  },
  
  /*
    Attaches an interrupt to this pin until the first signal (that passes the handler function)
    is received.

    Params:
      callback: Function - The function to be called when the interrupt fires

    Returns: null
  */
  once: function(callback) {
    this.attach(function() {
      this.detach();
      callback();
    }.bind(this));
  }
});

module.exports = InputPin;
