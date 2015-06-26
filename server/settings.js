"use strict";

/**
 * @file settings.js
 *
 * @brief Used to store and retreive settings for pins and other user modifiable system variables
 *
 *
 * Created by richard on 6/21/15.
 */

var _ = require("lodash" ),
    fs = require("fs" ),
    timeoutconfig = __dirname + "/config/pumpsettings",
    pinconfig     = __dirname + "/config/pinconfig",
    emailconfig   = __dirname + "/config/mailer";

var timeoutSettings = require(timeoutconfig);
var pinSettings = require(pinconfig);
var emailSettings = require(emailconfig);


/**
 * @brief Returns timeout settings
 *
 * @returns {*}
 */
function getTimingSettings() {
    return timeoutSettings;
}

/**
 * @brief Sets timing settings
 *
 * @param newSettings
 */
function setTimingSettings(newSettings) {
    newSettings = _.extend({}, timeoutSettings, newSettings); // this way any missing arguments are filled in by the old settings
    timeoutSettings = newSettings;
    fs.writeFileSync(configFileName+".json", JSON.stringify(newSettings, null, 4));
}

/**
 * @brief Returns pin settings
 *
 * @returns {*}
 */
function getPinSettings() {
    return pinSettings;
}

/**
 * @brief Sets pin settings
 *
 * @param newSettings
 */
function setPinSettings(newSettings) {

}

/**
 * @brief Returns email settings
 *
 * @returns {*}
 */
function getEmailSettings() {
    return emailSettings;
}

/**
 * @brief Sets email settings
 *
 * @param newSettings
 */
function setEmailSettings(newSettings) {

}

module.exports = {
    getTimingSettings: getTimingSettings,
    setTimingSettings: setTimingSettings,
    getPinSettings: getPinSettings,
    setPinSettings: setPinSettings,
    getEmailSettings: getEmailSettings,
    setEmailSettings: setEmailSettings
};
