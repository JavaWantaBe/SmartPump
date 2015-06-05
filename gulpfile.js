"use strict";

var gulp = require("gulp"); // Task runner
var gutil = require("gulp-util");
var Q = require("q");
var _ = require("lodash");
var plumber = require("gulp-plumber"); // Handles gulp errors without stopping the watch task
var source = require("vinyl-source-stream"); // Allows the use of text streams with gulp (needed for browserify)

var bundler = _.once(function() {
    var Browserify = require("browserify"),
        watchify   = require("watchify");

    return watchify(Browserify(_.extend({
        paths: ["./node_modules", "./client/javascript"],
        debug: true
    }, watchify.args)))
    .transform(require("6to5ify"))
    .transform('brfs')
    .add("./client/javascript/app.js")
    .on("update", bundle)
    .on("time", function(time) {
        gutil.log("Finished building (" + time + " ms)");
    })
    .on("error", function(error) {
        console.log(error.toString());
    });
});

function bundle() {
    return bundler()
        .bundle()
        .pipe(source("app.js"))
        .pipe(gulp.dest("server/public"));
}

gulp.task("javascript", bundle);

//gulp.task("javascript", bundle);

// Compile scss files
gulp.task("styles", function() {
    var sass = require("gulp-ruby-sass");
    return gulp.src("client/styles/styles.scss")
        .pipe(plumber())
        .pipe(sass({style: "compressed", require: ["susy"]}))
        .pipe(gulp.dest("server/public"));
});

// Copy source html file
gulp.task("html", function() {
    return gulp.src("client/index.html")
        .pipe(gulp.dest("server/public"));
});

// Copy static assets
gulp.task("statics", function() {
    return gulp.src("client/statics/**/*")
        .pipe(gulp.dest("server/public"));
});

// Starts the server module. If it's already started,
// send a kill signal, and start it again once it ends
gulp.task("server", (function() { // IIFE
    var server;
    return function() {
        var spawn = require("child_process").spawn;

        function spawnServer() {
            server = spawn("node", [__dirname + "/server/index"], {stdio: "inherit"});
        }

        if(server) {
            server.kill("SIGINT");
        }

        spawnServer();
    }
}()));

// Build web version
gulp.task("build", ["javascript", "styles", "html", "statics"]);

// Watch source files for changes. Rebuild necessary files when changes are made
gulp.task("watch", ["build", "server"], function() {
    gulp.watch("client/styles/**/*.scss", ["styles"]);
    gulp.watch("client/index.html", ["html"]);
    gulp.watch(["server/**/*.js", "!server/public", "!server/public/**/*", "!server/config"], ["server"]);
});

gulp.task("default", ["watch"]);