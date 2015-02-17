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
        this.state.schedule.manualMode = !this.state.schedule.manualMode;
        this.setState(this.state);
    },

    startPumps: function() {
        request.get("/start-pumps", function(response) {
            if(response.status === 200) {
                alert("Pumps started");
            }
        });
    },

    renderEntry: function(entry) {
        return (
            <div key={entry.key}>
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
                    [<br/>, <button onClick={this.startPumps}>Start Pumping Cycle</button>] :
                    null
                }
                <div className="schedule__entries">
                    {this.state.schedule.entries.map(this.renderEntry)}
                </div>
                <button onClick={this.saveSchedule}>Save</button>
            </div>
        );
    }
});

module.exports = Schedule;