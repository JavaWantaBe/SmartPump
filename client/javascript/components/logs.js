var React    = require("react");
var _        = require("lodash");
var isAuthorized = require("utility/is-authorized");

var filters = {
    all: null,

    info: function(entry) {
        return entry.level === "info";
    },

    error: function(entry) {
        return entry.level === "error";
    }
};

function reverse(arr) {
    return arr.reduceRight(function(result, value) {
        result.push(value);
        return result;
    }, []);
}

var Logs = React.createClass({
    mixins: [
        require("react-router").Navigation
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
            filter: filters.all
        };
    },

    setFilter: function(filterFn) {
        this.setState(_.extend({}, this.state, {
            filter: filterFn
        }));
    },

    renderFilterRadio: function(name, filter) {
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
    },

    renderLogEntries: function() {
        var filter = this.state.filter,
            logs = filter ? // if there's a filter, use it
                this.state.logs.filter(filter) : 
                this.state.logs;

        return reverse(logs).map((entry) => (
            <tr key={entry.key}>
                <td>{entry.level}</td>
                <td>{entry.message}</td>
                <td>{entry.timestamp}</td>
            </tr>
        ));
    },

    render: function() {
        return (
            <div className="logs">
                <p>Filter by level</p>
                {this.renderFilterRadio("All",     filters.all)}
                {this.renderFilterRadio("Info",    filters.info)}
                {this.renderFilterRadio("Error",   filters.error)}
                <button onClick={this.load}>Fetch</button>
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
});

module.exports = Logs;