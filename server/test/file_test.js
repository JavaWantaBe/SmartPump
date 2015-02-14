"use strict";

var File = require("../file"),
	_ 	 = require("lodash");




describe("File class", function() {
	var writeTestFile,
		removeTestFile;

	before(function(done) {
		console.log("\nTesting file.js");
		writeTestFile = new File(__dirname + "/write_test.txt");
		removeTestFile = new File(__dirname + "/remove_test.txt");
		removeTestFile.write("foobar").then(function() {
			done();
		});
	});

	after(function() {
		writeTestFile.remove()
		.then(null, function(err) {
			console.warn("Failed to remove test file");
		});
	});

	describe("#read(options:Object) -> Promise", function() {
		it("should be able to read file_test_data.json", function(done) {
			var testFileName = __dirname + "/file_test_data.json",
				testFile = new File(testFileName),
				expected = '{"foo":"bar"}';

			testFile.read()
			.then(
				function(data) {
					if(data === expected) {
						done();
					}
					else {
						done("Data does not match expected data");
					}
				},
				function(err) {
					done(err);
				}
			);
		});
	});

	describe("#write(data:String, options:Object) -> Promise", function() {
		it("should be able to write write_test.txt", function(done) {
			var expected = "hello world!";

			writeTestFile.write(expected)
				.then(
					function() {
						return writeTestFile.read();
					},
					function(err) {
						done(err);
					}
				)
				.then(
					function(data) {
						if(data !== expected) {
							done("Mismatched data");
						}
						else {
							done();
						}
					},
					function(err) {
						done(err);
					}
				)
		});
	});

	describe("#remove() -> Promise", function() {
		it("should be able to remove a file", function(done) {
			removeTestFile.remove()
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
});
