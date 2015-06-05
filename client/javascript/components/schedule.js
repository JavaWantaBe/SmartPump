var Reflux = require("reflux");
var React = require("react");
var request = require("superagent");
var _ = require("lodash");
var store = require("stores/schedule");
var actions = require("actions/schedule");
var timezoneOffset = (new Date()).getTimezoneOffset() * 60 * 1000;
var isAuthorized = require("utility/is-authorized");

var Schedule = React.createClass({
    mixins: [
        require("react-router").Navigation,
        Reflux.connect(store, "schedule"),
        Reflux.ListenerMixin
    ],

    statics: {
        willTransitionTo: function(transition, params, query, callback) {
            isAuthorized()
                .then(() => {
                    actions.fetch();
                    callback();
                })
                .catch(() => {
                    transition.redirect("login");
                    callback();
                });
        }
    },

    getInitialState: function() {
        return {
            saving: false
        };
    },

    componentDidMount: function() {
        var onFinishSaving = () => {
            var state = _.extend({}, this.state, {
                saving: false
            });
            this.setState(state);
        };

        this.listenTo(actions.save, () => {
            var state = _.extend({}, this.state, {
                saving: true
            });
            this.setState(state);
        });

        this.listenTo(actions.save.completed, () => {
            onFinishSaving();
            alert("Schedule saved successfully");
        });

        this.listenTo(actions.save.failed, (error) => {
            onFinishSaving();
            alert("Failed to save schedule: " + error);
        });
    },

    save: function() {
        actions.save(this.state.schedule.entries.map((entry) => entry.date));
    },

    renderEntry: function(entry, index) {
        var date = new Date(entry.date - timezoneOffset);
        var manualMode = this.state.schedule.manualMode;
        var [dateString, timeString] = date.toISOString().split("T");
        var now = (new Date()).getTime();
        var invalid = entry.date < now;
        timeString = timeString.split(".")[0];

        var entryStyle = {
            background: invalid ? "rgba(255,255,0,0.4)" : "#FFFFFF"
        };

        function onChange() {
            var localdate;
            
            localdate = new Date(dateString+"T"+timeString);
            actions.setDate(entry, new Date(localdate.getTime() + timezoneOffset));
        }

        return (
            <div key={entry.key} style={entryStyle}>
                <input
                    type="date"
                    value={dateString}
                    disabled={!manualMode}
                    onChange={(event) => {
                        dateString = event.target.value;
                        onChange();
                    }}/>
                <input
                    type="time" 
                    value={timeString}
                    disabled={!manualMode}
                    onChange={(event) => {
                        timeString = event.target.value;
                        onChange();
                    }}/>
                {manualMode ? 
                    <button onClick={actions.removeEntry.bind(null, entry)}>Remove</button> :
                    null
                }
                {manualMode && invalid ? 
                    <div style={{marginLeft: 15, display: "inline-block"}}>Date/time must be after the present</div>:
                    null
                }
            </div>
        );
    },

    render: function() {
        var manualMode = this.state.schedule.manualMode;
        return (
            <div className="schedule">
                {this.state.error ? 
                    <div>{this.state.error}</div> :
                    null
                }

                <input
                    type="checkbox"
                    checked={manualMode}
                    onChange={actions.toggleManualMode}/>
                <label onClick={actions.toggleManualMode}>Manual Mode</label>
                <div>
                    <button onClick={actions.startPumps} disabled={!this.state.schedule.manualMode}>Start Pumping Cycle</button>
                </div>
                <div className="schedule__entries">
                    {this.state.schedule.entries.map(this.renderEntry)}
                </div>
                <button disabled={!this.state.schedule.manualMode || (this.state.schedule.entries.length >= 20)} onClick={actions.addEntry}>Add</button>
                <button disabled={this.state.saving} onClick={this.save}>{this.state.saving ? "Saving..." : "Save"}</button>
            </div>
        );
    }
});

module.exports = Schedule;