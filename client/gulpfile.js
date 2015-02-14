"use strict"

var gulp 			= require("gulp"),
	mocha			= require("gulp-mocha"),
	runSequence 	= require("run-sequence"), // helps run tasks in order
	plumber			= require("gulp-plumber"), // keeps thrown errors from killing a task
	concat 			= require("gulp-concat"),
	uglify 			= require("gulp-uglify"),
	jshint			= require("gulp-jshint"),
	stylish 		= require("jshint-stylish"),
	sass 			= require("gulp-ruby-sass"),
	clean 			= require("gulp-clean"),
	browserify 		= require("gulp-browserify"),
	dest			= gulp.dest.bind(gulp),
	S 				= require("string"),
	_ 				= require("lodash");

var debug = true;

var files = {
	jsEntry:   "js/app.js",    // Entry point for browserify
	scssEntry: "css/app.scss", // Entry point for sass
	html:      "index.html",
	js:        ["js/**/*.js", "js/**/*.json"],
	scss:      "css/**/*.scss",
	assets:    "assets/**/*",
	toClean:   "../server/public",
	tests:     "./test/**/*.js"
};

var outFiles = {
	js:        "../server/public/assets",
	css:       "../server/public/assets",
	html:      "../server/public",
	assets:    "../server/public/assets"
};

gulp.task("js", ["lint"], function() {
	var stream = gulp.src(files.jsEntry)
		.pipe(plumber())
		.pipe(browserify());
	
	if(!debug) {
		stream = stream.pipe(uglify());
	}

	return stream.pipe(dest(outFiles.js));
});

gulp.task("lint", function() {
	return gulp.src("js/**/*.js")
		.pipe(jshint())
		.pipe(jshint.reporter(stylish));
});

gulp.task("html", function() {
	return gulp.src(files.html)
		.pipe(dest(outFiles.html))
});

gulp.task("scss", function() {
	return gulp.src(files.scssEntry)
		.pipe(plumber())
		.pipe(sass())
		.pipe(dest(outFiles.css));
});

gulp.task("assets", function() {
	return gulp.src(files.assets)
		.pipe(dest(outFiles.assets));
});

gulp.task("clean", function() {
	return gulp.src(files.toClean, {read: false})
		.pipe(clean({force: true}));
});

gulp.task("watch", function() {
	gulp.watch(files.html, ["html"]);
	gulp.watch(files.js, ["js"]);
	gulp.watch(files.scss, ["scss"]);
	gulp.watch(files.templates, ["templates"]);
	
});

gulp.task("test", function() {
	return gulp.src(files.tests)
		.pipe(plumber())
		.pipe(mocha());
});

gulp.task("build", ["js", "scss", "html", "assets"]);

gulp.task("default", function(callback) {
	runSequence("clean", 
				"build",
				"watch",
				callback);
});