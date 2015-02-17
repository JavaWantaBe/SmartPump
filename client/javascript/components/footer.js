var React = require("react"),
    Link = require("react-router").Link;

var Footer = React.createClass({
    render: function() {
        return (
            <div className='footer'>
                <span className='copyright'>©2012 - 2014 AlphaLoewe.com - All Rights Reserved</span>
                <div className='footer-nav'>
                    <ul>
                        <li><Link to="logs" className='footer-nav-item'>Logs</Link></li>
                        <li><Link to="settings" className='footer-nav-item'>Settings</Link></li>
                        <li><Link to="schedule" className='footer-nav-item'>Tide Schedule</Link></li>
                        <li><Link to="dashboard" className='footer-nav-item'>Dashboard</Link></li>
                    </ul>
                </div>
            </div>
        );
    }
});

module.exports = Footer;