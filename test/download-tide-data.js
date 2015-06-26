var downloadTideData = require("../server/download-tide-data");
var testData = require("fs").readFileSync("./test/test-data/tide-data.csv").toString();

describe("downloadTideData", function() {
  it("should download comma seperated tide data", function(done) {
    var startDate = new Date(1435290032441);
    var endDate = new Date(1436154032441);

    downloadTideData({
      startDate: startDate,
      endDate: endDate
    }).then(function(data) {
      if(data === testData) {
        done();
      } else {
        done("Data does not match test data");
      }
    }).catch(function(error) {
      console.log(Object.keys(error), error.code, error.errno);
      done(error);
    });
  });
});