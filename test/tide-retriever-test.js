var tideRetriever = require("../server/tide-retriever");
var assert = require("assert");
var oneMonth = 2592000000; // milliseconds in a month

describe("tide-retriever", function() {
	describe("#fetchTideEntries", function() {
		it("should be able to retrieve tide times between two dates", function(done) {
			var now = Date.now();
			var startTime = new Date(now);
			var endTime = new Date(now + oneMonth);
			tideRetriever.fetchTideEntries(startTime, endTime).then(function(entries) {
				var error = null;

				if(!entries) {
					error = "Entries are falsy";
				} else {
					entries.forEach(function(entry) {
						if(!entry) {
							error = "Entries contain null value";
						} else if(!entry instanceof Date) {
							error = "Entries contain non-date value";
						} else if(entry.getTime() < now) {
							error = "Entries contain date in the past";
						}
					});
				}

				if(error) {
					done(error);
				} else {
					done();
				}
			}).catch(function(error) {
				done(error);
			})
		});
	});
});
