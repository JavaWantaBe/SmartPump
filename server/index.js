var pm2 = require("pm2");

pm2.connect(function() {
    pm2.start({
        script: __dirname + "/smartpump.js"
    }, function(err, apps) {
        if(err) {
            console.log(err.toString());
        }
        pm2.disconnect();
    });
});