"use strict";

window.addEventListener('load', function() {
    require("actions/fetch-logs")();
    require("router");
}, false)