/**
 * Created by richard on 8/29/14.
 */

"use strict";

var Q = require( 'q' ),
   fs = require( 'fs' ),
    b = require( 'bonescript' );

var _interfaceDir = "./config/interfaces",
    _scriptRead   = "awk -f " + __dirname + "/networkscripts/readInterfaces.awk " + _interfaceDir + " device=eth0",
    _scriptWrite  = "awk -f " + __dirname + "/networkscripts/changeInterface.awk " + _interfaceDir + " device=eth0";


/**
 * @brief Retrieves the IP address
 * @returns {Array}
 */
function get_ip() {

    var exec = require('child_process').exec,
        ip = new Array();

    exec( _scriptRead,
        function( error, stdout, stderr ){
            if( error !== null || stderr ){
                console.log( 'exec error: ' + error );
                ip = null;
            } else {
                if( stdout == "dhcp" ){
                    ip = "dhcp";
                } else {
                    var settings = stdout.split( " " );
                    ip = settings[0].split( "." );
                }
            }
        } );

    return ip;
}

/**
 * @brief Retrieves subnet address
 * @returns {Array}
 */
function get_sub() {

    var exec = require('child_process').exec,
        ip = new Array();

    exec( _scriptRead,
        function( error, stdout, stderr ){
            if( error !== null || stderr ){
                console.log( 'exec error: ' + error );
            } else {
                if( stdout == "dhcp" ){
                    ip = "dhcp";
                } else {
                    var settings = stdout.split( " " );
                    ip = settings[1].split( "." );
                }
            }
        } );

    return ip;
}

/**
 * @brief Retrieves the gateway address
 * @returns {Array}
 */
function get_gw() {

    var exec = require('child_process').exec,
        ip = new Array();

    exec( _scriptRead,
        function( error, stdout, stderr ){
            if( error !== null || stderr ){
                console.log( 'exec error: ' + error );
            } else {
                if( stdout == "dhcp" ){
                    ip = "dhcp";
                } else {
                    var settings = stdout.split( " " );
                    ip = settings[2].split( "." );
                }
            }
        } );

    return ip;
}

/**
 * @brief Retrieves the DHCP mode
 * @returns {*}
 * @retval true - DHCP mode on
 * @retval false - DHCP mode off, static assignment
 */
function get_dhcp() {

    var exec = require( 'child_process' ).exec;
    var mode;
    exec( _scriptRead,
        function( error, stdout, stderr ){
            if( error !== null || stderr ){
                console.log( 'exec error: ' + error );
                mode = null;
            } else {
                if( stdout == "dhcp" ){
                    mode = true;
                } else {
                    mode = false;
                }
            }
        } );

    return mode;
}

/**
 * @brief Sets the ip address
 * @param address
 */
function set_ip( address ) {
    var exec = require('child_process').exec;

    exec( _scriptWrite + "gateway=" + address.join( "." ),
        function ( error, stdout, stderr ) {
            if ( error !== null ) {
                console.log( 'exec error: ' + error );
            }
        } );
}

/**
 * @brief Sets the subnet address
 * @param address
 */
function set_sub( address ) {
    var exec = require('child_process').exec;

    exec( _scriptWrite + "netmask=" + address.join( "." ),
        function( error, stdout, stderr ) {
            if ( error !== null ) {
                console.log( 'exec error: ' + error );
            }
        } );
}

/**
 * @brief Sets the gateway address
 * @param address
 */
function set_gw( address ) {
    var exec = require('child_process').exec;

    exec( _scriptWrite + "gateway=" + address.join( "." ),
        function( error, stdout, stderr ) {
            if( error !== null ) {
                console.log( 'exec error: ' + error );
            }
        } );
}

/**
 * @brief Sets either DHCP or static modes
 * @param dhcp_mode
 * @param settings
 */
function set_dhcp( dhcp_mode, settings ) {
    var exec = require('child_process').exec;

    if( dhcp_mode == true ){
        exec( _scriptWrite + "mode=dhcp", function( error, stdout, stderr ){
            if( error !== null ) {
                console.log( 'exec error: ' + error );
            }
        } );
    } else {
        // TODO: Need to provide all address, netmask, gateway and write
    }
}

/**
 * @brief Restarts the network interface
 */
function restart_network() {

    var exec = require( 'child_process' ).exec;

    exec( "ifdown eth0 && ifup eth0",
        function (error, stdout, stderr) {
            if (error !== null) {
                console.log( 'exec error: ' + error );
            }
        } );
}


module.exports = {
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