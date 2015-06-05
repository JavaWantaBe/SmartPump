var React = require("react");
var LoginLink = require("components/login-link");

var Header = React.createClass({
    render: function() {
        return (
            <div className='header'>
                <div className='logo-container'>
                    <div className='logo'></div>
                    <a className='logo-link'>SmartPump</a>
                </div>

                <div className='slogan'>Redefining Intelligent Systems</div>
                <LoginLink/>
            </div>
        );
    }
});

module.exports = Header;