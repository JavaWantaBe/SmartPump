var React = require("react");

var Footer = React.createClass({
    render: function() {
        return (
            <div className='footer'>
                <span className='copyright'>©2012 - 2014 AlphaLoewe.com - All Rights Reserved</span>
                <div className='footer-nav'>
                    <ul>
                        <li><a href="#logs" className='footer-nav-item'>Logs</a></li>
                        <li><a href="#settings" className='footer-nav-item'>Settings</a></li>
                        <li><a href="#schedule" className='footer-nav-item'>Tide Schedule</a></li>
                        <li><a href="#dashboard" className='footer-nav-item'>Dashboard</a></li>
                    </ul>
                </div>
            </div>
        );
    }
});

module.exports = Footer;