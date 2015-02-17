"use strict";

var _ = require("lodash");

var ScheduleStore = _.extend({}, require("utility/emitter"), {
    path: "/schedule",
    loaded: false,
    schedule: {
        manualMode: true,
        entries: []
    },

    setData: function(data) {
        this.loaded = true;
        this.schedule = data.schedule;
        this.schedule.entries = this.schedule.entries.map((entry) => {
            entry = entry.split(" ");
            return {
                key: _.uniqueId("schedule-entry-"),
                date: entry[0],
                time: entry[1]
            };
        });
        this.fire("update");
    },

    getState: function() {
        return {
            schedule: this.schedule
        };
    }
});

module.exports = ScheduleStore;