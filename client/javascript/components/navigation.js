var React = require("react"),
    Link = require("react-router").Link;

var Navigation = React.createClass({
    render: function() {
        return (
            <div className='navigation'>
                <ul>
                    <li><Link to="dashboard" className='nav-item'>Dashboard</Link></li>
                    <li><Link to="schedule" className='nav-item'>Tide Schedule</Link></li>
                    <li><Link to="settings" className='nav-item'>Settings</Link></li>
                    <li><Link to="logs" className='nav-item'>Logs</Link></li>
                </ul>
            </div>
        );
    }
});

module.exports = Navigation;