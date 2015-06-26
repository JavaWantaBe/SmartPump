var parseTideData = require("../server/parse-tide-data");
var testData = require("fs").readFileSync("./test/test-data/tide-data.csv").toString();
var correctDates = require("./test-data/parsed-tide-data").map(function(dateString) {
  return new Date(dateString);
});

describe("parseTideData", function() {
  it("should parse the same dates as the pre-parsed test data", function(done) {
    var parsedDates = parseTideData(testData);
    if(!parsedDates) {
      done("falsey result");
    } else if(parsedDates.length !== correctDates.length) {
      done("Invalid number of results");
    } else if(!parsedDates.every(isCorrectDate)) {
      done("Dates don't match");
    }

    done();

    function isCorrectDate(date, index) {
      return date.getTime() === correctDates[index].getTime();
    }
  });
});
