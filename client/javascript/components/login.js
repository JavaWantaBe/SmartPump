var React = require("react");
var Reflux = require("reflux");
var login = require("actions/login");

var Login = React.createClass({
    mixins: [
        require("react-router").Navigation,
        Reflux.ListenerMixin
    ],

    getInitialState: function() {
        return {
            failed: false,
            username: "",
            password: ""
        };
    },

    submit: function(event) {
        event.preventDefault();
        login(this.state.username, this.state.password);
    },

    componentDidMount: function() {
        this.refs.usernameInput.getDOMNode().focus();

        this.listenTo(login.completed, () => {
            this.transitionTo("dashboard");
        });

        this.listenTo(login.failed, () => {
            this.setState({
                username: this.state.username,
                password: "",
                failed: true
            });
        });
    },

    updateUsername: function(event) {
        this.setState({
            username: event.target.value,
            password: this.state.password
        });
    },

    updatePassword: function(event) {
        this.setState({
            username: this.state.username,
            password: event.target.value
        });
    },

    render: function() {
        return (
            <div className='login'>
                {this.state.failed ? 
                    <p>Invalid username or password</p> :
                    null
                }
                <form onSubmit={this.submit}>
                    <input
                        type="text"
                        placeholder="username"
                        maxLength="16"
                        value={this.state.username}
                        onChange={this.updateUsername}
                        ref="usernameInput"/>
                    <br/>
                    <input type="password" placeholder="password" maxLength="32" value={this.state.password} onChange={this.updatePassword}/>
                    <br/>
                    <button>Login</button>
                </form>
            </div>
        );
    }
});

module.exports = Login;