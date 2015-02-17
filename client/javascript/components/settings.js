var React = require("react");

var Settings = React.createClass({
    mixins: [
        require("react-router").Navigation,
        require("mixins/store-listener")(require("stores/settings-store"))
    ],

    toggleDynamic: function() {
        this.state.settings.dynamic = !this.state.settings.dynamic;
        this.setState(this.state);
    },

    saveSettings: function() {
        this.save({
            settings: this.state.settings
        });
    },

    renderByteArray: function(name, settingId) {
        var byteArray = this.state.settings[settingId];
        return (
            <div>
                <p>{name}</p>
                {byteArray.map((b, index) => (
                    <input key={settingId+"-"+index}
                        value={b}
                        disabled={this.state.settings.dynamic}
                        onChange={(event) => {
                            byteArray[index] = +event.target.value;
                            this.setState(this.state);
                        }}
                        type="number"
                        min="0"
                        max="255"/>
                ))}
            </div>
        );
    },

    renderSettingInput: function(name, key) {
        return (
            <div>
                <p>{name}</p>
                <input
                    type='number' 
                    value={this.state.settings[key]} 
                    onChange={(event) => {
                        this.state.settings[key] = event.target.value;
                        this.setState(this.state);
                    }}/>
            </div>
        );
    },

    render: function() {
        if(this.state.settings) {
            return (
                <div className='settings'>
                    <input type="checkbox" checked={this.state.settings.dynamic} onChange={this.toggleDynamic}/> <label>DHCP Mode</label>
                    {this.renderByteArray("IP Address", "ip")}
                    {this.renderByteArray("Subnet Mask", "subnet")}
                    {this.renderByteArray("Default Gateway", "gateway")}

                    {this.renderSettingInput("Priming Cycle Timeout (ms)", "primeTimeOut")}
                    {this.renderSettingInput("Outlet Timeout (ms)", "outletTimeout")}
                    {this.renderSettingInput("Pumping Timeout (ms)", "pumpingTimeOut")}
                    {this.renderSettingInput("General Timeout (ms)", "generalTimeOut")}

                    <button onClick={this.saveSettings}>Save</button>
                </div>
            );
        }
        else {
            return (
                <div className='settings'>
                </div>
            );
        }
    }
});

module.exports = Settings;