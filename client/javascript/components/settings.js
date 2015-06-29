const React = require("react");
const _ = require("lodash");
const superagent = require("superagent");
const Ipv4Input = require("./ipv4-input");

class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            settings: {}
        };
    }

    requestSettings() {
        superagent.get("/settings")
            .end((error, res) => {
                if(error) {
                    this.extendState({
                        loaded: true,
                        settings: {error}
                    });
                } else {
                    this.extendState({
                        loaded: true,
                        settings: res.body.settings
                    });
                }
            });
    }

    save(event) {
        event.preventDefault();
        superagent.post("/settings")
            .set("Accept", "application/json")
            .send({settings: this.state.settings})
            .end((error, res) => {
                if(error) {
                    alert("Failed to save: " + error.message);
                } else {
                    alert("Saved successfully");
                }
            });
    }

    componentDidMount() {
        this.requestSettings();
    }

    extendState(...sources) {
        return this.setState(_.extend({}, this.state, ...sources));
    }

    mergeState(...sources) {
        return this.setState(_.merge({}, this.state, ...sources));
    }

    bindSettingKey(key) {
        return (value) => this.mergeState({
            settings: {
                [key]: value
            }
        })
    }

    updateTimeout(timeoutName) {
        return (event) => this.mergeState({
            settings: {
                timeouts: {
                    [timeoutName]: parseInt(event.target.value)
                }
            }
        });
    }

    render() {
        const {loaded, settings} = this.state;
        if(!loaded) return null;
        if(settings.error) return <div>{settings.error.message}</div>
        const {ip, subnet, gateway, timeouts} = settings;

        return (
            <form onSubmit={this.save.bind(this)}>
                <h2 style={{fontWeight: "bold", margin: "15px 0 5px 0"}}>Network Settings</h2>
                <p>Address</p>
                <Ipv4Input value={ip} onChange={this.bindSettingKey("ip")}/>
                <p>Subnet Mask</p>
                <Ipv4Input value={subnet} onChange={this.bindSettingKey("subnet")}/>
                <p>Gateway</p>
                <Ipv4Input value={gateway} onChange={this.bindSettingKey("gateway")}/>

                <h2 style={{fontWeight: "bold", margin: "10px 0 5px 0"}}>Timeouts (ms)</h2>
                {_.map(timeouts, (ms, timeoutName) =>
                    <div key={timeoutName}>
                        <p>{timeoutName.replace("TimeOut", "")}</p>
                        <input type="number" value={ms} onChange={this.updateTimeout(timeoutName)}/>
                    </div>
                )}

                <button style={{margin: "10px 0 10px 0"}}>Save</button>
            </form>
        );
    }
}


module.exports = Settings;
