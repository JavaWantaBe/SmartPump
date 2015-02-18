"use strict";

var db = require("../database");

function quoted(str) {
    return "'"+str+"'";
}

/*
    @returns
        promise - resolves all logs
*/
module.exports = function(userData) {
    var query = [
        "INSERT INTO user (username, email, password) VALUES (",
        [
            quoted(userData.username), 
            userData.email ? quoted(userData.email) : "NULL", 
            "md5("+quoted(userData.password)+")"].join(", "),
        ");"
    ].join("");

    return db.query(query).then(function(result) {
        return result;
    });
};