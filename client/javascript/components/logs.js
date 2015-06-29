const React = require("react");
const _ = require("lodash");
const superagent = require("superagent");
const hasher = require("hasher");
const DateTimePicker = require("./date-time-picker");

var filters = {
    all: null,

    info(entry) {
        return entry.level === "info";
    },

    warning(entry) {
        return entry.level === "warning";
    },

    error(entry) {
        return entry.level === "error";
    }
};

function reverse(arr) {
    return arr.reduceRight(function(result, value) {
        result.push(value);
        return result;
    }, []);
}

class Logs extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        loaded: false,
        logs: [],
        filter: filters.all,
        fromDate: new Date(),
        tooDate: new Date()
      };
    }

    updateFromDate(date) {
      this.extendState({fromDate: date});
    }

    updateTooDate(date) {
      this.extendState({tooDate: date});
    }

    requestLogs() {
      superagent.get("/logs")
        .set("Accept", "application/json")
        .end((error, res) => {
          if(error) {
            this.extendState({error: error});
          } else {
            if(res.status === 401) {
                hasher.setHash("login");
            } else {
              const oneMonthAgo = new Date(Date.now() - (1000 * 60 * 60 * 24 * 30));
              const logs = res.body.logs.map((log) => {
                log.date = new Date(log.timestamp);
                return log;
              }).sort((a, b) => {
                return a.date > b.date;
              });

              this.extendState({
                loaded: true,
                logs: logs,
                fromDate: logs
                    .map((log) => log.date)
                    .reduce((a, b) => a < b ? a : b, oneMonthAgo),
                tooDate: new Date()
              });
            }
          }
        });
    }

    componentDidMount() {
        this.requestLogs();
    }

    extendState(...sources) {
      return this.setState(_.extend({}, this.state, ...sources));
    }

    setFilter(filterFn) {
        this.extendState({
          filter: filterFn
        });
    }

    renderFilterRadio(name, filter) {
        return (
            <div>
                <input
                    name="filter"
                    type="radio"
                    checked={this.state.filter === filter}
                    onChange={this.setFilter.bind(this, filter)}/>
                <label>{name}</label>
                <br/>
            </div>
        );
    }

    renderLogEntries() {
        const {filter} = this.state;
        const logs = (filter ? // if there's a filter, use it
                this.state.logs.filter(filter) : 
                this.state.logs).filter(({date}) => {
                  return date > this.state.fromDate && date < this.state.tooDate;
                });

        return reverse(logs).map((entry, index) => (
            <tr key={`log-${index}`}>
                <td>{entry.level}</td>
                <td style={{maxWidth: 300, maxHeight: 100, overflow: "auto"}}>{entry.message}</td>
                <td>{entry.timestamp}</td>
            </tr>
        ));
    }

    render() {
        const {loaded, fromDate, tooDate} = this.state;
        return (
            <div className="logs">
                <p>Filter by level</p>
                {this.renderFilterRadio("All", filters.all)}
                {this.renderFilterRadio("Info", filters.info)}
                {this.renderFilterRadio("Warning", filters.warning)}
                {this.renderFilterRadio("Error", filters.error)}
                <button onClick={this.requestLogs.bind(this)}>Fetch</button>
                <p>From</p>
                <DateTimePicker date={fromDate} onChange={this.updateFromDate.bind(this)} disabled={!loaded}/><br/>
                <p>To</p>
                <DateTimePicker date={tooDate} onChange={this.updateTooDate.bind(this)} disabled={!loaded}/><br/>
                <table>
                    <thead>
                        <tr>
                            <th>Level</th>
                            <th>Message</th>
                            <th>Timestamp</th>
                        </tr>
                    </thead>
                        <tbody>
                            {this.renderLogEntries()}
                        </tbody>
                    <tfoot></tfoot>
                </table>
            </div>
        );
    }
}

module.exports = Logs;