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

class DateTimePicker extends React.Component {
  onDateChange(event) {
    const newDateString = event.target.value;
    const [, timeString] = splitDate(this.props.date);
    const date = joinDateTime(newDateString, timeString);
    this.props.onChange(date);
  }

  onTimeChange(event) {
    const newTimeString = event.target.value;
    const [dateString] = splitDate(this.props.date);
    const date = joinDateTime(dateString, newTimeString);
    this.props.onChange(date);
  }

  render() {
    const {date, readOnly, disabled, onRemoveClick} = this.props;
    const [dateString, timeString] = splitDate(date);

    return (
      <div>
        <input type="date" value={dateString} onChange={this.onDateChange.bind(this)} readOnly={readOnly} disabled={disabled}/>
        <input type="time" value={timeString} onChange={this.onTimeChange.bind(this)} readOnly={readOnly} disabled={disabled}/>
      </div>
    );
  }
}

DateTimePicker.defaultProps = {
  onChange() {},
  readOnly: false,
  date: new Date()
}

module.exports = DateTimePicker;
