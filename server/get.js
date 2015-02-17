"use strict";

/**
 * @file
 * @brief Get URL requests
 *
 *  http/https get method wrapped in a promise API
 *  Exports:
 *      get(URL) -> Promise
 *
 */


var http    = require("http"),
    https   = require("https"),
    Q       = require("q");

/**
 * @brief Exported Functions
 *
 * Thin wrapper for the http/https request method
 * makes an http request to the specified URL
 * If port used is 443, https is used. Otherwise, http is used
 * Returns a promise that resolves returned data and the response status code.
 *
 * @param options
 * @returns {deferred.promise|*}
 */
module.exports = function(options) {
    var deferred = Q.defer();

    options = options || {};

    var prot = options.port == 443 ? https : http,
        req = prot.request(options, function(res) {
            var output = "";
            res.setEncoding("utf8");

            res.on("data", function (chunk) {
                output += chunk;
                deferred.notify(chunk);
            });

            res.on("end", function(data) {
                deferred.resolve(output, res.statusCode);
            });
        });

    req.on("error", function(err) {
        deferred.reject(err);
    });

    req.end();

    return deferred.promise;
};