var React   = require("react");
var TideEntry = require("./tide-entry");

class Schedule extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dateValue: new Date()
        };
    }
    
    updateDate(newDate) {
        this.setState({
            dateValue: newDate
        });
    }

    render() {
        return (
            <div>
                <TideEntry date={this.state.dateValue} readOnly={false} onChange={this.updateDate.bind(this)}/>
            </div>    
        );
    }
}

module.exports = Schedule;