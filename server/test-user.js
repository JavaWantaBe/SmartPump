"use strict";

var getUser = require("./queries/getUser"),
    addUser = require("./queries/addUser");

var testUserData = {
    username: "user",
    email: "test-user-email@gmail.com",
    password: "password"
};

getUser(testUserData.username, testUserData.password)
    .then(function(user) {
        if(!user) {
            return addUser(testUserData);
        }
    });