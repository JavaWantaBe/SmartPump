"use strict";
/**
 * Created by richard on 6/27/15.
 */

var nodemailer  = require("nodemailer"),
    Q           = require("q"),
    logger      = require("./logger")("emailalert"),
    emailServer = require("./config-manager").getConfig().email.server,
    emailClient = require("./config-manager" ).getConfig().email.client,
    emailSettings = require("./config-manager" ).getConfig().email.settings,
    transporter;

/**
 * @brief Send email with message attached
 *
 * @param message
 * @returns {*}
 */
function sendAlert(message)  {
    return Q.Promise(function(resolve, reject){
        if(message){
            emailClient.text = message;
            transporter.sendMail(emailClient, function(err, res){
                if(err){
                    reject(err);
                } else if(res){
                    resolve(res);
                }
            });
        } else {
            reject("No message provided");
        }
    });
}

module.exports = {
    init: function(){
        return Q.promise(function(resolve, reject){
            if(emailSettings.servicesetting === 'service'){
                transporter = nodemailer.createTransport({
                    service: emailSettings.serviceselected,
                    auth: emailServer.auth});
            } else {
                var smtpTransport = require('nodemailer-smtp-transport');
                transporter = nodemailer.createTransport(smtpTransport(emailServer));
            }
            resolve();
        });
    },
    sendAlert: sendAlert,
    getAvailableServices: function(){
        return emailSettings.services;
    }
}