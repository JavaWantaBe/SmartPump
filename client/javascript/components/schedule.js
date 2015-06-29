var React = require("react");
var _ = require("lodash");
var hasher = require("hasher");
var TideEntry = require("./tide-entry");
var superagent = require("superagent");

class Schedule extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dates: [],
            loaded: false
        };
    }

    load() {
        superagent.get("/schedule")
            .set('Accept', 'application/json')
            .end((error, res) => {
                if(error) {
                    this.setState({loaded: true, error: error});
                } else {
                    if(res.status === 401) {
                        hasher.setHash("login");
                    } else {
                        const dates = res.body.schedule.dates.map((dateStr) => new Date(dateStr));
                        this.setState({
                            loaded: true,
                            error: null,
                            dates: dates,
                            originalDates: dates,
                            manualMode: res.body.schedule.manualMode
                        });
                    }
                }
            });
    }

    save() {
        superagent.post("/schedule")
            .set("Accept", "application/json")
            .send({schedule: {
                manualMode: this.state.manualMode,
                dates: this.state.dates.map((date) => date.toISOString())
            }})
            .end((error, res) => {
                if(error) {
                    alert("Failed to save: " + error.message);
                } else {
                    alert("Saved successfully");
                }
            });
    }

    componentDidMount() {
        this.load();
    }

    extendState(...sources) {
        return this.setState(_.extend({}, this.state, ...sources));
    }

    toggleManualMode() {
        const {manualMode, dates} = this.state;

        this.extendState({
            manualMode: !manualMode,
            dates: manualMode ? this.state.originalDates : dates
        });
    }

    updateDate(dateIndex, newDate) {
        this.extendState({
            dates: this.state.dates.map((date, index) => {
                if(index === dateIndex) {
                    return newDate;
                } else {
                    return date;
                }
            })
        });
    }

    removeDate(index) {
        this.extendState({
            dates: this.state.dates.filter((date, i) => i !== index)
        });
    }

    areDatesValid() {
        const now = new Date();
        return this.state.dates.every((date) => date > now);
    }

    addDate() {
        this.extendState({
            dates: this.state.dates.concat(new Date())
        });
    }

    render() {
        const {loaded, manualMode, dates} = this.state;
        const datesAreValid = this.areDatesValid();
        if(!loaded) return null;

        return (
            <div>
                {datesAreValid || !manualMode ? null : 
                    <p style={{fontWeight: "bold", color: "rgb(125, 0, 0)"}}>All dates must be after the current date</p>
                }
                <p>Manual Mode</p>
                <input type="checkbox" checked={manualMode} onChange={this.toggleManualMode.bind(this)}/>
                <br/>
                <div style={{maxHeight: 500, overflow: "auto", margin: "10px 0 10px 0", border: "1px solid #ddd"}}>
                    {dates.map((date, index) =>
                        <TideEntry
                            key={index}
                            date={date}
                            readOnly={!manualMode}
                            onChange={this.updateDate.bind(this, index)}
                            onRemoveClick={this.removeDate.bind(this, index)}/>
                    )}
                    <button onClick={this.addDate.bind(this)}>Add</button>
                </div>
                <button onClick={this.save.bind(this)} disabled={!datesAreValid} style={{marginBottom: 10}}>Save</button>
            </div>
        );
    }
}

module.exports = Schedule;
