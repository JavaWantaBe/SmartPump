"use strict";

var Q = require("q"),
	$ = require("jquery");

var debug = true,
	log = debug ? console.log.bind(console) : function() {};

// Proper promise versions of jquery's ajax methods
function jqReq(method) {
	return function(path, data) {
		var deferred = Q.defer();
		log(method.toUpperCase(),path,data);
		$[method](path, data).done(deferred.resolve).fail(deferred.reject);
		deferred.promise.then(function(data) {
			log("RESPONSE",path,data);
			return data;
		});
		return deferred.promise;
	};
}

module.exports = {
	get: jqReq("get"),
	post: jqReq("post")
};