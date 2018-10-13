var functions			= require('./../Util/Functions.js');
var db_all_user  		= require('./../Util/Database/Db_all_user.js');
var db_server_task 		= require('./../Util/Database/Db_server_task.js');
var db_s1_base_info 	= require('./../Util/Database/Db_s1_base_info.js');
var db_s1_base_defend 	= require('./../Util/Database/Db_s1_base_defend.js');
var db_s2_base_info 	= require('./../Util/Database/Db_s2_base_info.js');
var db_s2_base_defend 	= require('./../Util/Database/Db_s2_base_defend.js');
var testRegister		= require('./../Login/Register/Register.js');

var DetailError,logChangeDetail;

if (process.argv.length <2) {
	console.log(process.argv.length)
	console.log("Vui long chon tham so truyen vao:")
	console.log("0: Check User")
	console.log('1: Delete User')
	// console.log('2: Test Time')
	// console.log('3: Test Insert User')
}
else{
	switch (parseInt(process.argv[2])) {
		case 0:
		var queryString_user_info = "SELECT * FROM `user_info`";
		db_all_user.query(queryString_user_info,function (error,rows) {
			if (!!error) {console.log('error queryString_user_info')}
				console.log("length: "+rows.length);
		})
		break;
		//delete with id_user
		case 1:
		if (parseInt(process.argv[3])==undefined) {
			console.log("Vui long chon tham so thu 3");
		}
		else{
			delete_base_info (parseInt(process.argv[3]));
			delete_base_defend(parseInt(process.argv[3]));
			delete_game_info (parseInt(process.argv[3]));
			delete_user_info (parseInt(process.argv[3]));	
		}
		break;
	}
}

function delete_user_info (id) {
	var deleteString_user_info = "DELETE FROM `user_info` WHERE `ID_User`= '"+id+"'";
	db_all_user.query(deleteString_user_info,function (error) {
		if (!!error) {DetailError =('DeleteUser.js: Error deleteString_user_info '+id); functions.WriteLogError(DetailError);}
		logChangeDetail = ""+ deleteString_user_info;	functions.LogChange(logChangeDetail);
	});
}
function delete_game_info (id) {
	delete_base_info (id);
	var deleteString_game_info = "DELETE FROM `game_info` WHERE `ID_User`= '"+id+"'";
	db_all_user.query(deleteString_game_info,function (error) {
		if (!!error) {DetailError =('DeleteUser.js: Error deleteString_game_info '+id); functions.WriteLogError(DetailError);}
		logChangeDetail = ""+ deleteString_game_info;	functions.LogChange(logChangeDetail);
	});
}
function delete_base_info (id) {
	var selectServerID = "SELECT `Server_ID` FROM `game_info` WHERE `ID_User` ='"+id+"'";
	//console.log('selectServerID: '+selectServerID);
	db_all_user.query(selectServerID, function (error,result) {
		if (!!error) {DetailError =('DeleteUser.js: Error delete_base_info '+id); functions.WriteLogError(DetailError);}
		var dropTable = "DROP TABLE IF EXISTS `"+id+"`"; 
		db_s1_base_info.query(dropTable, function (error,result) {
			if (!!error) {DetailError =('DeleteUser.js: Error drop_s1_base_info '+id); functions.WriteLogError(DetailError);}
		});
		db_s2_base_info.query(dropTable,function (error) {
			if (!!error) {DetailError=('DeleteUser.js: Error drop_s2_base_info '+id);functions.WriteLogError(DetailError);}
		});
		logChangeDetail = "delete_base_info "+ dropTable;	functions.LogChange(logChangeDetail);
	});
}
function delete_base_defend (id) {
	var selectServerID = "SELECT `Server_ID` FROM `game_info` WHERE `ID_User` ='"+id+"'";
	//console.log('selectServerID: '+selectServerID);
	db_all_user.query(selectServerID, function (error,result) {
		if (!!error) {DetailError =('DeleteUser.js: Error delete_base_defend '+id); functions.WriteLogError(DetailError);}
		var dropTable = "DROP TABLE IF EXISTS `"+id+"`"; 
		db_s1_base_defend.query(dropTable, function (error,result) {
			if (!!error) {DetailError =('DeleteUser.js: Error drop_s1_base_defend '+id); functions.WriteLogError(DetailError);}
		});
		db_s2_base_defend.query(dropTable,function (error) {
			if (!!error) {DetailError=('DeleteUser.js: Error drop_s2_base_defend '+id);functions.WriteLogError(DetailError);}
		});
		logChangeDetail = "delete_base_defend "+ dropTable;	functions.LogChange(logChangeDetail);
	});
}
