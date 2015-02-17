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

var _           = require("lodash"),
    moment      = require("moment"),
    Q           = require("q"),
    tideParser  = require("./tide-parser"),
    get         = require("./get");

// Default GET request key/values
var defaultParams = {
        service: "SOS",
        request: "GetObservation",
        version: "1.0.0",
        observedProperty: "sea_surface_height_amplitude_due_to_equilibrium_ocean_tide",
        offering: "urn:ioos:station:NOAA.NOS.CO-OPS:9432780",
        responseFormat: "text%2Fcsv",
        eventTime: null,                //"2000-00-00T00:00:00Z/2000-00-00T00:00:00Z",
        result: "VerticalDatum%3D%3Durn:ioos:def:datum:noaa::MLLW",
        dataType: "HighLowTidePredictions",
        unit: "Meters"
    },
    requestURL = "http://opendap.co-ops.nos.noaa.gov/ioos-dif-sos/SOS?",
    eventTimeFormat = "YYYY-MM-DDTHH:mm:ss";

// Generates the "eventTime" parameter for the get request
// Takes two moment.js instances to define a time range
// Return value should be a string formatted like: "2000-00-00T00:00:00Z/2000-00-00T00:00:00Z"
function getEventTime(from, too) {
    return from.format(eventTimeFormat) + "Z/" + too.format(eventTimeFormat) + "Z";
}

// Generates the request URL for tide data between two dates
// `params` object can be optionally passed to override any of the defaults in `defaultParams`
function getRequestURL(from, too, params) {
    var requestString = requestURL,
        eventTime;

    params = _.defaults(params || {}, defaultParams);

    _.each( defaultParams, function( defaultParam, key, index ) {
        if(index) {
            requestString += "&";
        }
        if(key === "eventTime") {
            eventTime = getEventTime( from, too );
            requestString += key + "=" + eventTime;
        }
        else {
            requestString += key + "=" + (params[key] || defaultParam);
        }
    });

    return requestString;
}

// Requests tide entries from NOAA between two dates
// Dates should be Moment instances
// Returns a promise that resolves the retrieved tide entries as TideEntry instances (see server/tide-entry.js)
function getTideEntries(from, too, params) {
    var deferred = Q.defer();

    get( getRequestURL( from, too, params ) ).then(
        function( data ) {
            deferred.resolve( tideParser.parse( data ) );
        },
        function(err) {
            deferred.reject(err);
        }
    );

    return deferred.promise;
}

module.exports = {
    get: getTideEntries
};