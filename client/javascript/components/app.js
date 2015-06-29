const React = require("react");
const _ = require("lodash");
const hasher = require("hasher");
const superagent = require("superagent");
const Header = require("components/header");
const Navigation = require("components/navigation");
const Footer = require("components/footer");

const Dashboard = require("./dashboard");
const Schedule = require("./schedule");
const Settings = require("./settings");
const Logs = require("./logs");
const Login = require("./login");

class Application extends React.Component {
    constructor(props) {
        super(props);
        this.state = {hash: "login", isAuthenticated: false, loaded: false};
        hasher.init();
    }

    componentDidMount() {
        hasher.changed.add(this.handleChange.bind(this));
        hasher.initialized.add(this.handleChange.bind(this));
        superagent.get("/is-authenticated")
            .end((error, res) => {
                if(error || !res.body.isAuthenticated) {
                    this.onLogout();
                } else if(res.status === 200) {
                    this.onLogin();
                }
            });
    }

    extendState(...sources) {
        this.setState(_.extend({}, this.state, ...sources));
    }

    handleChange() {
        this.extendState({
            hash: hasher.getHash()
        });
    }

    onLogout() {
        this.extendState({
            isAuthenticated: false,
            loaded: true
        });
    }

    onLogin() {
        this.extendState({
            isAuthenticated: true,
            loaded: true
        });
    }

    renderRoute() {
        if(this.state.isAuthenticated) {
            switch(this.state.hash) {
                case "dashboard": return <Dashboard/>;
                case "schedule": return <Schedule/>;
                case "settings": return <Settings/>;
                case "logs": return <Logs/>;
                default: return <Dashboard/>
            }
        } else {
            console.log("Rendering login");
            return <Login onLogin={this.onLogin.bind(this)}/>
        }
    }

    render() {
        const {isAuthenticated, loaded} = this.state;
        if(!loaded) return null;

        return (
            <div className="app yui3-cssreset">
                <Header/>
                {isAuthenticated ?
                    <Navigation hash={this.state.hash} onLogout={this.onLogout.bind(this)}/> : 
                    null
                }
                <div className="content">
                    {this.renderRoute()}
                </div>
                {isAuthenticated ? 
                    <Footer hash={this.state.hash}/> :
                    null
                }
            </div>
        );
    }
}

module.exports = Application;
