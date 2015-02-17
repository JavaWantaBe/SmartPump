"use strict";

var _ = require("lodash");

var LogStore = _.extend({}, require("utility/emitter"), {
    setLogs: function(logs) {

    }
});

module.exports = LogStore;