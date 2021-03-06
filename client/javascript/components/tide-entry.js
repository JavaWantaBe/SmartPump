var React = require("react");

function splitDate(date) {
  const [dateString, timeString] = date.toISOString().split("T");
  return [
    dateString,
    timeString.replace(/\.\d*Z$/, "") // remove ms and "Z" from iso string
  ];
}

function joinDateTime(dateString, timeString) {
  return new Date(dateString + "T" + timeString + "Z");
}

function isValidDate(date) {
  return true;//return date && (date.getTime() > Date.now());
}

class TideEntry extends React.Component {
  onDateChange(event) {
    const newDateString = event.target.value;
    const [, timeString] = splitDate(this.props.date);
    const date = joinDateTime(newDateString, timeString);
    if(isValidDate(date)) {
      this.props.onChange(date);
    }
  }

  onTimeChange(event) {
    const newTimeString = event.target.value;
    const [dateString] = splitDate(this.props.date);
    const date = joinDateTime(dateString, newTimeString);
    if(isValidDate(date)) {
      this.props.onChange(date);
    }
  }

  isValid() {
    return this.props.date >= (new Date());
  }

  render() {
    const {date, readOnly, disabled, onRemoveClick} = this.props;
    const [dateString, timeString] = splitDate(date);
    const isValid = this.isValid();
    const style = {
      background: isValid ? null : "rgba(255, 255, 0, 0.5)"
    }
    return (
      <div style={style}>
        <input type="date" value={dateString} onChange={this.onDateChange.bind(this)} readOnly={readOnly} disabled={disabled}/>
        <input type="time" value={timeString} onChange={this.onTimeChange.bind(this)} readOnly={readOnly} disabled={disabled}/>
        {readOnly ? null : <button onClick={this.props.onRemoveClick}>Remove</button>}
      </div>
    );
  }
}

TideEntry.defaultProps = {
  onChange() {},
  readOnly: true
}

module.exports = TideEntry;
