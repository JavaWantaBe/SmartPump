var React = require("react");

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
            </div>
        );
    }
});

module.exports = Header;