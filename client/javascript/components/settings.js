var React = require("react");
var IpInput = require("components/ip-input");
var isAuthorized = require("utility/is-authorized");

var Settings = React.createClass({
    mixins: [
        require("react-router").Navigation
    ],

    statics: {
        willTransitionTo: function(transition, params, query, callback) {
            isAuthorized()
                .then(() => {
                    console.log("Auth completed");
                    callback();
                })
                .catch((error) => {
                    console.log("Auth failed:", error);
                    transition.redirect("login");
                    callback();
                });
        }
    },

    getInitialState: function() {
        return {
            ip: [192, 168, 1, 5],
            subnet: [255, 255, 255, 0],
            gateway: [192, 168, 1, 1]
        };
    },

    toggleDynamic: function() {

    },

    save: function() {

    },

    setIp: function(ip) {
        this.setState({
            ip: ip
        });
    },

    render: function() {
        return (
            <div className="settings">
                <input type="checkbox" onChange={this.toggleDynamic}/> <label>DHCP Mode</label>
                <IpInput values={this.state.ip} onChange={this.setIp}>IP Address</IpInput>

                <button onClick={this.saveSettings}>Save</button>
            </div>
        );
    }
});

module.exports = Settings;

//{/*this.renderByteArray("IP Address", "ip")*/}
//{/*this.renderByteArray("Subnet Mask", "subnet")*/}
//{/*this.renderByteArray("Default Gateway", "gateway")*/}

//{/*this.renderSettingInput("Priming Cycle Timeout (ms)", "primeTimeOut")*/}
//{/*this.renderSettingInput("Outlet Timeout (ms)", "outletTimeout")*/}
//{/*this.renderSettingInput("Pumping Timeout (ms)", "pumpingTimeOut")*/}
//{/*this.renderSettingInput("General Timeout (ms)", "generalTimeOut")*/}