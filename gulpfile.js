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
        paths: ["./node_modules", "./client/javascript"],
        debug: true
    }, watchify.args)))
    .transform(require("6to5ify"))
    .transform('brfs')
    .add("./client/javascript/app.js")
    .on('update', bundle)
    .on("time", function(time) {
        gutil.log("Finished building (" + time + " ms)");
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
    return sass("client/styles/styles.scss", {style: "compressed", require: ["susy"]})
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
            server.on("close", spawnServer);
            server.kill("SIGINT");
        }
        else {
            spawnServer();
        }
    }
}()));

// Build web version
gulp.task("build", ["javascript", "styles", "html", "statics"]);

// Watch source files for changes. Rebuild necessary files when changes are made
gulp.task("watch", ["build", "server"], function() {
    gulp.watch("client/styles/**/*.scss", ["styles"]);
    gulp.watch("client/index.html", ["html"]);
    gulp.watch(["server/**/*", "!server/public", "!server/public/**/*"], ["server"]);
});

gulp.task("default", ["watch"]);