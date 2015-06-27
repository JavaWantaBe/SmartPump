/**
 * @file download-tide-data.js
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
var Q = require("q");
var http = require("http");
var config = require("./config-manager").getConfig().NOAARequest;
var requestURLBase = "http://opendap.co-ops.nos.noaa.gov/ioos-dif-sos/SOS?";
var isoStringMSRegex = /\.\d\d\dZ$/; // needed to remove milliseconds from date#toISOString
var requestTimeout = 10000;

// wrapped http.get in a promise
function get(url) {
  return Q.Promise(function(resolve, reject) {
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
function getEventTime(startDate, endDate) {
  return startDate.toISOString().replace(isoStringMSRegex, "Z") + "/" + endDate.toISOString().replace(isoStringMSRegex, "Z");
}

// Generates the request URL for tide data between two dates
// see _config.json "NOAARequest" for NOAA settings used in request
function getRequestURL(startDate, endDate) {
  return _.reduce(config, function(requestURL, value, key, index) {
    if(index) {
      requestURL += "&";
    }
    if(key === "eventTime") {
      return requestURL + key + "=" + getEventTime(startDate, endDate);
    }
    else {
      return requestURL + key + "=" + value;
    }
  }, requestURLBase);
}

/* 
  Requests tide entries from NOAA between two dates
  Dates should be javascript date objects
  
  Options:
    from

  Returns: Promise
    resolves: String - Raw tide data
*/
function downloadTideData(options) {
  options = options || {};
  var startDate = options.startDate;
  var endDate = options.endDate;

  if(!startDate || !endDate) {
    throw new Error("startDate and endDate are required arguments");
  }

  var url = getRequestURL(startDate, endDate);
  return get(url).catch(function(error) {
    if(error.code === "EAI_AGAIN") {
      throw new Error("EAI_AGAIN - DNS Lookup failed (is the module connected to the internet?)");
    }
  });
}

module.exports = downloadTideData;