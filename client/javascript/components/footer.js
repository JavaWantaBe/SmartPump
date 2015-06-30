const React = require("react");
const Link = require("./link");

/**
 * @brief Returns full date for footer copyright date
 * @returns {number}
 */
function getYear(){
    var d = new Date();
    return d.getFullYear();
}

/**
 * @brief Creates class component that is used to render Footer
 */
const Footer = React.createClass({
    render: function() {
        const {hash} = this.props;
        return (
            <div className='footer'>
                <span className='copyright'>©2012 - {getYear()} AlphaLoewe.com - All Rights Reserved</span>
                <div className='footer-nav'>
                    <ul>
                        <li><Link href="#logs" className="footer-nav-item" activeClassName="active" hash={hash}>Logs</Link></li>
                        <li><Link href="#settings" className="footer-nav-item" activeClassName="active" hash={hash}>Settings</Link></li>
                        <li><Link href="#schedule" className="footer-nav-item" activeClassName="active" hash={hash}>Tide Schedule</Link></li>
                        <li><Link href="#dashboard" className="footer-nav-item" activeClassName="active" hash={hash}>Dashboard</Link></li>
                    </ul>
                </div>
            </div>
        );
    }
});

module.exports = Footer;