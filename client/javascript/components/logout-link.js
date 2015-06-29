const React = require("react");
const hasher = require("hasher");
const superagent = require("superagent");

class LogoutLink extends React.Component {
  logout(event) {
    event.preventDefault();
    superagent.post("/logout")
      .end((error, res) => {
        if(error) {
          console.error("Failed to logout: " + error);
        } else {
          this.props.onLogout();
        }
      });
  }

  render() {
    return (
      <a {...this.props} href="/logout" onClick={this.logout.bind(this)}>Logout</a>
    );
  }
}

LogoutLink.defaultProps = {
  onLogout() {}
};

module.exports = LogoutLink;
