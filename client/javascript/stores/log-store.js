"use strict";

var _ = require("lodash");

var LogStore = _.extend({}, require("utility/emitter"), {
    path: "/logs",
    loaded: false,
    logs: [],

    setData: function(data) {
        this.loaded = true;
        this.logs = data.logs;
        this.logs.forEach(function(log) { // Add a key for React
            log.key = _.uniqueId("log-");
        });
        this.fire("update");
    },

    getState: function() {
        return {
            logs: this.logs
        };
    }
});

module.exports = LogStore;