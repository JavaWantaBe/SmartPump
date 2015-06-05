var Q = require("q");
var fs = require("fs");
var readFile = Q.nfbind(fs.readFile);
var writeFile = Q.nfbind(fs.writeFile);
var filename = __dirname + "/storage/manual-tide-storage.json";
var entries;

module.exports = {
    getEntries: function() {
        return entries ? Q.resolve(entries) : readFile(filename)
            .then(function(data) {
                entries = JSON.parse(data);
                return entries;
            })
            .catch(function(error) {
                return [];
            });
    },

    setEntries: function(newEntries) {
        entries = newEntries;

        return writeFile(filename, JSON.stringify(entries));
    }
};