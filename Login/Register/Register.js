'use strict';
var createPosition 		= require('./CreatePosition.js');
var updateDatabaseUser	= require('./UpdateDatabaseUser.js');


var functions 			= require('./../../Util/Functions.js');
var sendMail 			= require('./../../Util/SendMail/SendMail.js');

//var db_user				= require('./../../Util/Database/Db_s1_user.js');
var db_all_user			= require('./../../Util/Database/Db_all_user.js');
var db_position			= require('./../../Util/Database/Db_position.js');
var db_server_task 		= require('./../../Util/Database/Db_server_task.js');

var db_s1_base_info 	= require('./../../Util/Database/Db_s1_base_info.js');
var db_s1_base_defend 	= require('./../../Util/Database/Db_s1_base_defend.js');
var db_s2_base_info 	= require('./../../Util/Database/Db_s2_base_info.js');
var db_s2_base_defend 	= require('./../../Util/Database/Db_s2_base_defend.js');

//var server_Info			= require('./ServerInfo.js');
// var userBase		= require('./../../UserBase/userBase.js');
// var sendMail 		= require('./../../Util/sendMail.js');
var s1_pos={};
var s2_pos={};

var currentUser, DetailError, logChangeDetail;
var stringTable_base_info, createNewTable_base_info,stringTable_base_defend, createNewTable_base_defend;
var Farm=10000,Wood=10000,Stone=10000,Metal=10000;

exports.Start = function start (io) {
	io.on('connection', function(socket){
		getS1Pos ();
		socket.on('S_REGISTER', function (data){
			//console.log('socketID: '+socket.id);
			S_REGISTER (socket,data);
		});
	});
}

function getS1Pos () {
	console.log("here Register.js");
	var queryString_s1Pos = "SELECT * FROM `s1_rss` WHERE `Level`=1 ";
}

function S_REGISTER (socket,data) {
	console.log('S_REGISTER');
	var queryString = "SELECT * FROM `user_info` WHERE `UserName`='"+data.UserName+"' OR `Email`='"+data.Email+"'";
	// var queryString = "SELECT * FROM `users`"
	db_all_user.query(queryString,function(error,rows){
		if (!!error){DetailError = ('Register: S_REGISTER queryUser :'+ data.UserName); functions.WriteLogError(DetailError);}
		console.log("rows: "+rows.length);
		if (rows.length>0) {		
			R_REGISTER(socket,0);
			logChangeDetail = ("R_REGISTER Fail: "+ data.UserName); functions.LogChange(logChangeDetail);
		}else{
			createUser(socket,data);
			R_REGISTER(socket,1);
			logChangeDetail = ("R_REGISTER: "+ data.UserName); functions.LogChange(logChangeDetail);
			sendMail.Register(data.UserName,data.Email);		
		}		
	});
}

function createUser(data) {
	insert_User_Game_Info (data);
}
// var insert_User_Game_Info = exports.Test =function insert_User_Game_Info (data){}
function insert_User_Game_Info (data) {
	var stringInsert_user_info = "INSERT INTO `all_users`.`user_info` (`UserName`, `Password`, `Email`, `NameInGame`,`ResetVipTime`,`DateCreate`) VALUES ('"
	+data.UserName+"','"
	+data.Password+"','"
	+data.Email+"','"
	+data.UserName+"','"
	+new Date().getUTCHours()+"','"
	+functions.GetTimeNow()+"')";
	// console.log(stringInsert_user_info);
	db_all_user.query(stringInsert_user_info,function (error,result) {
		if (!!error){DetailError = ('Register.js: Error stringInsert_user_info '+ data.UserName);functions.WriteLogError(DetailError);}
		else{
			
			var getServerString = "SELECT `Content` FROM `task` WHERE `ID`=1";
			db_server_task.query(getServerString,function (error,rows) {
				if (!!error){DetailError = ('Register.js: Error getServerString'+ data.UserName);functions.WriteLogError(DetailError);}

				var stringInsert_game_info = "INSERT INTO `all_users`.`game_info_s"+rows[0].Content+"` (`ID_User`, `NameInGame`) VALUES ('"
				+result.insertId+"','"
				+data.UserName+"')";
				// console.log(stringInsert_game_info);
				db_all_user.query(stringInsert_game_info,function (error,result_StringInsert_game_info) {
					if (!!error){DetailError = ('Register.js: Error stringInsert_game_info'+ data.UserName);functions.WriteLogError(DetailError);}
					logChangeDetail = "stringInsert_game_info: "+ stringInsert_game_info; functions.LogChange(logChangeDetail);

				});
				insertNewUserDatabase(result.insertId,rows[0].Content);

				var updateString = "UPDATE `user_info` SET `ID_User` = '"+result.insertId+"',`Server_ID` ='"+rows[0].Content+"'  WHERE `user_info`.`ID` = '"+result.insertId+"'";
				db_all_user.query(updateString,function (error){
					if (!!error){DetailError = ('Register.js: Error updateID_user_info '+ data.UserName); functions.WriteLogError(DetailError);}
					logChangeDetail = "updateString: "+ updateString; functions.LogChange(logChangeDetail);
				});
			});
		}
		logChangeDetail = "insert_User_Game_Info: "+ stringInsert_user_info; functions.LogChange(logChangeDetail);
	});


}


function R_REGISTER(socket,boolSuccess){
	socket.emit('R_REGISTER',{Message : boolSuccess});
}

function insertNewUserDatabase(ID_User,serverInt) {	
	stringTable_base_defend ="`s"+serverInt+"_base_defend`.`"+ID_User+"`";
	stringTable_base_info ="`s"+serverInt+"_base_info`.`"+ID_User+"`";

	createNewTable_base_defend = "DROP TABLE IF EXISTS "+stringTable_base_defend+";"+
	"CREATE TABLE "+stringTable_base_defend+
	"( `ID` int(11) NOT NULL, `ID_Base` int(11) NOT NULL, `BaseNumber` int(11) NOT NULL, `UnitType` int(11) NOT NULL, `Level` int(11) NOT NULL, `Quality` int(11) NOT NULL ) ENGINE=InnoDB DEFAULT CHARSET=latin1; "+
	"ALTER TABLE "+stringTable_base_defend+" ADD PRIMARY KEY (`ID`);"+
	"ALTER TABLE "+stringTable_base_defend+" MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT";

	createNewTable_base_info = "DROP TABLE IF EXISTS "+stringTable_base_info+";"+ 
	"CREATE TABLE "+stringTable_base_info+
	" ( `ID` int(11) NOT NULL, `ID_User` int(11) NOT NULL, `BaseNumber` int(11) NOT NULL, `Location` text NOT NULL, `Farm` double NOT NULL, `Wood` double NOT NULL, `Stone` double NOT NULL, `Metal` double NOT NULL, `UpgradeWait_ID` int(11) NULL, `UpgradeTime` DATETIME NULL, `ResearchWait_ID` int(11) NULL, `ResearchTime` DATETIME NULL,`UnitTransferType` int(11) NULL, `UnitTransferQuality` int(11) NULL, `UnitTransferTime` DATETIME NULL, `UnitTransfer_ID_Base` int(11) NULL, `TrainingUnitType` int(11) NULL, `TrainingTime` DATETIME NULL, `TrainingQuality` int(11) NULL, `SumUnitQuality` int(11) NULL ) ENGINE=InnoDB DEFAULT CHARSET=latin1;"+ 
	"ALTER TABLE "+stringTable_base_info+" ADD PRIMARY KEY (`ID`);"+ 
	"ALTER TABLE "+stringTable_base_info+" MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;"

	switch (serverInt) {
		case 1:
		db_s1_base_defend.query(createNewTable_base_defend,function (error,result) {
			if (!!error){DetailError = ("UpdateUser.js: createNewTable s1_base_info: "+ID_User);functions.WriteLogError(DetailError);}
			logChangeDetail = "createNewTable_base_defend: "+ ID_User; functions.LogChange(logChangeDetail);
		});
		db_s1_base_info.query(createNewTable_base_info,function (error,result) {
			if (!!error){DetailError = ('UpdateUser.js: createNewTable s1_base_defend: '+ID_User);functions.WriteLogError(DetailError);}
			logChangeDetail = "createNewTable_base_info: "+ ID_User; functions.LogChange(logChangeDetail);

		});
		break;

		case 2:
		db_s2_base_defend.query(createNewTable_base_defend,function (error,result) {
			if (!!error){DetailError = ('UpdateUser.js: createNewTable s1_base_info: '+ID_User);functions.WriteLogError(DetailError);}
			logChangeDetail = "createNewTable_base_defend: "+ ID_User; functions.LogChange(logChangeDetail);
		});
		db_s2_base_info.query(createNewTable_base_info,function (error,result) {
			if (!!error){DetailError = ('UpdateUser.js: createNewTable s1_base_info: '+ID_User);functions.WriteLogError(DetailError);}
			logChangeDetail = "createNewTable_base_defend: "+ ID_User; functions.LogChange(logChangeDetail);
		});
		break;
	}
	createBasePostion (serverInt,ID_User);
}


function createBasePostion (serverInt,ID_User) {
	createPosition.CreatePos(serverInt,function (posUpdate) {
		updateDatabase (serverInt,ID_User,posUpdate);
		updateDataPosition(serverInt,ID_User,posUpdate);
	});
}

function updateDatabase (serverInt,ID_User,posUpdate) {
	var updateString = "UPDATE `"+ID_User+"` SET `Position`= '"+posUpdate+"',"+
	"`Farm`='"+Farm+"',"+
	"`Wood`='"+Wood+"',"+
	"`Stone`='"+Stone+"',"+
	"`Metal`='"+Metal+"'"+
	" WHERE ID = 1;";
	// console.log(updateString);

	switch (serverInt) {
		case 1:
		db_s1_base_info.query(updateString,function (error,result) {
			if (!!error){DetailError = ('UpdateUser.js: updateDatabase s1_base_info: '+ID_User);functions.WriteLogError(DetailError);}
			logChangeDetail = "updateDatabase: "+ ID_User; functions.LogChange(logChangeDetail);
		});
		break;
		case 2:
		db_s2_base_info.query(updateString,function (error,result) {
			if (!!error){DetailError = ('UpdateUser.js: updateDatabase s1_base_info: '+ID_User);functions.WriteLogError(DetailError);}
			logChangeDetail = "updateDatabase: "+ ID_User; functions.LogChange(logChangeDetail);
		});
		break;
	}
}

function updateDataPosition (serverInt,ID_User,posUpdate) {
	var stringInsert = "INSERT INTO `s"+serverInt+"_position` (`Position_Cell`, `ID_Type`, `Comment`) VALUES ('"
	+posUpdate+"','"+
	+ID_User+"_0_1','Player Base 1')";
	console.log(stringInsert);
	db_position.query(stringInsert,function (error,result) {
		if (!!error){DetailError = ('UpdateUser.js: updateDataPosition: '+ID_User);functions.WriteLogError(DetailError);}
		logChangeDetail = "updateDataPosition: "+ ID_User+"_server: "+serverInt; functions.LogChange(logChangeDetail);
	});
}

// function getCurrentUser(data)
// {
// 	return currentUser =
// 	{
// 		UserName : data.UserName,
// 		Email : data.Email,
// 		Password : data.Password,

// 	}
// // }
// function queryUser (currentUser,socket) {
// 	database.query("SELECT * FROM `users` WHERE `UserName`='"+currentUser.name+"' OR `UserEmail`='"+currentUser.email+"'",function (error,rows) {
// 		if (!!error){DetailError = ('register: Error queryUser '+ currentUser.name);functions.WriteLogError(DetailError);}
// 		if (rows.length>0) {
// 			socket.emit('R_REGISTER_UNSUCCESS', {data : '0'});
// 		}else {
// 			R_REGISTER_SUCCESS (currentUser,socket);
// 			//userBase.createNewUserBase(currentUser);
// 		}
// 	});	
// }
// //FFFFFFFF: new TextChatColor
// function R_REGISTER_SUCCESS (currentUser,socket) {
// 	database.query( "INSERT INTO `users` (`UserID`,`UserName`,`UserPass`,`password_recover_key`,`password_recover_key_expire`,`UserEmail`,`Diamond`,`timeLogin`,`timeLogout`,`timeResetMine`, `ColorChatWorld`) VALUES ('"+""+"','"
// 		+currentUser.name+"','"+currentUser.password+"','"+""+"','"+""+"','"+currentUser.email+"','"+1000+"','"+0+"','"+0+"','"+0+"','FFFFFFFF')",function (error,result) {			
// 			if (!!error){DetailError = ('register: Error insertUser '+ currentUser.name);functions.WriteLogError(DetailError);}
// 			socket.emit('R_REGISTER_SUCCESS', {message : '1'});
// 			console.log('đang ki thanh cong: '+currentUser.name);
// 			R_USER_REGISTER (currentUser,socket);
// 			sendMail.sendMailRegister(currentUser);
// 		});	
// }
// function R_USER_REGISTER (currentUser,socket) {
// 	socket.emit('R_USER_REGISTER', { UserName : currentUser.name,});
// }