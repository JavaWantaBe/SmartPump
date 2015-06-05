var Q = require("q");
var fs = require("fs");
var appendFile = Q.nfbind(fs.appendFile);
var readFile = Q.nfbind(fs.readFile);
var file = __dirname + "/storage/log";
var queue = loadLog();
var logs = [];

function loadLog() {
    return readFile(file)
        .then(function(data) {
            console.log("[logger, info] Loaded logs");
            logs = data.toString().split("\n").filter(function(log) {
                return log.length;
            });
        }, function(error) {
            console.log("[logger, info] Failed to open log file: " + error);
            return Q.resolve();
        });
}

function log(moduleName, level, message) {
    var msg = "["+moduleName+", "+ level +"] " + message;
    console.log(msg);
    queue = queue
        .then(function() {
            return appendFile(file, msg + "\n");
        })
        .then(function() {
            logs.push(msg);
        });
}

log.getLogs = function() {
    return logs;
};

module.exports = log;