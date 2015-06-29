var React = require("react");
var hasher = require("hasher");
var request = require("superagent");

var Login = React.createClass({
    getInitialState: function() {
        return {
            failed: false,
            username: "",
            password: ""
        };
    },

    submit: function(event) {
        event.preventDefault();
        request.post("/login", {
            username: this.state.username, 
            password: this.state.password
        }, (res) => {
            if(res.status === 200) { // Success
                this.props.onLogin();
            } else {
                this.setState({
                    failed: true,
                    username: "",
                    password: ""
                });
            }
        });
    },

    componentDidMount: function() {
        this.refs.usernameInput.getDOMNode().focus();
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
        const inputStyle = {
            display: "inline-block",
            marginBottom: 10
        };
        return (
            <div className='login'>
                {this.state.failed ? 
                    <p>Invalid username or password</p> :
                    null
                }
                <form onSubmit={this.submit} style={{textAlign: "center"}}>
                    Username<br/> <input
                        type="text"
                        placeholder="username"
                        maxLength="16"
                        value={this.state.username}
                        onChange={this.updateUsername}
                        ref="usernameInput"
                        style={inputStyle}/>
                    <br/>
                    Password<br/> <input
                        type="password"
                        placeholder="password"
                        maxLength="32"
                        value={this.state.password}
                        onChange={this.updatePassword}
                        style={inputStyle}/>
                    <br/>
                    <button>Login</button>
                </form>
            </div>
        );
    }
});

Login.defaultProps = {
    onLogin() {}
};

module.exports = Login;