var db = require("../database");
var QUERY = "INSERT INTO pump_cycle( pump_used, avg_gpm, total_gallons, total_pumping_time, valve_open_time, valve_close_time, prime_time) VALUES(?, ?, ?, ?, ?, ?, ?)";

/*
    takes an array of javascript date objects and saves them to the database
    returns a promise that is resolved when the entries are finished being saved

    Deletes all entries from the tide table before saving
*/
module.exports = function pushPumpCycleQuery(options) {
  return db.query(QUERY, [
    options.pump_used, 
    options.avg_gpm || 0,
    options.total_gallons || 0, 
    options.total_pumping_time || "00:00:00",
    options.valve_open_time || "00:00:00",
    options.valve_close_time || "00:00:00",
    options.prime_time || "00:00:00"
  ]);
};
