"use strict";

var _ = require("lodash"),
	tideRetriever = require("../tide-retriever"),
	moment = require("moment");

describe("tide retriever", function() {
	before(function() {
		console.log("\nTesting tide-retriever.js");
	});

	describe("#get(from:moment, to:moment) -> Promise", function() {
		it("should retrieve and parse tide CSV data", function(done) {
			var timeFormat = "YYYY-MM-DD-HH:mm:ss",
				expectedCount = 27,
				from = moment("2013-03-06T00:00:00", timeFormat),
				to = moment("2013-03-12T23:59:00", timeFormat);

			tideRetriever.get(from, to).then(
				function(entries) { // resolve
					if(!_.isArray(entries) || entries.length !== expectedCount) {
						done("Invalid result");
					}
					else {
						done();
					}
				},
				
				function(err) { // reject
					done(err);
				}
			);
			
		});
	});
});
