var React   = require("react"),
    request = require("superagent");

var Schedule = React.createClass({
    mixins: [
        require("react-router").Navigation,
        require("mixins/store-listener")(require("stores/schedule-store"))
    ],

    saveSchedule: function() {
        this.save({
            schedule: {
                manualMode: this.state.schedule.manualMode,
                entries: this.state.schedule.entries.map((entry) => 
                    entry.date + " " + entry.time
                )
            }
        });
    },

    toggleManualMode: function() {
        if(this.state.schedule.manualMode) {
            this.setState(this.getInitialState());
        }
        else {
            this.state.schedule.manualMode = !this.state.schedule.manualMode;
            this.setState(this.state);
        }
    },

    startPumps: function() {
        if(window.confirm("Are you sure you want to start the pumps?")) {
            request.get("/start-pumps", function(response) {
                if(response.status === 200) {
                    alert("Pumps started");
                }
            });
        }
    },

    removeEntry: function(entryToRemove) {
        this.state.schedule.entries = this.state.schedule.entries.filter(function(entry) {
            return entry !== entryToRemove;
        });
        this.setState(this.state);
    },

    renderEntry: function(entry) {
        return (
            <div key={entry.key} className="schedule__entry">
                <input
                    type="date"
                    value={entry.date}
                    disabled={!this.state.schedule.manualMode}
                    onChange={(event) => {
                        entry.date = event.target.value;
                        this.setState(this.state);
                    }}/>
                <input
                    type="time" 
                    value={entry.time}
                    disabled={!this.state.schedule.manualMode}
                    onChange={(event) => {
                        entry.time = event.target.value
                        this.setState(this.state);
                    }}/>
                {this.state.schedule.manualMode ?
                    <button onClick={this.removeEntry.bind(this, entry)}>Remove</button> :
                    null
                }
            </div>
        );
    },

    render: function() {
        var manualMode = this.state.schedule.manualMode;
        return (
            <div className="schedule">
                <input
                    type="checkbox"
                    checked={manualMode}
                    onChange={this.toggleManualMode}/>
                <label>Manual Mode</label>
                {manualMode ? 
                    <div>
                        <br/>
                        <button onClick={this.startPumps}>Start Pumping Cycle</button>
                    </div> :
                    null
                }
                <div className="schedule__entries">
                    {this.state.schedule.entries.map(this.renderEntry)}
                </div>
                {manualMode ? 
                    <button onClick={this.saveSchedule}>Save</button> :
                    null
                }
            </div>
        );
    }
});

module.exports = Schedule;