var _ = require("lodash");
var EventEmitter = require("events").EventEmitter;
var config = require("../config");
var writeFileSync = require("fs").writeFileSync;

// Writes the `config` object to config.json
function save() {
  writeFileSync(__dirname + "/../config.json", JSON.stringify(config, null, 4));
}

/*
  Deeply merges an object into the config. Then saves the config to file.
  This should be the only place the config object is modified by the application

  Example:
    merge({
      pins: {
        relays: {
          pump1: "new pump 1 value"
        }
      }
    });

    this will not remove or change the other pin configurations
*/
function merge(source) {
  _.merge(config, source);
  save();
  this.emit("change", config);
}

/*
  This function should be used to access the config object. Do not `require("config")`.
  The required version might be cached, so it might be old settings
*/
function getConfig() {
  return config;
}

module.exports = _.extend(new EventEmitter(), {
  merge: merge,
  getConfig: getConfig
});