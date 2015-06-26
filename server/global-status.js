/**
* Created by richard on 6/7/15.
*/
"use strict";

var b = require("bonescript");
var Q = require("q");

var _onBeagleBoard = false;


module.exports = {
/*
  I wrapped this function in a promise since it is asynchronous,
  and there was no way to wait on this function before.

  This function will be called and resolved before the database is initialized
  */
  init: function() {
    return Q.promise(function(resolve) {
      b.getPlatform(function(platform) {
        _onBeagleBoard = !!platform.version;
        resolve();
      });
    });
  },

  onBeagleBone: function() {
    return _onBeagleBoard;
  }
};
