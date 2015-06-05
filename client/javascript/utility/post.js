var request = require("superagent"),
    Q       = require("q");

module.exports = function(path, data) {
    return Q.promise((resolve, reject) => {
        request.post(path, data).end(function(res) {
            if(res.status >= 400) {
                reject(res);
            }
            else {
                resolve(res);
            }
        });
    });
};
