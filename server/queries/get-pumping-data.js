"use strict";
/**
 * Created by richard on 6/30/15.
 */

var db = require("../database");
var QUERY = "SELECT pump_used, SUM(total_gallons), DAY(tide_tide_time) as day, MONTH(tide_tide_time) as month \
FROM pump_cycle \
WHERE tide_tide_time > CURDATE() - INTERVAL 12 MONTH \
GROUP BY pump_used, day, MONTH(tide_tide_time) \
ORDER BY month, day ASC;";

/*
 returns a promise that resolves to an array of javascript Date objects
 */
module.exports = function() {
    return db.query(QUERY).then(function(result) {
        return result;
    });
};
