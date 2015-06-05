var Q = require("q");
var fs = require("fs");
var writeFile = Q.nfbind(fs.writeFile);
var readFile = Q.nfbind(fs.readFile);
var log = require("./logger").bind(null, "netword-manager");
var file = __dirname + "/config/network.json";
var config;

module.exports = {
    setNetworkConfig: function(newConfig) {
        config = newConfig;
        return writeFile(file, newConfig).then(this.applyNetworkConfig.bind(this));
    },

    getNetworkConfig: function() {
        return config ? Q.resolve(config) : readFile(file).then(function(data) {
            config = JSON.parse(data);
            return config;
        });
    },

     // TODO: Actually write network settings
    applyNetworkConfig: function() {
        log("info", "Configuring network settings");
        return Q.resolve();
    }
};