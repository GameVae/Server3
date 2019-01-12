'use strict';
var mysql = require('mysql');

var db_connectionLimit   =  1000;
var db_host              =  'localhost';
var db_user              =  'gamevae';
var db_password          =  'GWgUi2]&]aa';
var db_database          =  'upgrade_database';
var db_debug             =  false;
var db_multipleStatements=  true;
var db_charset           =  'utf8_unicode_ci';

var database_upgrade_database    =    mysql.createPool({
  connectionLimit    : db_connectionLimit,
  host               : db_host,
  user               : db_user,
  password           : db_password,
  database           : db_database,
  debug              : db_debug,
  multipleStatements : db_multipleStatements,
  charset            : db_charset,
});


database_upgrade_database.on('connection', function(connection) {

 connection.on('error', function(err) {
  console.error(new Date(), 'MySQL error', err.code);
});
 connection.on('close', function(err) {
  console.error(new Date(), 'MySQL close', err);
});
});

module.exports = database_upgrade_database;