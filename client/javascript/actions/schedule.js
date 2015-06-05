var Reflux = require("reflux");
var get = require("utility/get");
var post = require("utility/post");

var actions = {
    fetch: Reflux.createAction({asyncResult: true}),
    save: Reflux.createAction({asyncResult: true}),
    startPumps: Reflux.createAction({asyncResult: true}),
    addEntry: Reflux.createAction(),
    removeEntry: Reflux.createAction(),
    toggleManualMode: Reflux.createAction(),
    setTime: Reflux.createAction(),
    setDate: Reflux.createAction()
};

actions.fetch.listen(function() {
    get("/schedule")
        .then((res) => {
            this.completed(JSON.parse(res.text));
        })
        .catch((res) => {
            this.failed(res.text);
        });
});

actions.startPumps.listen(function(schedule) {
    get("/start-pumps")
        .then((res) => {
            this.completed();
        })
        .catch((res) => {
            this.failed(res.text);
        });
});


module.exports = actions;