var db = require("../database" );
var query = "SELECT * FROM user WHERE username=? AND password=md5(?) limit 1";

/*
    @params
        username
        password
    @returns
        promise - resolves single user object or undefined if user isn't found
*/
module.exports = function(username, password) {
    return db.query(query, [username, password]).then(function(result) {
        return result[0];
    });
};
