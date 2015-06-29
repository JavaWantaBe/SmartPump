const React = require("react");
const Link = require("./link");
const LogoutLink = require("./logout-link");

class Navigation extends React.Component {
  render() {
    return (
      <div className="navigation">
        <ul>
          <li><Link href="#dashboard" className="nav-item" activeClassName="active" hash={this.props.hash}>Dashboard</Link></li>
          <li><Link href="#schedule" className="nav-item" activeClassName="active" hash={this.props.hash}>Tide Schedule</Link></li>
          <li><Link href="#settings" className="nav-item" activeClassName="active" hash={this.props.hash}>Settings</Link></li>
          <li><Link href="#logs" className="nav-item" activeClassName="active" hash={this.props.hash}>Logs</Link></li>
          <li><LogoutLink onLogout={this.props.onLogout} style={{position: "relative", left: 10}}/></li>
        </ul>
      </div>
    );
  }
}

module.exports = Navigation;