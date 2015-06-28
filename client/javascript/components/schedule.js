var React = require("react");
var _ = require("lodash");
var hasher = require("hasher");
var TideEntry = require("./tide-entry");
var superagent = require("superagent");

class Schedule extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
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
                    console.log(res.status);
                    if(res.status === 401) {
                        console.log("Not authenticated");
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
        console.log("Saving");
        superagent.post("/schedule")
            .set("Accept", "application/json")
            .send({schedule: {
                manualMode: this.state.manualMode,
                dates: this.state.dates
            }})
            .end((error, res) => {
                if(error) {
                    console.log("Failed: " + error);
                } else {
                    console.log("Success:", res.body);
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
        console.log(newDate, typeof newDate);
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

    render() {
        const {loaded, manualMode, dates} = this.state;
        if(!loaded) return null;

        return (
            <div>
                <p>Manual Mode</p>
                <input type="checkbox" checked={manualMode} onChange={this.toggleManualMode.bind(this)}/>

                <button onClick={this.save.bind(this)}>Save</button>
                {dates.map((date, index) =>
                    <TideEntry key={index} date={date} readOnly={!manualMode} onChange={this.updateDate.bind(this, index)}/>
                )}
            </div>
        );
    }
}

module.exports = Schedule;
