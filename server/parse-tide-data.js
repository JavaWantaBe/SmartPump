"use strict";

/*
    Private module
    Used by: server/tide-retriever.js

    This module's purpose is to take a string of unparsed tide data (likely retrieved from NOAA) and parse it into 
    instances of TideEntry 

    Exports:
        #parse(data:String) -> Array
            Takes raw unparsed tide data and returns an array of TideEntry instances (see: server/tide-entry.js)
*/

var _           = require("lodash"); // Utility library: http://lodash.com/docs
var headers = [
    "station_id",
    "sensor_id",
    '"latitude (degree)"',
    '"longitude (degree)"',
    "date_time",
    '"sea_surface_height_amplitude_due_to_equilibrium_ocean_tide (m)"',
    "type",
    "datum_id",
    '"vertical_position (m)"'
];
var expectedHeader = "station_id,sensor_id,\"latitude (degree)\",\"longitude (degree)\",date_time,\"sea_surface_height_amplitude_due_to_equilibrium_ocean_tide (m)\",type,datum_id,\"vertical_position (m)\"";
var headerCount = headers.length;
var entries = [];


// Private function
// Attempts to validate the tokens passed in to be parsed by comparing the first nine indexes with the expected table headers
// Returns false if any differences are found, true otherwise
function validateHeaders(headerLine) {
    return headerLine === expectedHeader;
}

// Private function for weeding out invalid tide lines
function validateLine(line) {
    return line.length > 100; // arbitrary length should probably be changed
}

// Private function for parsing individual tide lines
function parseLine(line) {
    var fields;
    var rawEntry; // object of unparsed values
    var entry; // after parsing individual parts
    var values;
    var time;

    if(!validateLine(line)) {
        return null;
    }

    fields = line.split(",");
    rawEntry = {
        stationId: fields[0],
        sensorId: fields[1],
        latitude: fields[2],
        longitude: fields[3],
        time: fields[4],
        seaSurfaceHeight: fields[5],
        type: fields[6],
        datumId: fields[7],
        verticalPosition: fields[8],
        rawLine: line
    };

    return {
        time: rawEntry.time,
        high: rawEntry.type === "H"
    };
}


/*
    Arguments:
        data:String - Raw tide data from NOAA

    returns:
        entries:[Date] - An array of high tide dates (uses native javascript date objects)
*/
function parseTideData(data) {
    var lines = data.split("\n");
    var headers = lines.shift(); // strip the table header line off

    if(!validateHeaders(headers)) { // make sure the headers look valid
        return null;
    }

    return _.compact(_.map(lines, parseLine))
        .filter(function(entry) {
            return entry.high;
        })
        .map(function(entry) {
            return new Date(entry.time);
        });
}

module.exports = parseTideData;