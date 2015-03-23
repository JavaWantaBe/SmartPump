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


function get_ip() {

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
                    ip = settings[0].split( "." );
                }
            }
        } );

    return ip;
}

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

function get_dhcp() {

    var exec = require( 'child_process' ).exec;

    exec( _scriptRead,
        function( error, stdout, stderr ){
            if( error !== null || stderr ){
                console.log( 'exec error: ' + error );
            } else {
                if( stdout == "dhcp" ){
                    return true;
                } else {
                    return false;
                }
            }
        } );

}

function set_ip( address ) {

    var exec = require( 'child_process' ).exec;

    exec( _scriptRead,
        function( error, stdout, stderr ) {

            if( stderr || error !== null ){
                return null;
            } else if( stdout == "dhcp" ){

            } else {

                var settings = stdout.split( " " );
                settings[0] = address.join( "." );
                exec( _scriptWrite + " address=" + settings[0] + "network=" + settings[1] + "gateway=" + settings[2],
                    function( error, stdout, stderr ){
                        // Handle errors
                    } );
            }
        } );
}

function set_sub( address ) {
    var exec = require('child_process').exec;


}

function set_gw( address ) {
    var exec = require('child_process').exec;

}


function set_dhcp( dhcp_mode ) {

}

function restart_network() {

    var exec = require( 'child_process' ).exec;

    exec( "ifdown eth0 && ifup eth0",
        function (error, stdout, stderr) {

            console.log( 'stdout: ' + stdout );
            console.log( 'stderr: ' + stderr );

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