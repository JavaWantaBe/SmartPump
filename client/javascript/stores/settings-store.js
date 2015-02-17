"use strict";

var _ = require("lodash");

var SettingsStore = _.extend({}, require("utility/emitter"), {
    path: "/settings",
    loaded: false,
    settings: null,

    setData: function(data) {
        this.loaded = true;
        this.settings = data.settings;
        this.fire("update");
    },

    getState: function() {
        return {
            settings: this.settings
        };
    }
});

module.exports = SettingsStore;