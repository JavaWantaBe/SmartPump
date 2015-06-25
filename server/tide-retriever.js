"use strict";

/**
 * @file tide-retriever.js
 * @brief Private Module Used by: server/pump-scheduler
 *
 *  This module's job is to provide a simple means for fetching raw tide data from NOAA.
 *  Once the data is fetched, it is passed through tide parser and resolved via a Promise API.
 *
 *  Exports:
 *      #get(from:Moment, to:Moment, [params:Object]) -> Promise
 *          Retrieves tide data from NOAA between the passed dates
 *          An optional parameters object can be passed to override any
 *          default parameters
 *
 *          Returns a promise that resolves an array of TideEntry instances (see: server/tide-entry.js)
 *          or rejects an error object.
 *
 *  Working test URL:
 *      "http://opendap.co-ops.nos.noaa.gov/ioos-dif-sos/SOS?"+
 *      "service=SOS&"+
 *      "request=GetObservation&"+
 *      "version=1.0.0&"+
 *      "observedProperty=sea_surface_height_amplitude_due_to_equilibrium_ocean_tide&"+
 *      "offering=urn:ioos:station:NOAA.NOS.CO-OPS:9432780&"+
 *      "responseFormat=text%2Fcsv&"+
 *      "eventTime=2013-03-06T00:00:00Z/2013-03-12T23:59:00Z&"+
 *      "result=VerticalDatum%3D%3Durn:ioos:def:datum:noaa::MLLW&"+
 *      "dataType=HighLowTidePredictions&"+
 *      "unit=Meters";
 */

var _ = require("lodash");
var logger = require("./logger")("tide-retriever");
var tideParser = require("./tide-parser");
var http = require("http");
var config = require("./config-manager").getConfig().NOAARequest;
var requestURLBase = "http://opendap.co-ops.nos.noaa.gov/ioos-dif-sos/SOS?";
var isoStringMSRegex = /\.\d\d\dZ$/; // needed to remove milliseconds from date#toISOString
var requestTimeout = 10000;

function get(url) {
    return new Promise(function(resolve, reject) {
        return http.get(url, function(res) {
            var buffer = "";
            res.on("data", function(chunk) {
                buffer += chunk;
            });

            res.on("end", function() {
                resolve(buffer);
            });
        }).on("error", reject);
    });
}

// Generates the "eventTime" parameter for the get request
// Takes two javascript dates
// Return value should be a string formatted like: "2000-00-00T00:00:00Z/2000-00-00T00:00:00Z"
function getEventTime(from, too) {
    return from.toISOString().replace(isoStringMSRegex, "Z") + "/" + too.toISOString().replace(isoStringMSRegex, "Z");
}

// Generates the request URL for tide data between two dates
// see _config.json "NOAARequest" for NOAA settings used in request
function getRequestURL(from, too) {
    return _.reduce(config, function(requestURL, value, key, index) {
        if(index) {
            requestURL += "&";
        }
        if(key === "eventTime") {
            return requestURL + key + "=" + getEventTime(from, too);
        }
        else {
            return requestURL + key + "=" + value;
        }
    }, requestURLBase);
}

// Requests tide entries from NOAA between two dates
// Dates should be javascript date objects
// Returns a promise that resolves the retrieved tide entries as an array of javascript dates
function fetchTideDates(from, too) {
    var url = getRequestURL(from, too)
    logger.info("Requesting tide data from: '" + url + "'");
    return get(url)
        .then(function(rawTideData) {
            logger.info("Successfully retrieved tide data");
            return tideParser.parse(rawTideData);
        })
        .catch(function(error) {
            return Promise.reject(new Error("Failed to fetch tide data from NOAA's servers: " + error.message));
        });
}

module.exports = {
    fetchTideDates: fetchTideDates
};