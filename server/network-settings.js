/**
 * Created by richard on 8/29/14.
 */

var Q = require( 'q' ),
   fs = require( 'fs' ),
    b = require( 'bonescript' );

var _interfaceDir = './config/interfaces';
var ipAddress = new Array();
var ipMask    = new Array();
var ipGateway = new Array();

/**
 *
 * @returns {null}
 */
function read_settings()
{
    var onBoard = false;

    b.getPlatform( function( x ){
        if( x.serialNumber ){
            onBoard = true;
        }
    } );

    if( onBoard ){
        var fileData = fs.readFileSync( NET_FILE, 'utf8' );

        fileData = fileData.slice( fileData.search("iface eth0") );
        fileData = fileData.slice( 0, fileData.search( "\n\n" ) );

        console.log( "Data: " + fileData );
    } else {
        return null;
    }
}

function get_ip()
{
    var exec = require('child_process').exec,
        child;

    child = exec( 'ifconfig eth0', function( error, stdout, stdin ){
        if( stdout !== '' ){
            var str = stdout.toString(), lines = str.split( "\n" );
            for( var i = 0; i < lines.length; i++ ){
                console.log( lines[i] );
            }
        }
    } );

    child.stdin.end();

    /*
     var ifaces = os.networkInterfaces();

     for( var dev in ifaces.eth0 ){
     if( ifaces.eth0[dev].family == 'IPv4' ){
     return ifaces.eth0[dev].address;
     }
     }
     */
}

function get_dhcp() {

}

function get_sub_ip() {

}

function get_mode() {

}

function set_ip( address ) {
    var exec = require('child_process').exec,
        child;
    child = exec( 'awk -f ./networkscripts/changeInterface.awk ' + _interfaceDir + ' device=eth0 address=' + address );
}

function set_dhcp( address ) {

}

function set_sub_ip( address ) {

}

function set_mode( mode ) {

}

function restart_network() {
    execSync( "ifdwn eth0" );

    execSync( "ifup eth0" );
}