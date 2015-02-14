"use strict";

/**
 * @file
 * @brief Performs all Datalogging
 *
 *	Provides module and global level logging to console and/or file
 *	Database logging can additionally be added later.
 *
 *  Uses as a transport layer - MySQL
 *  Installed with npm install winston-mysql-transport --save
 *
 *  NOTE:
 *  This transport does not support (yet) :
 *      streaming
 *      querying
 *      Saving of metadata
 *
 *
 *	Exports:
 *		loggerFactory(name:String) -> Logger
 *			Takes a name for the logger to create.
 *			Returned logger contains 3 methods for different kinds of logging:
 *				info  - Basic runtime information
 *				warn  - Non-fatal issues
 *				error - Fatal issues
 *			    debug - Debugging information only destined for the console
 *
 *		First you must generate your log table
 *	    file : extras/schema.sql
 *	    CREATE TABLE IF NOT EXISTS `my_database`.`log_table` (
 *	    `id` int(10) NOT NULL AUTO_INCREMENT,
 *      'level` varchar(45) NOT NULL,
 *      `message` text NOT NULL,
 *      `timestamp` datetime NOT NULL,
 *      `meta` varchar(255),
 *      `hostname` varchar(255),
 *      PRIMARY KEY (`id`)
 *      );
 *
 *			The logger also contains methods for retrieving other loggers/logs:
 *				getLogger(name:String) -> Logger
 *				getLog(name:String, query:Object) -> Array
 *
 *		For more information, see the Winston docs: https://github.com/flatiron/winston#usage
 *	    AND
 *	    https://github.com/nvdnkpr/winston-mysql-transport
 */

/**
 *
 * @type {{levels: {info: number, warn: number, debug: number, error: number}, colors: {info: string, warn: string, debug: string, error: string}}}
 */
var config = {
    globalLevels: {
        info: 1,
        warn: 2,
        error: 3,
        debug: 4
    },
    databaseLevels: {
        info: 1,
        warn: 2,
        error: 3
    },
    colors: {
        info: 'green',
        warn: 'yellow',
        debug: 'blue',
        error: 'red'
    }
};

/**
 *
 * @type {exports}
 */
var winston = require( 'winston' ),     // Main logger
    Q       = require( 'q' ),           // Promise handler
    db      = require( 'mysql' ),       // Database module for query
    _       = require( 'lodash' ),
    loggers = {
        // All logged data will also be printed to the global log
        global: new winston.Logger({
            transports: [
                new( winston.transports.Console )( { colorize: 'true', timestamp: 'true' } )
            ],
                levels: config.globalLevels,
                colors: config.colors
        })
    },
    globalLog = loggers.global;

var transport = require( 'winston-mysql-transport' ).Mysql;

/**
 *
 * @param moduleName
 */
function getLog( moduleName ){
    return Q.resolve("{ 'data': '" + moduleName + " log data goes here' }");
}

/**
 *
 * @param moduleName
 */
function getLogger( moduleName ){
    return loggers[moduleName];
}

/**
 * @brief Exports a function that when called creates a new logger with the passed name
 *
 * Anything logged to the logger will be also be logged to the global logger
 *
 * @param moduleName
 * @returns {{info: info, warn: warn, error: error, debug: debug, getLogger: getLogger, getLog: getLog}}
 */
module.exports = function( moduleName ) {
    var logger = loggers[ moduleName ];

    if( !logger ) {
        logger = loggers[ moduleName ] = new winston.Logger({
            transports: [
                new winston.transports.Mysql( require( './config/database' ) )
            ],
            levels: config.databaseLevels
        });
    }

    return {

        info: function() {
            var args = _.toArray( arguments );
            args.unshift( moduleName + " - ");
            globalLog.info.apply( globalLog, args );
            return logger.info.apply( logger, args );
        },

        warn: function() {
            var args = _.toArray( arguments );
            args.unshift( moduleName + " - ");
            globalLog.warn.apply( globalLog, args );
            return logger.warn.apply(logger, args);
        },

        error: function() {
            var args = _.toArray( arguments );
            args.unshift( moduleName + " - ");
            globalLog.error.apply(globalLog, args);
            return logger.error.apply(logger, args);
        },

        debug: function() {
            var args = _.toArray( arguments );
            args.unshift( moduleName + " - ");
            return globalLog.debug.apply( globalLog, args );
        },

        getLogger: getLogger,
        getLog: getLog
    };
};