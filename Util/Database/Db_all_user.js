'use strict';
var mysql = require('mysql');

var db_connectionLimit   =  0;
var db_host              =  'localhost';
var db_user              =  'gamevae';
var db_password          =  'GWgUi2]&]aa';
var db_database          =  'all_users';
var db_debug             =  false;
var db_multipleStatements=  true;
var db_charset           =  'utf8_unicode_ci';

var database_all_user    =    mysql.createPool({
  connectionLimit    : db_connectionLimit,
  host               : db_host,
  user               : db_user,
  password           : db_password,
  database           : db_database,
  debug              : db_debug,
  multipleStatements : db_multipleStatements,
  charset            : db_charset,
});


database_all_user.on('connection', function(connection) {
 
 connection.on('error', function(err) {
  console.error(new Date(), 'MySQL error', err.code);
});
 connection.on('close', function(err) {
  console.error(new Date(), 'MySQL close', err);
});
});

module.exports = database_all_user;