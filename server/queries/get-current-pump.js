var db = require("../database");
var PUMP1 = 0;
var PUMP2 = 1;

var QUERY = "SELECT pump_used FROM pump_cycle ORDER BY tide_tide_time DESC LIMIT 1";

module.exports = function getCurrentPumpQuery() {
  return db.query(QUERY).then(function(rows) {
      if(!rows || !rows.length) {
          return PUMP1;
      } else {
          return rows[0].pump_used === "pump1" ? PUMP2 : PUMP1;
      }
  });
};
