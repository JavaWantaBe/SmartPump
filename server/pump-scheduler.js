"use strict";

/*
    This module's purpose is to manage the tide entries and leverage the tide-retriever for keeping tide entries up-to-date
*/

var logger          = require("./logger")("pump-scheduler"),
    tideRetriever   = require("./tide-retriever"),
    _               = require("lodash"),
    moment          = require("moment"),
    Q               = require("q"),
    db              = require("./database"),
    schedule        = require("node-schedule"), // https://www.npmjs.org/package/node-schedule
    pump            = require("./pumps"),
    b               = require("bonescript"),
    status          = require("./global-status.js" ),
    scheduledTask   = null;


/**
 * @brief Sets the alarm time for when the next cycle will start.
 *
 * Gets next tide time from database.  Sets the task of running a pumping cycle to that time.  Once the
 * cycle has ran it sets the scheduler to the next time in the database.
 *
 * @returns {*}
 */
function setNextAlarm() {
    // TODO: Alarm needs to be in local time

    var QUERY = "SELECT CONVERT_TZ( getNextTide(), 'GMT', @@global.time_zone ) AS TIDE",
        deffered = Q.defer();

    db.query( QUERY ).then( function( result ){

        var time = moment( result[0].TIDE );

        if(!result[0].TIDE){ // TODO: This could be done better by checking the time object instead
            logger.debug("Invalid tide returned from database");
            deffered.resolve();
        } else if(!time.isValid()){
            deffered.reject( "Invalid time" );
        } else {

            var date = new Date( time );

            scheduledTask = schedule.scheduleJob( date, function(){
                logger.debug("Starting Scheduled Event");

                if( status.onBeagleBone() ){
                    logger.debug( "Found beaglebone, starting pumps" );
                    return pump.start().finally( setNextAlarm() );
                } else {
                    logger.debug( "Not a beaglebone platform, not setting pump cycle" );
                    setNextAlarm();
                }
            }); // End of scheduled function to run at next tide

            logger.info( "Next tide scheduled at: " + time.format( "MMM Do HH:mm" ) );

            deffered.resolve();
        }
    }, function( err ){
        logger.error( "Failed to retrieve next tide - " + err );
        deffered.reject();
    });

    return deffered.promise;
}

/**
 *
 * @returns {*}
 */
function databaseAge(){
    var deffered = Q.defer(),
        QUERY = "SELECT getLastDownload() AS DOWNLOAD", age = moment();

    db.query( QUERY).then( function( result ){
            var lastDownload = result[0].DOWNLOAD;
            age = ( lastDownload === null ) ? 100 : age.diff( moment( lastDownload ), 'days' );
            deffered.resolve( age );
        },
        function( err ){
            logger.error( "Cannot retrieve data date - " + err );
            deffered.reject( err );
        }
    );

    return deffered.promise;
}

/**
 *
 */
function requestData(){
    // TODO: Time requested needs to be in GMT time.
    var deffered = Q.defer(),
        from = moment.utc(), // now
        too = moment().add( "months", 1 );

    logger.info( "Requesting raw data from remote server" );

    tideRetriever.get( from, too ).then(
        function( results ) {
            return setEntries( results );
        },
        function(err) {
            deffered.reject( err );
        }
    ).then( function( results ){
            deffered.resolve( results );
        }, function( err ){
            deffered.reject( err );
        });

    from.local();

    return deffered.promise;
}

/**
 * @brief Initializes the scheduler
 *
 * Checks to see if the data is more than 1 day old.  If it is, then a new request is made to download new data.
 *
 * @returns {*}
 */
function init(){
    return databaseAge().then( function( result ) {
        return ( result > 0 ) ? requestData() : true;
    }).then( function( result ){
        if( result === true ){
            logger.debug( "Database is up to date and doesn't need updating" );
        } else {
            logger.debug( "Database was updated" );
        }
        return setNextAlarm();
    }, function( err ){
            logger.debug( "Error " + err );
    });
}

/**
 * @brief returns a promise that resolves once all entries have been inserted into the database
 * @param entries
 * @returns {*}
 */
function storeEntries(entries){
    return db.query("DELETE FROM tide")
        .then(function() {
            return Q.all(_.map(entries, function(entry) {
                return entry.insert(db);
            }));
        });
}

/**
 *
 * @returns {*}
 */
function getEntries(){
    var QUERY = "SELECT tide_time FROM tide WHERE tide_time > NOW() ORDER BY tide_time";

    return db.query(QUERY)
        .then(function(rows){
            return _.toArray(rows).map(function(entry) {
                return entry.tide_time;
            });
        })
        .then(function(times) {
            return times;
        });

}

/**
 *
 * @param _entries
 * @returns {*}
 */
function setEntries( entries ){
    return storeEntries(entries);
}

/**
 *
 */
function cancelNextCycle(){
    if(scheduledTask){
        scheduledTask.cancelJob();
    }
}

module.exports = {
    init: init,
    getEntries: getEntries,
    setEntries: setEntries,
    cancelNextCycle: cancelNextCycle
};