"use strict";

var gulp = require("gulp"),                // Task runner
    gutil = require("gulp-util"),
    Q = require("q"),
    _ = require("lodash"),
    plumber = require("gulp-plumber"),        // Handles gulp errors without stopping the watch task
    source = require("vinyl-source-stream"), // Allows the use of text streams with gulp (needed for browserify)
    port = 8888;                           // For test server

var bundler = _.once(function() {
    var Browserify = require("browserify");

    return Browserify({
        paths: ["./node_modules", "./client/javascript"],
        debug: true
    })
    .transform(require("babelify"))
    .transform('brfs')
    .add("./client/javascript/app.js")
    .on("error", function(error) {
        console.log("Bundler error: " + error);
    });
});

gulp.task("javascript", function() {
    return bundler()
        .bundle()
        .pipe(source("app.js"))
        .pipe(gulp.dest("public"));
});

// Compile scss files
gulp.task("styles", function() {
    var sass = require("gulp-ruby-sass");
    return sass("client/styles/styles.scss", {style: "compressed"})
        .pipe(gulp.dest("public"));
});

// Copy source html file
gulp.task("html", function() {
    return gulp.src("client/index.html")
        .pipe(gulp.dest("public"));
});

// Copy static assets
gulp.task("statics", function() {
    return gulp.src("client/statics/**/*")
        .pipe(gulp.dest("public"));
});

// Build web version
gulp.task("build", ["javascript", "styles", "html", "statics"]);

// Watch source files for changes. Rebuild necessary files when changes are made
gulp.task("watch", ["build"], function() {
    gulp.watch("client/styles/**/*.scss", ["styles"]);
    gulp.watch("client/index.html", ["html"]);
    gulp.watch(["client/javascript/**/*.js", "client/javascript/**/*.json"], ["javascript"]);
});

gulp.task("default", ["watch"]);
