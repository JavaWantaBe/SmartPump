// Tests for server/get.js

"use strict";

var get = require("../get"),
	workingURL = "http://httpbin.org/get",
	notWorkingURL = "255.255.255.255";

describe("get", function() {
	before(function() {
		console.log("\nTesting get.js");
	});

	describe("#get(URL) -> Promise", function() {
		it("should be able to GET a file", function(done) {
			get(workingURL).then(
				function(data) {
					done();
				},
				function(err) {
					done("the promise was rejected: " + err);
				}
			);
		});

		it("should reject the promise when the URL is invalid", function(done) {
			get(notWorkingURL).then(
				function(data) {
					done("the promise was resolved");
				},
				function(err) {
					done();
				}
			);
		});
	});
});
