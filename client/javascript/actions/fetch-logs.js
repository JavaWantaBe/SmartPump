var ajax = require("qwest");

function fetchLogs() {
    ajax.get("/log")
        .then(function(data) {
            console.log(data);
        })
        .catch(function(err) {
            console.log("Error",err);
            if(err.autherror) {
                require("react-router").Location.push("login");
            }
        });
}

module.exports = fetchLogs;