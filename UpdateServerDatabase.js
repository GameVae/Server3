'use strict';

var db_all_user 		= require('./Util/Database/Db_all_user.js');
var db_s3_basedefend 	= require('./Util/Database/Db_s3_baseDefend.js');
var db_s3_user 			= require('./Util/Database/Db_s3_user.js');

var functions 		= require('./Util/Functions.js');
var DetailError;

if (process.argv.length <=2) {
	// console.log("Vui lòng chọn tham số truyền vào/Need param")
	var queryString = "SELECT * FROM `all_user`";

	db_all_user.query(queryString, function (error,rows) {
		if (!!error){DetailError =('UpdateServerDatabase: queryString all_user');functions.WriteLogError(DetailError);}
		// for (var i = 0; i < rows.length; i++) {
		// 	rows[i].ID
		// }
		console.log(rows.length);
	});
}

// function update_db_s3_defend(ID_User) {
	
// }