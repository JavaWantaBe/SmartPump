var Q = require("q");
var fs = require("fs");
var readFile = Q.nfbind(fs.readFile);
var writeFile = Q.nfbind(fs.writeFile);
var http = require("http");
var log = require("./logger").bind(null, "automatic-tide-manager");
var exceptionRegex = /.*<ExceptionText>(.*)<\/ExceptionText>.*/;

var entries = null;
/* Builds a URL for requesting high/low tide data between the start and end dates passed
   dates are passed as Date objects

   Returns a URL string 
*/
function buildFetchUrl(startDate, endDate) {
    function padNumber(length, n) {
        var str = n.toString();
        while(str.length < length) {
            str = "0" + str;
        }
        return str;
    }

    // format: YYYY-MM-DDThh:mm:ssZ
    function formatDate(date) {
        var year = date.getUTCFullYear();
        var month = padNumber(2, date.getUTCMonth() + 1);
        var day = padNumber(2, date.getUTCDate());
        var hours = padNumber(2, date.getUTCHours());
        var minutes = padNumber(2, date.getUTCMinutes());
        var seconds = padNumber(2, date.getUTCSeconds());
        return  [year, month, day].join("-") + "T" + [hours, minutes, seconds].join(":");
    }

    return [
        "http://opendap.co-ops.nos.noaa.gov/ioos-dif-sos/SOS?",
        "service=SOS&",
        "request=GetObservation&",
        "version=1.0.0&",
        "observedProperty=sea_surface_height_amplitude_due_to_equilibrium_ocean_tide&",
        "offering=urn:ioos:station:NOAA.NOS.CO-OPS:9432780&",
        "responseFormat=text%2Fcsv&",
        "eventTime=" + formatDate(startDate)+"/"+formatDate(endDate)+"&",
        "result=VerticalDatum%3D%3Durn:ioos:def:datum:noaa::MLLW&",
        "dataType=HighLowTidePredictions&",
        "unit=Meters"
    ].join("");
}

function retry(fn, times, onRetry) {
    return function() {
        var args = arguments;
        var runCount = 0;

        function run() {
            if(runCount && onRetry) {
                onRetry(runCount);
            }
            if(runCount < times) {
                runCount++;
                return fn.apply(null, args).catch(run);
            }
        }

        return run();
    };
}

/* Parses comma seperated list of tide values into
   Returns an array of timestamps (milliseconds since Epoch) 
*/
function parseNOAAData(csvData) {
    var error = csvData.indexOf("ExceptionReport") !== -1;
    if(error) {
        throw new Error("CSV Exception");
    }
    return csvData.split("\n").slice(1)
        .map(function(line) {
            return line.split(",");
        })
        .filter(function(fields) { // filter out invalid lines and low tides
            return fields[6] && fields[6] === "H";
        })
        .map(function(fields) { // get timestamp
            return new Date(fields[4]).getTime();
        });
}

// Retrieves and parses tide entries from NOAA between the two given dates returned dates are in UMT
function fetch(startDate, endDate) {
    var url = buildFetchUrl(startDate, endDate);
    var deferred = Q.defer();
    //console.log("Fetching: " + url);

    http.get(url, function(res) {
        var data = [];
        res.on("data", function(chunk) {
            data.push(chunk);
        });

        res.on("end", function() {
            deferred.resolve(data.join(""));
        });
    }).on("error", deferred.reject);

    return deferred.promise
        .then(parseNOAAData);
}

module.exports = {
    getEntries: function() {
        return entries ?
            Q.resolve(entries) :
            this.updateEntries();
    },

    updateEntries: function() {
        var now = new Date();
        var nextMonth = new Date(now.getTime() + 2592000000);
        var retryCount = 10;
        log("info", "Updating tide data");

        return retry(fetch, retryCount, function(count) { // retry `fetch` 10 times
            log("error", "Failed to fetch tide data... retrying... " + count + "/" + retryCount);
        })(now, nextMonth)
            .then(function(newEntries) {
                entries = newEntries.slice(0, 20);
                return entries;
            })
            .catch(function(error) {
                log("error", "Failed to fetch tide data after " + retryCount + " attempts");
            });
    }
};