const React = require("react");

function splitDate(date) {
    const [dateString, timeString] = date.toISOString().split("T");
    
    return [dateString, timeString.replace(/\.\d*Z$/, "")];
}

function joinDateTime(dateString, timeString) {
    console.log(dateString, timeString);
    return new Date(`${dateString} ${timeString}`);
}

function isValidDate(date) {
    return date > Date.now();
}

class TideEntry extends React.Component {
    onTimeChange(event) {
        var newTimeString = event.target.value;
        var [dateString] = splitDate(this.props.date);
        var newDate = joinDateTime(dateString, newTimeString);

        if(isValidDate(newDate)) {
            this.props.onChange(newDate);
        }
    }
    
    onDateChange(event) {
        var newDateString = event.target.value;
        var [, timeString] = splitDate(this.props.date);
        var newDate = joinDateTime(newDateString, timeString);

        if(isValidDate(newDate)) {
            this.props.onChange(newDate);
        }
    }

    onChange(event) {
        var newDate = new Date(event.target.value);
        if(isValidDate(newDate)) {
            this.props.onChange(newDate);
        }
    }

    render() {
        const {date, readOnly} = this.props;

        return (
            <div>
                <input type="datetime" value={date.toISOString()} onChange={this.onChange}/>
            </div>
        );

        return (
            <div>
                <input type="date" readOnly={readOnly} value={dateString} onChange={this.onDateChange.bind(this)}/>
                <input type="time" readOnly={readOnly} value={timeString} onChange={this.onTimeChange.bind(this)}/>
            </div>    
        );
    }
}

TideEntry.defaultProps = {
    readOnly: true,
    onChange: function() {}
};

module.exports = TideEntry;
