var Reflux = require("reflux");
var get = require("utility/get");

var Logout = Reflux.createAction({
    asyncResult: true
});

Logout.listen(function() {
    get("logout")
        .then(this.completed)
        .catch(this.failed);
});

module.exports = Logout;