"use strict";

// Allows server to send email

var logger          = require("./logger")("mailer"),
    Q               = require("q"),
    nodemailer      = require("nodemailer"),
    smtpTransport   = nodemailer.createTransport("SMTP", require("./config/mailer"));

module.exports = {
    // Sends an email
    // Returns a promise that resolves the response from the mail server
    // Arguments: to, from, subject, text
    send: function(params) {
        var deferred = Q.defer();

        if(!params.to) {
            logger.error("Couldn't send message, no destination addresses");
            deferred.reject("Couldn't send message, no destination addresses");
        }

        smtpTransport.sendMail({
            from: params.from || "Smart Pumps <smart.pumps.alert@gmail.com>",
            to: params.to,
            subject: params.subject || "Smart Pumps email alert",
            text: params.text || "No message"
        }, 

        function(error, response){
            if(error) {
                deferred.reject(error);
            }
            else {
                deferred.resolve(response);
            }
        });

        return deferred.promise;
    }
};