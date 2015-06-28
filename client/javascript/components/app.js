var React = require("react");
var hasher = require("hasher");
var Header = require("components/header");
var Navigation = require("components/navigation");
var Footer = require("components/footer");

var Dashboard = require("./dashboard");
var Schedule = require("./schedule");
var Settings = require("./settings");
var Logs = require("./logs");
var Login = require("./login");

class Application extends React.Component {
    constructor(props) {
        super(props);
        this.state = {hash: ""};
        hasher.init();
    }

    componentDidMount() {
        hasher.changed.add(this.handleChange.bind(this));
        hasher.initialized.add(this.handleChange.bind(this));
    }

    handleChange() {
        this.setState({
            hash: hasher.getHash()
        });
    }

    renderRoute() {
        switch(this.state.hash) {
            case "dashboard": return <Dashboard/>;
            case "schedule": return <Schedule/>;
            case "settings": return <Settings/>;
            case "logs": return <Logs/>;
            case "login": return <Login/>;
        }
    }

    render() {
        return (
            <div className="app yui3-cssreset">
                <Header/>
                <Navigation/>
                <div className="content">
                    {this.renderRoute()}
                </div>
                <Footer/>
            </div>
        );
    }
}

module.exports = Application;
