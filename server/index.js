var Q = require("q");
var networkManager = require("./network-manager");
var scheduler = require("./scheduler");
var log = require("./logger").bind(null, "index");
var server = require("./server");

function start() {
    networkManager.applyNetworkConfig()
        .then(scheduler.run)
        .then(server)
        .catch(function(error) {
            log("error", "Error: " + error);
        });
}

start();