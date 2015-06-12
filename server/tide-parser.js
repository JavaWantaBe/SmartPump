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

var _           = require("lodash"), // Utility library: http://lodash.com/docs
    moment      = require("moment"), // time string parsing library: http://momentjs.com/docs/
    Entry       = require("./tide-entry"),
    headers = [
        "station_id",
        "sensor_id",
        '"latitude (degree)"',
        '"longitude (degree)"',
        "date_time",
        '"sea_surface_height_amplitude_due_to_equilibrium_ocean_tide (m)"',
        "type",
        "datum_id",
        '"vertical_position (m)"'
    ],
    expectedHeader = "station_id,sensor_id,\"latitude (degree)\",\"longitude (degree)\",date_time,\"sea_surface_height_amplitude_due_to_equilibrium_ocean_tide (m)\",type,datum_id,\"vertical_position (m)\"",
    headerCount = headers.length,
    entries = [];


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
    var fields,
        rawEntry, // object of unparsed values
        entry, // after parsing individual parts
        values,
        time;

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

    // parsed tide entry
    entry = {
        time:               moment(rawEntry.time, "YYYY-MM-DD-HH:mm:ss-"),
        high:               rawEntry.type === "H",

        stationId:          rawEntry.stationId,
        sensorId:           rawEntry.sensorId,
        datumId:            rawEntry.datumId,

        seaSurfaceHeight:   +(rawEntry.seaSurfaceHeight), // the plus operator will parse a string into a number
        latitude:           +(rawEntry.latitude),
        longitude:          +(rawEntry.longitude),
        verticalPosition:   +(rawEntry.verticalPosition),

        rawEntry:           rawEntry
    };

    return new Entry(entry);
}


// Splits the tide string by line then parses the lines individually
function parseTideData(data) {
    var lines = data.split("\n"),
        headers = lines.shift();

    if(!validateHeaders(headers)) {
        return null;
    }

    return _.compact(_.map(lines, parseLine)).filter(function(entry) {
        return entry.high;
    }); // compact removes falsy values
}

module.exports = {
    parse: parseTideData
};