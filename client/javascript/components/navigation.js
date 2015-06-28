var React = require("react");

var Navigation = React.createClass({
    render: function() {
        return (
            <div className='navigation'>
                <ul>
                    <li><a href="#dashboard" className='nav-item'>Dashboard</a></li>
                    <li><a href="#schedule" className='nav-item'>Tide Schedule</a></li>
                    <li><a href="#settings" className='nav-item'>Settings</a></li>
                    <li><a href="#logs" className='nav-item'>Logs</a></li>
                </ul>
            </div>
        );
    }
});

module.exports = Navigation;