var pumps = require("./pumps");
var tideManager = require("./tide-manager");
var log = require("./logger").bind(null, "scheduler");
var currentTask;

// Runs a pump cycle. If there is already a pump queued, it will be cancelled, and the new one will replace it
function run() {
    if(currentTask) {
        currentTask.stop();
        currentTask = null;
    }

    tideManager.updateEntries()
        .then(function() {
            return tideManager.getTimeUntilNextTide();
        })
        .then(function(ms) {
            currentTask = new PumpTask(ms);
            currentTask.run(function() {
                currentTask = null;
            
                pumps.run().then(run);
            });
        })
        .catch(function(error) {
            // this is where fatal errors will most likely be caught
            log("error", error);
        });
}

function PumpTask(ms) {
    this.ms = ms;
}

PumpTask.prototype.run = function(onComplete) {
    log("info", "Waiting " + Math.floor(this.ms/3600000 * 10)/10 + " hours for next high tide...");
    this._timeoutId = setTimeout(function() {
        this._timeoutId = null;
        log("info", "Starting pumps");
        onComplete();
    }.bind(this), this.ms);
};

PumpTask.prototype.stop = function() {
    log("info", "Cancelling pump task");
    clearTimeout(this._timeoutId);
    this._timeoutId = null;
};

module.exports = {
    run: run
};