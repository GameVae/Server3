'use strict';
var createPosition 		= require('./CreatePosition.js');

var functions 			= require('./../../Util/Functions.js');
var sendMail 			= require('./../../Util/SendMail/SendMail.js');

//var db_user				= require('./../../Util/Database/Db_s1_user.js');
var db_all_user			= require('./../../Util/Database/Db_all_user.js');
var db_all_friend		= require('./../../Util/Database/Db_all_friend.js');

var db_position			= require('./../../Util/Database/Db_position.js');
var db_server_task 		= require('./../../Util/Database/Db_server_task.js');

var db_s1_base_info 	= require('./../../Util/Database/Db_s1_base_info.js');
var db_s1_base_defend 	= require('./../../Util/Database/Db_s1_base_defend.js');
var db_s1_base_upgrade	= require('./../../Util/Database/Db_s1_base_upgrade.js');

var db_s2_base_info 	= require('./../../Util/Database/Db_s2_base_info.js');
var db_s2_base_defend 	= require('./../../Util/Database/Db_s2_base_defend.js');
var db_s2_base_upgrade 	= require('./../../Util/Database/Db_s2_base_upgrade.js');
//var server_Info			= require('./ServerInfo.js');
// var userBase		= require('./../../UserBase/userBase.js');
// var sendMail 		= require('./../../Util/sendMail.js');

var currentUser, DetailError, logChangeDetail;
var stringTable_base_info, createNewTable_base_info,stringTable_base_defend, createNewTable_base_defend, stringTable_base_upgrade,createNewTable_base_upgrade;
var createNewFriendTable;
var dbInfo,dbDefend,dbUpgrade;

var ChatWorldColor = "FFFFFF";
var Diamond = 1000;



exports.Start = function start (io) {
	io.on('connection', function(socket){
		socket.on('S_REGISTER', function (data){
			//console.log('socketID: '+socket.id);
			S_REGISTER (socket,data);
		});
	});
}

function S_REGISTER (socket,data) {
	// console.log('S_REGISTER'+ data);
	// console.log(data);
	
	var queryString = "SELECT * FROM `user_info` WHERE `UserName`='"+data.UserName+"' OR `Email`='"+data.Email+"'";

	db_all_user.query(queryString,function(error,rows){
		if (!!error){DetailError = ('Register.js: queryUser :'+ queryString); functions.WriteLogError(DetailError,2);}
		console.log("rows: "+rows.length);
		if (rows.length>0) {		
			R_REGISTER(socket,0);
			logChangeDetail = ("R_REGISTER Fail: "+ queryString); functions.LogChange(logChangeDetail,2);
		}else{
			insert_User_Game_Info(socket,data);
			
			logChangeDetail = ("R_REGISTER: "+ queryString); functions.LogChange(logChangeDetail,2);
			sendMail.Register(data.UserName,data.Email);		
		}		
	});
}


// var insert_User_Game_Info = exports.Test =function insert_User_Game_Info (data){}
// var data={
// 	UserName: '12345672',
// 	Password: 'e10adc3949ba59abbe56e057f20f883e',
// 	Email: 'homanhquan87@gmail.com'
// }
// insert_User_Game_Info(data);

function insert_User_Game_Info(socket,data){
	var stringInsert_user_info = "INSERT INTO `all_users`.`user_info` (`UserName`, `Password`, `Email`, `NameInGame`, `Diamond`, `ResetVipTime`,`DateCreate`) VALUES ('"
	+data.UserName+"','"
	+data.Password+"','"
	+data.Email+"','"
	+data.UserName+"','"
	+Diamond+"','"
	+new Date().getUTCHours()+"','"
	+functions.GetTimeNow()+"')";
	//console.log(stringInsert_user_info);
	db_all_user.query(stringInsert_user_info,function (error,result) {
		if (!!error){DetailError = ('Register.js: stringInsert_user_info '+ stringInsert_user_info);functions.WriteLogError(DetailError,2);}

		var getServerString = "SELECT `Content` FROM `task` WHERE `ID`=1";
		db_server_task.query(getServerString,function (error,rows) {
			if (!!error){DetailError = ('Register.js: getServerString '+ getServerString);functions.WriteLogError(DetailError,2);}
			var stringInsert_game_info = "INSERT INTO `all_users`.`game_info_s"+rows[0].Content+"` (`ID_User`, `NameInGame`, `ChatWorldColor`) VALUES ('"
			+result.insertId+"','"
			+data.UserName+"','"				
			+ChatWorldColor+"')";

			db_all_user.query(stringInsert_game_info,function (error,result_StringInsert_game_info) {
				if (!!error){DetailError = ('Register.js:  stringInsert_game_info '+ stringInsert_game_info);functions.WriteLogError(DetailError,2);}
				logChangeDetail = "stringInsert_game_info: "+ stringInsert_game_info; functions.LogChange(logChangeDetail,2);

			});

			insertNewUserDatabase(result.insertId,rows[0].Content);

			var updateString = "UPDATE `user_info` SET `ID_User` = '"+result.insertId+"',`Server_ID` ='"+rows[0].Content+"'  WHERE `user_info`.`ID` = '"+result.insertId+"'";
			db_all_user.query(updateString,function (error){
				if (!!error){DetailError = ('Register.js: updateID_user_info '+ updateString); functions.WriteLogError(DetailError,2);}
				logChangeDetail = "updateString: "+ updateString; functions.LogChange(logChangeDetail,2);
			});

			createFriendTable (result.insertId);
		});
		
		logChangeDetail = "insert_User_Game_Info: "+ stringInsert_user_info; functions.LogChange(logChangeDetail,2);
		R_REGISTER(socket,1);
	});

}


function insertNewUserDatabase(ID_User,serverInt) {	
	// console.log('ID_User: '+ID_User)
	// console.log('serverInt: '+serverInt);

	stringTable_base_info 		="`s"+serverInt+"_base_info`";
	stringTable_base_defend 	="`s"+serverInt+"_base_defend`";
	stringTable_base_upgrade	="`s"+serverInt+"_base_upgrade`";

	createNewTable_base_info = "CREATE TABLE `"+ID_User+"` AS SELECT * FROM "+stringTable_base_info+";"
	+"UPDATE `"+ID_User+"` SET `ID_User` = '"+ID_User+"';"+
	"ALTER TABLE `"+ID_User+"` ADD PRIMARY KEY (`ID`);"+
	"ALTER TABLE `"+ID_User+"` MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;";
	createNewTable_base_defend = "CREATE TABLE `"+ID_User+"` AS SELECT * FROM "+stringTable_base_defend+";"+
	"ALTER TABLE `"+ID_User+"` ADD PRIMARY KEY (`ID`);"+
	"ALTER TABLE `"+ID_User+"` MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;";
	createNewTable_base_upgrade= "CREATE TABLE `"+ID_User+"_"+serverInt+"` AS SELECT * FROM "+stringTable_base_upgrade+";"+
	"ALTER TABLE `"+ID_User+"_"+serverInt+"` ADD PRIMARY KEY (`ID`);"+
	"ALTER TABLE `"+ID_User+"_"+serverInt+"` MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;";
	
	// db_s1_base_info.query("SELECT*FROM `s1_base_info`",function (error,rows) {
	// 	console.log(rows)
	// })

	switch (parseInt(serverInt)) {
		case 1:
		dbInfo= db_s1_base_info;
		dbDefend=db_s1_base_defend;
		dbUpgrade=db_s1_base_upgrade;
		break;

		case 2:
		dbInfo= db_s2_base_info;
		dbDefend=db_s2_base_defend;
		dbUpgrade=db_s2_base_upgrade;
		break;
	}

	dbInfo.query(createNewTable_base_info,function (error,result) {
		if (!!error){DetailError = ('UpdateUser.js: createNewTable s1_base_info: '+createNewTable_base_info);functions.WriteLogError(DetailError,2);}
		logChangeDetail = "createNewTable_base_info: "+ createNewTable_base_info; functions.LogChange(logChangeDetail,2);
	});
	dbDefend.query(createNewTable_base_defend,function (error,result) {
		if (!!error){DetailError = ("UpdateUser.js: createNewTable s"+serverInt+"_base_defend: "+createNewTable_base_defend);functions.WriteLogError(DetailError,2);}
		logChangeDetail = "createNewTable_base_defend: "+ createNewTable_base_defend; functions.LogChange(logChangeDetail,2);
	});
	dbUpgrade.query(createNewTable_base_upgrade,function (error,result) {
		if (!!error){DetailError = ("UpdateUser.js: createNewTable s"+serverInt+"_base_upgrade: "+createNewTable_base_upgrade);functions.WriteLogError(DetailError,2);}
		logChangeDetail = "createNewTable_base_upgrade: "+ createNewTable_base_upgrade; functions.LogChange(logChangeDetail,2);
	});
	
	createBasePostion (serverInt,ID_User);
}


function createFriendTable (ID_User) {
	var createNewFriendTable = "CREATE TABLE `"+ID_User+"` AS  (SELECT * FROM `friends`);"+
	"ALTER TABLE `"+ID_User+"` ADD PRIMARY KEY (`ID`);"+
	"ALTER TABLE `"+ID_User+"` MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT";
	
	db_all_friend.query(createNewFriendTable,function (error,result) {
		if (!!error){DetailError = ('Register.js: createNewFriendTable '+ createNewFriendTable); functions.WriteLogError(DetailError,2);}				
	});
}
function R_REGISTER(socket,boolSuccess){
	socket.emit('R_REGISTER',{R_REGISTER : boolSuccess});
}

function createBasePostion (serverInt,ID_User) {
	createPosition.CreatePos(serverInt,function (posUpdate) {
		updateDatabase (serverInt,ID_User,posUpdate);
		updateDataPosition(serverInt,ID_User,posUpdate);
	});
}

function updateDatabase (serverInt,ID_User,posUpdate) {
	var updateString = "UPDATE `"+ID_User+"` SET `Position`= '"+posUpdate+"' WHERE ID = 1;";
	// console.log(updateString);
	switch (parseInt(serverInt)) {
		case 1:
		db_s1_base_info.query(updateString,function (error,result) {
			if (!!error){DetailError = ("UpdateUser.js: updateDatabase s"+serverInt+"_base_info: "+updateString);functions.WriteLogError(DetailError,2);}
			logChangeDetail = "updateDatabase: "+ updateString; functions.LogChange(logChangeDetail,2);
		});
		break;
		case 2:
		db_s2_base_info.query(updateString,function (error,result) {
			if (!!error){DetailError = ("UpdateUser.js: updateDatabase s"+serverInt+"_base_info: "+updateString);functions.WriteLogError(DetailError,2);}
			logChangeDetail = "updateDatabase: "+ updateString; functions.LogChange(logChangeDetail,2);
		});
		break;
	}
}

function updateDataPosition (serverInt,ID_User,posUpdate) {
	var stringInsert = "INSERT INTO `s"+serverInt+"_position` (`Position_Cell`, `ID_Type`, `Comment`) VALUES ('"
	+posUpdate+"','"+
	+ID_User+"_0_1','Player Base 1')";
	// console.log(stringInsert);
	db_position.query(stringInsert,function (error,result) {
		if (!!error){DetailError = ('UpdateUser.js: updateDataPosition: '+stringInsert);functions.WriteLogError(DetailError,2);}
		logChangeDetail = "updateDataPosition: "+ stringInsert; functions.LogChange(logChangeDetail,2);
	});
}