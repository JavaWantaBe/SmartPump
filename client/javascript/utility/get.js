var request = require("superagent"),
    Q       = require("q");

module.exports = function(path) {
    return Q.promise((resolve, reject) => {
        request.get(path).end(function(res) {
            if(res.status >= 400) {
                reject(res);
            }
            else {
                resolve(res);
            }
        });
    });
};
