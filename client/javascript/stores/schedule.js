var Reflux = require("reflux");
var _ = require("lodash");
var actions = require("actions/schedule");
var post = require("utility/post");

module.exports = Reflux.createStore({
    listenables: actions,

    schedule: {
        entries: [],
        manualMode: false,
        error: null
    },

    getInitialState: function() {
        return this.schedule;
    },

    onFetchCompleted: function(schedule) {
        this.schedule = schedule;
        schedule.entries.forEach((entry) => entry.key = _.uniqueId("entry-"));
        this.trigger(this.schedule);
    },

    onFetchFailed: function(error) {
        console.log("FAILED:",error);
        this.schedule.error = error;
        this.trigger(this.schedule);
    },

    onAddEntry: function() {
        this.schedule.entries.push({
            key: _.uniqueId("entry-"),
            date: (new Date()).getTime()
        });
        this.trigger(this.schedule);
    },

    onSave: function() {
        var schedule = {
            schedule: {
                entries: _.pluck(this.schedule.entries, "date"),
                manualMode: this.schedule.manualMode
            }
        };

        post("/schedule", schedule)
            .then((res) => {
                actions.save.completed(JSON.parse(res.text));
            })
            .catch((res) => {
                actions.save.failed(res.text);
            });
    },

    onSaveCompleted: function(schedule) {
        this.onFetchCompleted(schedule);
    },

    onRemoveEntry: function(entryToRemove) {
        this.schedule.entries = this.schedule.entries.filter((entry) => entry !== entryToRemove);
        this.trigger(this.schedule);
    },

    onToggleManualMode: function() {
        this.schedule.manualMode = !this.schedule.manualMode;
        this.trigger(this.schedule);
    },

    onSetDate: function(entry, date) {
        entry.date = date.getTime();
        this.trigger(this.schedule);
    }
});