"use strict";

var _ = require("lodash"),
	Promise = require("q"),
	db = require("../database");


describe("database", function() {
	before(function() {
		console.log("\nTesting database.js");
	});

	describe("#connect(options:Object) -> Promise", function() {
		it("should be able to connect", function(done) {
			db.connect().then(
				function() {
					done();
					return db.disconnect();
				},
				function(err) {
					done(err);
				}
			);
		});
	});

	describe("#disconnect() -> Promise", function() {
		it("should be able to disconnect", function(done) {
			var promise = db.isConnected() ? Promise.resolve() : db.connect();

			promise
			.then(
				function() {
					return db.disconnect();
				}
			)
			.then(
				function() {
					done();
				},
				function(err) {
					done(err);
				}
			);

		});
	});

	describe("#query(query:String, context:Object) -> Promise", function() {
		it("should be able to query data from the database", function(done) {
			var promise = Promise.resolve(),
				query = "select * from test.testTable where id=99",
				expected = {
					id: 99,
					data: "test data"
				};

			if(!db.isConnected()) {
				promise = db.connect();
			}

			promise
			.then(
				function() {
					return db.query(query);
				}
			)
			.then(
				function(result) {
					result = result[0];
					if(result && result.id === expected.id && result.data === expected.data) {
						done();
					}
					else {
						done("Invalid result recieved from mysql server");
					}
					return db.disconnect();
				}
			)
			.then(null,
				function(err) {
					done(err);
				}
			);
		});

		it("should be able to insert data into the database", function(done) {
			var promise = Promise.resolve(),
				insertQueryString = "INSERT INTO test.testTable SET ?",
				selectQueryString = "SELECT * FROM test.testTable WHERE id<=10",
				deleteQueryString = "DELETE FROM test.testTable WHERE id<=10",
				data = _.map([1,2,3,4,5,6,7,8,9,10], function(n) {
					return {id: n, data: "data for entry " + n};
				});

			if(!db.isConnected()) {
				promise = db.connect();
			}

			promise
			.then( // insert
				function() {
					var promises = _.map(data, function(entry) {
						return db.query(insertQueryString, entry);
					});

					return Promise.all(promises);
				}
			)
			.then( // select
				function() {
					return db.query(selectQueryString);
				}
			)
			.then( // validate and delete
				function(result) {
					var passed = true;

					_.each(result, function(entry, index) {
						var expected = data[index];
						if(expected.id !== entry.id || expected.data !== entry.data) {
							passed = false;
						}
					});

					if(passed) {
						done();
					}
					else {
						done("Returned entries differ from original data");
					}

					return db.query(deleteQueryString);
				}
			)
			.then(
				function() { // disconnect
					return db.disconnect();
				}
			)

		});
	});
});




