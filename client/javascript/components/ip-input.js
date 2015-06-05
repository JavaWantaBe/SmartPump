var React = require("react");

function clamp(value, min, max) {
    if(value < min) return min;
    if(value > max) return max;
    return value;
}

var IpInput = React.createClass({
    propTypes: {
        values: React.PropTypes.array
    },

    onChange: function(index, event) {
        var values = this.props.values.slice();
        values[index] = clamp(event.target.value, 0, 255);

        if(this.props.onChange) {
            this.props.onChange(values);
        }
    },

    render: function() {
        var values = this.props.values.slice(0, 4);
        var disabled = this.props.disabled;
        while(values.length < 4) {
            values.push(0);
        }

        return (
            <div>
                <label>{this.props.children}</label>
                {values.map((value, index) =>
                    <input type="number" min="0" max="255" onChange={this.onChange.bind(this, index)} value={value} disabled={disabled}/>
                )}
            </div>
        );
    }
});

module.exports = IpInput;