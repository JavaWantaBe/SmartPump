const React = require("react");

function getDigits(ipString) {
  return typeof ipString === "string" ? ipString.split(".").map((n) => parseInt(n)) : ipString;
}

class Ipv4Input extends React.Component {
  replaceDigit(index, event) {
    const newValue = this.props.value.map((n, i) => 
      i === index ? parseInt(event.target.value) : n
    );
    this.props.onChange(newValue);
  }

  render() {
    const {readOnly, disabled, min, max} = this.props;
    return (
      <div>
        {this.props.value.map((digit, i) => 
          <input
            key={i}
            type="number"
            readOnly={readOnly}
            disabled={disabled}
            min={min}
            max={max}
            value={digit}
            onChange={this.replaceDigit.bind(this, i)}
          />
        )}
      </div>
    );
  }
}

Ipv4Input.defaultProps = {
  onChange() {},
  value: "0.0.0.0",
  min: 0,
  max: 255,
  disabled: false,
  readOnly: false
};

module.exports = Ipv4Input;