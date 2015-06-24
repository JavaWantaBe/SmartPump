"use strict";

/**
 * @file
 * @brief Database Connectivity
 *
 * @type {exports}
 * @private
 */


var _ = require("lodash");
var Q = require("q");
var mysql = require("mysql");
var logger = require("./logger")("database");
var config = require("./config-manager").getConfig().database;
var connection;
var connected;

/**
 * @brief Connects to the MySQL database
 *
 * Takes an options object. If none is passed, uses options found in server/config/database.
 *
 * @param options
 * @returns {deferred.promise|*}
 */
function connect() {
    var deferred = Q.defer();

    if(connected) {
        deferred.resolve();
        return deferred.promise;
    }

    connection = mysql.createConnection(config);

    connection.connect(function(err) {
        if(err) {
            logger.error("Could not connect to database");
            deferred.reject(err);
        }
        else {
            connected = true;
            deferred.resolve();
        }
    });

    return deferred.promise;
}

/**
 * @brief Closes the connection to the MySQL database
 * @returns {deferred.promise|*}
 */
function disconnect() {
    var deferred = Q.defer();

    connection.end(function(err) {
        connected = false;
        if(err) {
            logger.error("Could not disconnect from database");
            deferred.reject(err);
        }
        else {
            deferred.resolve();
        }
    });

    return deferred.promise;
}


/**
 * @brief Queries the MySQL database
 *
 * Takes the same arguments as the connection.query method of the mysql module except rather than taking a callback
 *
 * @returns {deferred.promise|*}
 */
function query() {
    var deferred = Q.defer(),
        args = _.toArray(arguments);

    if(!connected) {
        deferred.reject("Not connected to mysql server");
    }

    // push the callback argument onto the args array so
    args.push(function(err, result) {
        if(err) {
            logger.error( "Error in query: " + err );
            deferred.reject(err);
        }
        else {
            deferred.resolve(result);
        }
    });

    connection.query.apply(connection, args);

    return deferred.promise;
}

/**
 * @brief Checks if database is connected
 * @returns {*}
 */
function isConnected() {
    return connected;
}

/**
 * @brief Exported Functions
 * @type {{connect: connect, disconnect: disconnect, query: query, isConnected: isConnected}}
 */
module.exports = {
    connect: connect,
    disconnect: disconnect,
    query: query,
    isConnected: isConnected
};