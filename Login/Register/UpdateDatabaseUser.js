'use strict';

var functions 			= require('./../../Util/Functions.js');
var db_user				= require('./../../Util/Database/Db_s1_user.js');
var db_baseDefend		= require('./../../Util/Database/Db_s1_base_defend.js');

var currentUser,DetailError;


exports.updateDatabaseNewUser = function updateDatabaseNewUser(data) {
	var stringQuery ="SELECT * FROM `users` WHERE `UserName`="+data.UserName;
	console.log(stringQuery);
	db_user.query(stringQuery,function (error,rows) {
		if (!!error){DetailError = ('UpdateDatabaseUser: updateDatabaseNewUser  :'+ data.UserName); functions.WriteLogError(DetailError);}
		if (rows.length>0) {
			console.log(rows);
			
		}

	});
}



function createUser(socket,data) {
	var stringInsert = "INSERT INTO `users`(`UserName`, `Password`, `Email`, `NameInGame`,`DateCreate`, `DateCreate_int`) VALUES ("
	+data.UserName+","
	+data.Password+","
	+data.Email+","
	+data.UserName+","
	+functions.GetTimeUTC_string()+","
	+functions.GetTimeNow(functions.GetTimeNow_int(functions.GetTimeUTC_string()))+")";
	
	console.log(stringInsert);

	db_user.query(stringInsert,function(error,resultsInsert){	
		if (!!error){DetailError = ('Register: stringInsert  :'+ data.UserName); functions.WriteLogError(DetailError);}

	});

	R_REGISTER(socket,1);
}
function R_REGISTER(socket,boolSuccess){
	socket.emit('R_REGISTER',{Message : boolSuccess});
}
