var get = require("utility/get");

module.exports = function isAuthorized() {
    return get("/is-authorized");
};