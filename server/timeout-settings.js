var _ = require("lodash");
var fs = require("fs");
var configFileName = __dirname + "/config/pumpsettings";
var timeoutSettings = require(configFileName);

function getSettings() {
	return timeoutSettings;
}

function setSettings(newSettings) {
	newSettings = _.extend({}, timeoutSettings, newSettings); // this way any missing arguments are filled in by the old settings
	timeoutSettings = newSettings;
	fs.writeFileSync(configFileName+".json", JSON.stringify(newSettings, null, 4));
}

module.exports = {
	getSettings: getSettings,
	setSettings: setSettings
};