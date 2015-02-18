var React   = require("react"),
    request = require("superagent"),
    stores  = require("stores");

var Login = React.createClass({
    mixins: [require("react-router").Navigation],

    getInitialState: function() {
        return {
            failed: false,
            username: "",
            password: ""
        };
    },

    preloadData: function() {
        stores.forEach((store) => {
            request.get(store.path, (response) => {
                if(response.status === 200) {
                    store.setData(JSON.parse(response.text));
                }
            });
        });
    },

    submit: function(event) {
        event.preventDefault();
        request.post("/login", {
            username: this.state.username, 
            password: this.state.password
        }, (res) => {
            if(res.status === 200) { // Success
                this.preloadData();
                this.transitionTo("dashboard");
            }
            else {
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