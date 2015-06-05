var React = require("react");
var Reflux = require("reflux");
var Link = require("react-router").Link;
var isAuthorized = require("utility/is-authorized");
var login = require("actions/login");
var logout = require("actions/logout");

var LoginLink = React.createClass({
    mixins: [
        Reflux.ListenerMixin,
        require("react-router").Navigation
    ],
    getInitialState: function() {
        return {
            state: "unknown"
        };
    },

    componentWillMount: function() {
        var onLoggedIn = () => {
            this.setState({
                state: "logged-in"
            })
        };

        var onLoggedOut = () => {
            this.setState({
                state: "logged-out"
            });
        };

        isAuthorized()
            .then(onLoggedIn)
            .catch(onLoggedOut);

        this.listenTo(login.completed, onLoggedIn);
        this.listenTo(login.failed, onLoggedOut);
        this.listenTo(logout.completed, onLoggedOut);
    },

    logout: function(event) {
        event.preventDefault();
        logout();
        this.transitionTo("login");
    },

    render: function() {
        switch(this.state.state) {
            case "unknown": return null;
            case "logged-in": return <a href="#" onClick={this.logout}>Logout</a>;
            case "logged-out": return <Link to="login">Login</Link>
        }
    }
});

module.exports = LoginLink;