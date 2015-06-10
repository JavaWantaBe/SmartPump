"use strict";

var db = require("../database" ),
    logger = require("../logger")("getUser");


/*
    @params
        username
        password
    @returns
        promise - resolves single user object or undefined if user isn't found
*/
module.exports = function(username, password) {
    var query = ["SELECT * FROM user WHERE username='",username,"' AND password=md5('",password,"') limit 1"].join("");

    logger.debug( "Query was: " + query );

    return db.query(query).then(function(result) {
        logger.debug("Results were: " + result );
        return result[0];
    });
};