var Reflux = require("reflux");
var post = require("utility/post");

var login = Reflux.createAction({asyncResult: true});

login.listen(function(username, password) {
    post("/login", {username, password}).then(this.completed, this.failed);
});

module.exports = login;