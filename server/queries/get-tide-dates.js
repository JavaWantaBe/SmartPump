var db = require("../database");
var QUERY = "SELECT * FROM tide";

/*
  returns a promise that resolves to an array of javascript Date objects
*/
module.exports = function getNextTideDateQuery() {
  return db.query(QUERY).then(function(rows) {
    return rows.map(function(row) {
      return new Date(row.tide_time.replace(" ", "T") + "Z"); // Need to convert to ISO otherwise date assumes local time
    });
  });
};
