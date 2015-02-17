"use strict";

var gulp        = require("gulp"),                // Task runner
    gutil       = require("gulp-util"),
    Q           = require("q"),
    _           = require("lodash"),
    plumber     = require("gulp-plumber"),        // Handles gulp errors without stopping the watch task
    source      = require("vinyl-source-stream"), // Allows the use of text streams with gulp (needed for browserify)
    port        = 8888;                           // For test server

var bundler = _.once(function() {
    var Browserify = require("browserify"),
        watchify   = require("watchify");

    return watchify(Browserify(_.extend({
        paths: ["./node_modules", "./javascript"],
        debug: true
    }, watchify.args)))
    .transform(require("6to5ify"))
    .transform('brfs')
    .add("./javascript/app.js")
    .on('update', bundle)
    .on("time", function(time) {
        gutil.log("Finished building (" + time + " ms)");
    });
});

function bundle() {
    return bundler()
        .bundle()
        .pipe(source("app.js"))
        .pipe(gulp.dest("../server/public"));
}

// Compile javascript and jsx files
gulp.task("javascript", bundle);

// Compile scss files
gulp.task("styles", function() {
    var sass = require("gulp-ruby-sass");
    return gulp.src("styles/styles.scss")
        .pipe(plumber())
        .pipe(sass({style: "compressed", require: ["susy"]}))
        .pipe(gulp.dest("../server/public"));
});

// Copy source html file
gulp.task("html", function() {
    return gulp.src("index.html")
        .pipe(gulp.dest("../server/public"));
});

// Copy static assets
gulp.task("statics", function() {
    return gulp.src("statics/**/*")
        .pipe(gulp.dest("../server/public"));
});

// Build web version
gulp.task("build", ["javascript", "styles", "html", "statics"]);

// Watch source files for changes. Rebuild necessary files when changes are made
gulp.task("watch", ["build"], function() {
    gulp.watch("styles/**/*.scss", ["styles"]);
    gulp.watch("index.html", ["html"]);
});

gulp.task("default", ["watch"]);