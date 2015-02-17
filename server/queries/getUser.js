"use strict";

var db = require("../database");


/*
    @params
        username
        password
    @returns
        promise - resolves single user object or undefined if user isn't found
*/
module.exports = function(username, password) {
    var query = ["SELECT * FROM user WHERE username='",username,"' AND password=md5('",password,"') limit 1"].join("");

    return db.query(query).then(function(result) {
        return result[0];
    });
};