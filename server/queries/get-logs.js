var db = require("../database");
var query = "SELECT level, message, timestamp FROM log";

/*
    @returns
        promise - resolves all logs
*/
module.exports = function() {
    return db.query(query).then(function(result) {
        return result;
    });
};