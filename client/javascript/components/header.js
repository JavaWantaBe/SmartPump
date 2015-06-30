var React = require("react");

function getTime(){
    var d = new Date();
    return d.getHours();
}

// this component does nothing it's just markup with classnames for css
var Header = React.createClass({
    render: function() {
        return (
            <div className='header'>
                <div className='logo-container'>
                    <div className='logo'></div>
                    <a className='logo-link'>SmartPump</a>
                </div>
                <div className='slogan'>Redefining Intelligent Systems</div>
                <div className='tidetimer'>{getTime()} Until next tide</div>
            </div>
        );
    }
});

module.exports = Header;