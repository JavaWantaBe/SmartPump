"use strict";

/*

    Exports:
        File:Class
            #read(options:Object) -> Promise
                Resolves file data as a string
                Rejects error object

            #write(data:String) -> Promise
                Resolves nothing
                Rejects error object

            #getStats() -> Promise
                Resolves an object containing information about the file
                Rejects error object

*/

var logger  = require("./logger")("file"),
    fs      = require("fs"),
    _       = require("lodash"),
    Q       = require("q");
    

// A Promise wrapper for select parts of the file system library
function File(path) {
    this._path = path;
}

_.extend(File.prototype, {

    // returns a promise
    // resolves a file descriptor object
    getStats: function() {
        var self = this,
            deferred = Q.defer();

        fs.stat(this._path, function(err, stats) {
            if(err) {
                deferred.reject(err);
            }
            else {
                deferred.resolve(stats);
            }
        });
        
        return deferred.promise;
    },

    remove: function() {
        var deferred = Q.defer();

        fs.unlink(this._path, function (err) {
            if(err) {
                deferred.reject(err);
            }
            else {
                deferred.resolve();
            }
        });

        return deferred.promise;
    },

    // returns a promise
    // resolves the data from a file as a string
    read: function(options) {
        var self = this,
            deferred = Q.defer();

        fs.readFile(self._path, options, function(err, data) {
            if(err) {
                deferred.reject(err);
            }
            else {
                deferred.resolve(data.toString());
            }
        });
        
        return deferred.promise;
    },

    // takes a string and writes it to a file
    // returns a promise that resolves nothing
    write: function(data, options) {
        var self = this,
            deferred = Q.defer();
        
        fs.writeFile(self._path, data, options, function(err) {
            if(err) {
                logger.error("Failed to write to file " + self._path + ":", err);
                deferred.reject(err);
            }
            else {
                deferred.resolve();
            }
        });

        return deferred.promise;
    }
});

module.exports = File;