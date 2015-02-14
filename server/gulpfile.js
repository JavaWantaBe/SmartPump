/*
	Run tasks from ./server directory

	Tasks:
	"gulp" 		 - Lints, tests, and watches server code
	"gulp lint"  - Lints javascript code with jshint
	"gulp test"  - Lints javascript and runs mocha tests
	"gulp watch" - Watches javascript files and runs "gulp lint" on save
*/

"use strict";

var gulp 			= require("gulp"),
	mocha			= require("gulp-mocha"),
	plumber 		= require("gulp-plumber"),
	runSequence 	= require("run-sequence"),
	jshint 			= require("gulp-jshint"),
	stylish 		= require("jshint-stylish");

var files = {
	js: ["./**/*.js", "!./public/**/*", "!./test/**/*"],
	tests: "./test/**/*.js"
};

gulp.task("lint", function() {
	return gulp.src(files.js)
		.pipe(jshint())
		.pipe(jshint.reporter(stylish));
});

gulp.task("test", ["lint"], function() {
	return gulp.src(files.tests)
		.pipe(mocha());
});

gulp.task("watch", function() {
	gulp.watch(files.js, ["lint"]);
});

gulp.task("default", function(callback) {
	runSequence("test", "watch", callback);
});