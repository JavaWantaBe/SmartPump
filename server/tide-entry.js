"use strict";

/*

    For wrapping parsed tide entries
    Exports:
        TideEntry:class
            #getModel() -> Object
                Returns the entries with time converted to a unix timestamp

            #insert(db: Database) -> Promise
                Inserts the entry into the passed database in the table "smartPumps.tides"
                Resolves result of insert
                Rejects error from database

            static methods:
            #fromModel(model:Object) -> TideEntry
                Takes an model entry and returns a wrapped TideEntry

*/

var _        = require("lodash"),
    moment   = require("moment"),
    util     = require("./utility"),
    Q        = require( 'q' ),
    dbFormat = "YYYY-MM-DD HH:mm:ss";

function Entry(options) {
    _.extend(this, options);
}

_.extend(Entry.prototype, {
    // Returns model data that can be sent to the client
    getModel: function() {
        return {
            stationId: this.stationId,
            sensorId: this.sensorId,
            latitude: this.latitude,
            longitude: this.longitude,
            time: util.momentToUnix(this.time),
            seaSurfaceHeight: this.seaSurfaceHeight,
            high: this.high,
            datumId: this.datumId,
            verticalPosition: this.verticalPosition
        };
    },

    getDBModel: function() {
        return {
            stationId: this.stationId,
            sensorId: this.sensorId,
            latitude: this.latitude,
            longitude: this.longitude,
            time: this.time.format(dbFormat),
            seaSurfaceHeight: this.seaSurfaceHeight,
            high: this.high,
            datumId: this.datumId,
            verticalPosition: this.verticalPosition
        };
    },

    // This method is broken
    insert: function(db) {
        var data = this.getDBModel(),
            query = "INSERT INTO tide( tide_time, data_download_date  ) VALUES( ?, NOW() ) ON DUPLICATE KEY UPDATE tide_time = VALUES( tide_time ), data_download_date = NOW()";
            console.log("Inserting", data.time);
        return db.query(query, data.time );
    }
});

// static methods of the Entry class
_.extend(Entry, {
    // Creates an TideEntry instance from model data (typically submitted from the web front end)
    fromModel: function(model) {
        return new Entry({
            stationId: model.stationId,
            sensorId: model.sensorId,
            latitude: model.latitude,
            longitude: model.longitude,
            time: util.unixToMoment(model.time),
            seaSurfaceHeight: model.seaSurfaceHeight,
            high: model.high,
            datumId: model.datumId,
            verticalPosition: model.verticalPosition
        });
    },

    fromDBModel: function(model) {
        return new Entry({
            stationId: model.stationId,
            sensorId: model.sensorId,
            latitude: model.latitude,
            longitude: model.longitude,
            time: moment(model.time, dbFormat),
            seaSurfaceHeight: model.seaSurfaceHeight,
            high: model.high,
            datumId: model.datumId,
            verticalPosition: model.verticalPosition
        });
    }
});

module.exports = Entry;