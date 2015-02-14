var vows = require('vows'),
    helpers = require('winston/test/helpers'),
    transport = require('winston/test/transports/transport'),
    Mysql = require('../lib/winston-mysql-transport').Mysql;

vows.describe('winston-mysql-transport').addBatch({
    "An instance of the Mysql Transport" : transport(Mysql, {
        host : 'localhost',
        database : 'logs',
        user : 'root',
        password : '',
        table : 'logs'
    })
}).export(module);