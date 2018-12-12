'use strict';

var functions 			= require('./../../Util/Functions.js');

//var db_user				= require('./../../Util/Database/Db_s1_user.js');
var db_all_user			= require('./../../Util/Database/Db_all_user.js');
var db_server_task 		= require('./../../Util/Database/Db_server_task.js');

var db_s1_base_info 	= require('./../../Util/Database/Db_s1_base_info.js');
var db_s1_base_defend 	= require('./../../Util/Database/Db_s1_base_defend.js');
var db_s2_base_info 	= require('./../../Util/Database/Db_s2_base_info.js');
var db_s2_base_defend 	= require('./../../Util/Database/Db_s2_base_defend.js');
// var userBase		= require('./../../UserBase/userBase.js');
// var sendMail 		= require('./../../Util/sendMail.js');
var s1_pos={};
var s2_pos={};

var currentUser, DetailError, logChangeDetail;
var stringTable_base_info, createNewTable_base_info,stringTable_base_defend, createNewTable_base_defend;

function getS1Pos () {
	console.log("here Register.js");
	var queryString_s1Pos = "SELECT * FROM `s1_rss` WHERE `Level`=1 ";
}
var data ={
	UserName : "Mquan",
	Email :"homanhquan@gmail.com"
}
S_REGISTER (data);
function S_REGISTER (data) {
	console.log('S_REGISTER');
	var queryString = "SELECT * FROM `user_info` WHERE `UserName`='"+data.UserName+"' OR `Email`='"+data.Email+"'";
	// var queryString = "SELECT * FROM `users`"
	db_all_user.query(queryString,function(error,rows){
		if (!!error){DetailError = ('Register: S_REGISTER queryUser :'+ data.UserName); functions.WriteLogError(DetailError);}
		console.log("rows: "+rows.length);
		if (rows.length>0) {		
			// R_REGISTER(socket,0);
			
		}else{
			createUser(data);
			//R_REGISTER(socket,1);
			// logChangeDetail = ("R_REGISTER: "+ data.UserName); functions.LogChange(logChangeDetail);
			// sendMail.Register(data.UserName,data.Email);		
		}		
	});
}

function createUser(data) {
	insert_User_Game_Info (data);
}

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
			var updateString = "UPDATE `user_info` SET `ID_User` = '"+result.insertId+"' WHERE `user_info`.`ID` = '"+result.insertId+"'";
			//console.log(updateString);
			db_all_user.query(updateString,function (error){
				if (!!error){DetailError = ('Register.js: Error updateID_user_info '+ data.UserName); functions.WriteLogError(DetailError);}
				logChangeDetail = "updateString: "+ updateString; functions.LogChange(logChangeDetail);
			});
			
			var getServerString = "SELECT `Content` FROM `task` WHERE `ID`=1";
			db_server_task.query(getServerString,function (error,rows) {
				if (!!error){DetailError = ('Register.js: Error getServerString'+ data.UserName);functions.WriteLogError(DetailError);}

				var stringInsert_game_info = "INSERT INTO `all_users`.`game_info_s"+rows[0].Content+"` (`ID_User`, `NameInGame`,`Server_ID`) VALUES ('"
				+result.insertId+"','"
				+data.UserName+"','"
				+rows[0].Content+"')";
				console.log(stringInsert_game_info);
				db_all_user.query(stringInsert_game_info,function (error,result_StringInsert_game_info) {
					if (!!error){DetailError = ('Register.js: Error stringInsert_game_info'+ data.UserName);functions.WriteLogError(DetailError);}
					logChangeDetail = "stringInsert_game_info: "+ stringInsert_game_info; functions.LogChange(logChangeDetail);
				});
				insertNewUserDatabase(result.insertId,parseInt(rows[0].Content));
			});
		}
		logChangeDetail = "insert_User_Game_Info: "+ stringInsert_user_info; functions.LogChange(logChangeDetail);
	});
}


function insertNewUserDatabase(ID_User,Server_ID) {	
	console.log("insertNewUserDatabase_" +ID_User)
	console.log("insertNewUserDatabase_" +Server_ID)
	switch (Server_ID) {
		case 1:
		stringTable_base_defend ="`s1_base_defend`.`"+ID_User+"`";
		stringTable_base_info ="`s1_base_info`.`"+ID_User+"`";
		break;

		case 2:
		stringTable_base_defend ="`s2_base_defend`.`"+ID_User+"`";
		stringTable_base_info ="`s2_base_info`.`"+ID_User+"`";
		break;
	}

	createNewTable_base_defend = "DROP TABLE IF EXISTS "+stringTable_base_defend+";"+
	"CREATE TABLE "+stringTable_base_defend+
	"( `ID` int(11) NOT NULL, `ID_Base` int(11) NOT NULL, `BaseNumber` int(11) NOT NULL DEFAULT '0', `UnitType` int(11) NOT NULL DEFAULT '0', `Level` int(11) NOT NULL DEFAULT '0', `Quality` int(11) NOT NULL DEFAULT '0') ENGINE=InnoDB DEFAULT CHARSET=latin1; "+
	"ALTER TABLE "+stringTable_base_defend+" ADD PRIMARY KEY (`ID`);"+
	"ALTER TABLE "+stringTable_base_defend+" MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT";

	createNewTable_base_info = "DROP TABLE IF EXISTS "+stringTable_base_info+";"+ 
	"CREATE TABLE "+stringTable_base_info+
	" ( `ID` int(11) NOT NULL, `ID_User` int(11) NOT NULL, `BaseNumber` int(11) NOT NULL DEFAULT '0', `Position` text, `Farm` double NOT NULL DEFAULT '0', `Wood` double NOT NULL DEFAULT '0', `Stone` double NOT NULL DEFAULT '0', `Metal` double NOT NULL DEFAULT '0', `UpgradeWait_ID` int(11) NULL, `UpgradeTime` DATETIME NULL, `ResearchWait_ID` int(11) NULL, `ResearchTime` DATETIME NULL,`UnitTransferType` int(11) NULL, `UnitTransferQuality` int(11) NULL, `UnitTransferTime` DATETIME NULL, `UnitTransfer_ID_Base` int(11) NULL, `TrainingUnitType` int(11) NULL, `TrainingTime` DATETIME NULL, `TrainingQuality` int(11) NULL, `SumUnitQuality` int(11) NULL ) ENGINE=InnoDB DEFAULT CHARSET=latin1;"+ 
	"ALTER TABLE "+stringTable_base_info+" ADD PRIMARY KEY (`ID`);"+ 
	"ALTER TABLE "+stringTable_base_info+" MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;"

	switch (Server_ID) {
		case 1:
		db_s1_base_defend.query(createNewTable_base_defend,function (error,result) {
			if (!!error){DetailError = ("UpdateUser.js: createNewTable_base_defend s1_base_info: "+ID_User);functions.WriteLogError(DetailError);}
			logChangeDetail = "createNewTable_base_defend: "+ ID_User; functions.LogChange(logChangeDetail);
			console.log(error);
		});
		db_s1_base_info.query(createNewTable_base_info,function (error,result) {
			if (!!error){DetailError = ('UpdateUser.js: createNewTable_base_info s1_base_defend: '+ID_User);functions.WriteLogError(DetailError);}
			logChangeDetail = "createNewTable_base_info: "+ ID_User; functions.LogChange(logChangeDetail);
			updatePosition (ID_User,Server_ID);			
			console.log(error);
		});
		break;

		case 2:
		db_s2_base_defend.query(createNewTable_base_defend,function (error,result) {
			if (!!error){DetailError = ('UpdateUser.js: createNewTable_base_defend s2_base_info: '+ID_User);functions.WriteLogError(DetailError);}
			logChangeDetail = "createNewTable_base_defend: "+ ID_User; functions.LogChange(logChangeDetail);
			console.log(error);
		});
		db_s2_base_info.query(createNewTable_base_info,function (error,result) {
			if (!!error){DetailError = ('UpdateUser.js: createNewTable_base_info s2_base_info: '+ID_User);functions.WriteLogError(DetailError);}
			logChangeDetail = "createNewTable_base_defend: "+ ID_User; functions.LogChange(logChangeDetail);
			console.log(error);
		});
		break;
	}
}

//updatePosition(5,1)
function updatePosition (ID_User,Server_ID) {

	
	console.log(ID_User,Server_ID);
	var stringUpdate = "INSERT INTO "+"s"+Server_ID+"_base_info.`"+ID_User+"` (`ID_User`,`BaseNumber`)VALUES ("+ID_User+",1)";
	console.log(stringUpdate);
	db_s1_base_info.query(stringUpdate,function (error,result) {
		console.log(error);
	});
}