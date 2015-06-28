/**
 * Created by richard on 6/27/15.
 */
var emailAlert = require("../server/emailalert");
var testData = require("fs").readFileSync("./test/test-data/emailerrordata.txt").toString();

describe("sendemailalert", function() {
    it("should should send an email with a text document", function(done) {
        this.timeout(10000);
        emailAlert.init();
        emailAlert.sendAlert("This is a test" ).then(function(res){
            console.log(res);
            done(res);
        }, function(rej){
            console.log(rej);
            done(rej);
        });
    });
});

