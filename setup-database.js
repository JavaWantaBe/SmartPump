"use strict";

/*
    Sets up the mysql database required by the server.
*/

var exec         = require("child_process").exec,
    username     = "root",
    password     = "foobar123",
    sqlStatement = "SOURCE "+__dirname+"/docs/database.sql;",
    command      = ["mysql", " -u ", username, " -p", password, " -e", " '", sqlStatement, "'"].join("");

console.log("Executing: " + command);
exec(command, function(error, stdout, stderr) {
    console.log(stdout);
    if(stderr.length || error) {
        if(stderr.slice(6, 10) === "1045") {
            console.log("Invalid MySQL username or password.\nMake sure the MySQL root password is '"+password+"'");
        }
        else {
            console.log("stderr: " + stderr);
        }
    }
    else {
        console.log("MySQL database configured successfully");
    }
});