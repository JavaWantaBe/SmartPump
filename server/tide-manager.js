var Q = require("q");
var log = require("./logger").bind(null, "tide-manager");
var writeFile = Q.nfbind(require("fs").writeFile);
var config = require("./config/tide-manager");
var automaticMgr = require("./automatic-tide-manager");
var manualMgr = require("./manual-tide-manager");


module.exports = {
    getEntries: function() {
        log("info", "Retrieving entries in " + (config.manualMode ? "manual" : "automatic") + " mode");
        return config.manualMode ? 
            manualMgr.getEntries() : automaticMgr.getEntries()
    },

    setEntries: function(newEntries) {
        return config.manualMode ?
            manualMgr.setEntries(newEntries) :
            Q.resolve("Cannot set entries in automatic mode");
    },

    updateEntries: function() {
        return config.manualMode ?
            Q.resolve("Cannot update entries in manual mode") :
            automaticMgr.updateEntries();
    },

    getManualMode: function() {
        return config.manualMode;
    },

    setManualMode: function(manualMode) {
        config.manualMode = !!manualMode;
        return writeFile("./config/tide-manager.json", JSON.stringify(config));
    },

    // Retrieve the next valid tide timestamp
    getTimeUntilNextTide: function() {
        return this.getEntries().then(function(entries) {
            var nowTimestamp = (new Date()).getTime();
            var nextEntry = entries.reduce(function(lowest, entry) {
                return (entry >= nowTimestamp && entry < lowest) ? entry : lowest;
            });

            if(!nextEntry) {
                log("error", "Failed to retrieved next tide entry: no up to date entries");
                return Q.reject("No valid tide entries");
            }
            return nextEntry - nowTimestamp;
        });
    }
};