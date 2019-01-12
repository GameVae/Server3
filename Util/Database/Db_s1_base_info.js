'use strict';
var mysql = require('mysql');

var db_connectionLimit   =0;
var db_host  =   'localhost';
var db_user  =   'gamevae';
var db_password    =   'GWgUi2]&]aa';
var db_database    =   's1_base_info';
var db_debug =   false;
var db_multipleStatements=   true;
var db_charset     =   'utf8_unicode_ci';

var database_s1_base_info   =    mysql.createPool({
  connectionLimit    : db_connectionLimit,
  host               : db_host,
  user               : db_user,
  password           : db_password,
  database           : db_database,
  debug              : db_debug,
  multipleStatements : db_multipleStatements,
  charset            : db_charset,
});


database_s1_base_info.on('connection', function(connection) {

 connection.on('error', function(err) {
  console.error(new Date(), 'MySQL error', err.code);
});
 connection.on('close', function(err) {
  console.error(new Date(), 'MySQL close', err);
});
});

module.exports = database_s1_base_info;

// exports.Database_s3_user          = database_s3_user;
// exports.Database_s3_basedefend    = database_s3_basedefend;
// var Database_s3_user    =    mysql.createPool({
//       connectionLimit   :   1000,
//       host              :   'localhost',
//       user              :   'gamevae',
//       password          :   'GWgUi2]&]aa',
//       database          :   's3_user',
//       debug             :   false,
//       multipleStatements:   true,
//       charset           :   'utf8_unicode_ci'
// });
// var Database_s3_basedefend    =    mysql.createPool({
//       connectionLimit   :   1000,
//       host              :   'localhost',
//       user              :   'gamevae',
//       password          :   'GWgUi2]&]aa',
//       database          :   's3_basedefend',
//       debug             :   false,
//       multipleStatements:   true,
//       charset           :   'utf8_unicode_ci'
// });