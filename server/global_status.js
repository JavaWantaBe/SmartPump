/**
 * Created by richard on 6/7/15.
 */
"use strict";

var b = require( 'bonescript' );

var _onBeagleBoard = false;


function printBoard( values ){
    if( values.version ){
        _onBeagleBoard = true;
    }
}


module.exports = {
    statusInit : function( ){
        b.getPlatform( printBoard );
    },
    onBeagleBone: function(){
        return _onBeagleBoard;
    }
};
