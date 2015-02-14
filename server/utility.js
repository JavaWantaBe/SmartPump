"use strict";

var moment = require("moment");


// Converts a Moment instance to a unix timestamp
function momentToUnix(momentInst) {
	return momentInst.valueOf();
}

// Converts a unix timestamp to a Moment instance
function unixToMoment(timestamp) {
	return moment(timestamp);
}

// 'arguments' variable isn't actually an array
// this method converts 'arguments' to an actual array, so we can use the handy Array.prototype methods on our arguments array
function argsToArray(args) {
	return Array.prototype.slice.call(args);
}

var utility = {
	argsToArray: argsToArray,
	momentToUnix: momentToUnix,
	unixToMoment: unixToMoment
};

module.exports = utility;