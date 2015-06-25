var Q = require("q");
var db = require("../database");
var QUERY = "INSERT INTO tide( tide_time, data_download_date  ) VALUES( ?, NOW() ) ON DUPLICATE KEY UPDATE tide_time = VALUES( tide_time ), data_download_date = NOW()";

// twoDigits and toMySQLFormat are from stackoverflow question:
// http://stackoverflow.com/questions/5129624/convert-js-date-time-to-mysql-datetime
function twoDigits(d) {
  if(0 <= d && d < 10) return "0" + d.toString();
  if(-10 < d && d < 0) return "-0" + (-1*d).toString();
  return d.toString();
}

function toMySQLFormat(date) {
  return [
    date.getUTCFullYear(),
    "-",
    twoDigits(1 + date.getUTCMonth()),
    "-",
    twoDigits(date.getUTCDate()),
    " ",
    twoDigits(date.getUTCHours()),
    ":",
    twoDigits(date.getUTCMinutes()),
    ":",
    twoDigits(date.getUTCSeconds())
  ].join("");
};

/*
    takes an array of javascript date objects and saves them to the database
    returns a promise that is resolved when the entries are finished being saved

    Deletes all entries from the tide table before saving
*/
module.exports = function storeTideDatesQuery(dates) {
  return db.query("DELETE FROM tide")
    .then(function() {
      return Q.all(dates.map(function(date) {
        return db.query(QUERY, toMySQLFormat(date));
      }));
    });
};