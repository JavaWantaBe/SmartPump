/**
 * Created by richard on 8/29/14.
 */

"use strict";

var Q = require("q");
var fs = require("fs");
var b = require("bonescript");
var exec = Q.nfbind(require("child_process").exec);

var _interfaceDir = __dirname + "/../interfaces";
var _scriptRead   = "awk -f " + __dirname + "/network-scripts/readInterfaces.awk " + _interfaceDir + " device=eth0";
var _scriptWrite  = "awk -f " + __dirname + "/network-scripts/changeInterface.awk " + _interfaceDir + " device=eth0";

var cachedSettings = null;

function toInt(n) {
    return parseInt(n); // parseInt takes a radix, so calling .map(parseInt) won't be base 10
}

function pluck(key) {
    return function(obj) {
        return obj[key];
    };
}


/*
    returns a promise that resolves into:
        {
            ip: [int, int, int, int],
            subnet: [int, int, int, int],
            gateway: [int, int, int, int]
        }
*/
function getSettings() {
    if(cachedSettings) {
        return Q.resolve(cachedSettings);
    }
    else {
        return exec(_scriptRead).then(function(result) {
            var addresses = result.toString().split(" ");
            var settings = {
                ip: addresses[0].split(".").map(toInt),
                subnet: addresses[1].split(".").map(toInt),
                gateway: addresses[2].split(".").map(toInt)
            };
            cachedSettings = settings;
            return settings;
        }).catch(function(err) {
            console.log(err.toString());
        });
    }
}

function setSettings(newSettings) {
    cachedSettings = newSettings;
    return writeSettings(newSettings);
}

function writeSettings(newSettings) {
    return set_ip(newSettings.ip)
        .then(set_sub.bind(null, newSettings.subnet))
        .then(set_gw.bind(null, newSettings.gateway));
}

/**
 * @brief Retrieves the IP address
 * @returns {Array}
 */
function get_ip() {
    return getSettings().then(pluck("ip"));
}

/**
 * @brief Retrieves subnet address
 * @returns {Array}
 */
function get_sub() {
    return getSettings().then(pluck("subnet"));
}

/**
 * @brief Retrieves the gateway address
 * @returns {Array}
 */
function get_gw() {
    return getSettings().then(pluck("gateway"));
}

/**
 * @brief Retrieves the DHCP mode
 * @returns {*}
 * @retval true - DHCP mode on
 * @retval false - DHCP mode off, static assignment
 */
function get_dhcp() {

    var exec = require('child_process').exec;
    var mode;
    return exec(_scriptRead,
        function(error, stdout, stderr){
            if(error !== null || stderr){
                console.log('exec error: ' + error);
                mode = null;
            } else {
                if(stdout == "dhcp"){
                    mode = true;
                } else {
                    mode = false;
                }
            }
        });

    return mode;
}

/**
 * @brief Sets the ip address
 * @param address
 */
function set_ip(address) {
    return exec(_scriptWrite + "address=" + address.join("."));
}

/**
 * @brief Sets the subnet address
 * @param address
 */
function set_sub(address) {
    return exec(_scriptWrite + "netmask=" + address.join("."));
}

/**
 * @brief Sets the gateway address
 * @param address
 */
function set_gw(address) {
    return exec(_scriptWrite + "gateway=" + address.join("."));
}

/**
 * @brief Sets either DHCP or static modes
 * @param dhcp_mode
 * @param settings
 */
function set_dhcp(dhcp_mode) {
    return exec(_scriptWrite + "mode=" + (dhcp_mode ? "dhcp" : "static"));
}

/**
 * @brief Restarts the network interface
 */
function restart_network() {

    var exec = require( 'child_process').exec;

    exec( "ifdown eth0 && ifup eth0",
        function (error, stdout, stderr) {
            if (error !== null) {
                console.log( 'exec error: ' + error );
            }
        } );
}


module.exports = {
    getSettings: getSettings,
    setSettings: setSettings,
    getIP: get_ip,
    getGW: get_gw,
    getSub: get_sub,
    getDHCP: get_dhcp,
    setIP: set_ip,
    setGW: set_gw,
    setSub: set_sub,
    setDHCP: set_dhcp,
    restartNetwork: restart_network
};