'use strict';


var db_all_user 		= require('./../Util/Database/Db_all_user.js');
var db_s1_user 			= require('./../Util/Database/Db_s1_user.js');
var db_s1_base_info 	= require('./../Util/Database/Db_s1_base_info.js');
var db_s1_base_defend 	= require('./../Util/Database/Db_s1_base_defend.js');
var db_s2_base_info 	= require('./../Util/Database/Db_s2_base_info.js');
var db_s2_base_defend 	= require('./../Util/Database/Db_s2_base_defend.js');
var db_server_task		= require('./../Util/Database/Db_server_task.js');
var register 			= require('./../Login/Register/Register.js');
var functions 			= require('./../Util/Functions.js');
var DetailError;

if (process.argv.length <=2) {
	console.log("Vui lòng chọn tham số truyền vào/Need param")	
	console.log("0: update all user");
	console.log("1: update to game_info");
	console.log("2: update to base_defend")
	console.log("3: update to base_info")
}else{
	switch (parseInt(process.argv[2])) {
		case 0:
		console.log("update all user")
		break;

		case 1:
		//console.log("update user to game_info");
		var queryString_user_info = "SELECT * FROM `user_info` WHERE 1";
		// console.log("queryString_user_info: "+queryString_user_info);
		db_all_user.query(queryString_user_info, function (error,rows) {
			if (!!error){DetailError = ('UpdateUser.js: Error queryString_user_info ');functions.WriteLogError(DetailError);}
			for (var i = 0; i < rows.length; i++) {
				//console.log('ID_User: '+rows[i].ID_User);
				checkAndInsertToGameInfo (rows[i]);
			}
		});
		break;

		case 2:
		console.log("update user to base_defend");
		var queryString_user_info = "SELECT * FROM `game_info` WHERE 1";
		db_all_user.query(queryString_user_info, function (error,rows) {
			if (!!error){DetailError = ('UpdateUser.js: Error queryString_user_info ');functions.WriteLogError(DetailError);}
			for (var i = 0; i < rows.length; i++) {
				checkAndInsertToBaseDefend (rows[i]);
				// checkAndInsertToBaseInfo(rows[i]);	
			}
		});
		break;
	}
}

function checkAndInsertToGameInfo (data) {
	var queryString_check_game_info = "SELECT * FROM `game_info` WHERE `ID_User`= '"+data.ID_User+"'";
	//console.log('queryString_check_game_info: '+queryString_check_game_info);
	db_all_user.query(queryString_check_game_info,function (error,rows) {
		if (!!error){DetailError = ('UpdateUser.js: Error queryString_check_game_info ');functions.WriteLogError(DetailError);}
		if (rows.length==0) {
			db_server_task.query("SELECT `Content` FROM `task` WHERE `ID`=1",function (error,results) {
				if (!!error){DetailError = ('UpdateUser.js: Error querydb_server_task');functions.WriteLogError(DetailError);}
				var queryInsert_game_info = "INSERT INTO `game_info`(`ID_User`,`NameInGame`,`Server_ID`) VALUES ('"
				+data.ID_User+"','"
				+data.NameInGame+"','"
				+results[0].Content+"')";
				// console.log('queryInsert_game_info: '+queryInsert_game_info);
				db_all_user.query(queryInsert_game_info,function (error,results) {
					if (!!error){DetailError = ('UpdateUser.js: Error queryInsert_game_info');functions.WriteLogError(DetailError);}
				})
			})

		}		
	})
}

function checkAndInsertToBaseDefend (data) {
	var findTableID = "SHOW TABLES LIKE '"+data.ID_User+"'";
	// console.log('findTableID: '+findTableID);	
	switch (data.Server_ID) {
		case 1:
		db_s1_base_defend.query(findTableID,function (error,rows) {
			if (!!error){DetailError = ('UpdateUser.js: findTableID');functions.WriteLogError(DetailError);}
			if (rows.length==0) {
				var stringTable ="`s1_base_defend`.`"+data.ID_User+"`";
				var createNewTable = "DROP TABLE IF EXISTS "+stringTable+" ; "+
				"CREATE TABLE "+stringTable+"( `ID` int(11) NOT NULL, `ID_Base` int(11) NOT NULL, `BaseNumber` int(11) NOT NULL, `UnitType` int(11) NOT NULL, `Level` int(11) NOT NULL, `Quality` int(11) NOT NULL ) ENGINE=InnoDB DEFAULT CHARSET=latin1; "+
				"ALTER TABLE "+stringTable+" ADD PRIMARY KEY (`ID`);"+
				"ALTER TABLE "+stringTable+" MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT";
				db_s1_base_defend.query(createNewTable,function (error,result) {
					if (!!error){DetailError = ('UpdateUser.js: createNewTable db_s1_base_defend');functions.WriteLogError(DetailError);}
				});
			}
		});
		break;
		case 2:
		db_s2_base_defend.query(findTableID,function (error,rows) {
			if (!!error){DetailError = ('UpdateUser.js: findTableID');functions.WriteLogError(DetailError);}
			if (rows.length==0) {
				var stringTable ="`s2_base_defend`.`"+data.ID_User+"`";
				var createNewTable = "DROP TABLE IF EXISTS "+stringTable+" ; "+
				"CREATE TABLE "+stringTable+"( `ID` int(11) NOT NULL, `ID_Base` int(11) NOT NULL, `BaseNumber` int(11) NOT NULL, `UnitType` int(11) NOT NULL, `Level` int(11) NOT NULL, `Quality` int(11) NOT NULL ) ENGINE=InnoDB DEFAULT CHARSET=latin1; "+
				"ALTER TABLE "+stringTable+" ADD PRIMARY KEY (`ID`);"+
				"ALTER TABLE "+stringTable+" MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT";
				db_s2_base_defend.query(createNewTable,function (error,result) {
					if (!!error){DetailError = ('UpdateUser.js: createNewTable db_s2_base_defend');functions.WriteLogError(DetailError);}
				});
			}
		});
		break;
	}
}

function checkAndInsertToBaseInfo (data) {
	var findTableID = "SHOW TABLES LIKE '"+data.ID_User+"'";
	// console.log('findTableID: '+findTableID);
	switch (data.Server_ID) {
		case 1:
		db_s1_base_info.query(findTableID,function (error,rows) {
			if (!!error){DetailError = ('UpdateUser.js: findTableID');functions.WriteLogError(DetailError);}
			if (rows.length==0) {
				var stringTable ="`s1_base_info`.`"+data.ID_User+"`";
				var createNewTable = "DROP TABLE IF EXISTS "+stringTable+";"+ 
				"CREATE TABLE "+stringTable+" ( `ID` int(11) NOT NULL, `ID_User` int(11) NOT NULL, `BaseNumber` int(11) NOT NULL, `Location` text NOT NULL, `Farm` double NOT NULL, `Wood` double NOT NULL, `Stone` double NOT NULL, `Metal` double NOT NULL, `UpgradeWaitType` int(11) NOT NULL, `UpgradeTime_int` int(11) NOT NULL, `UpgradeTime_text` text NOT NULL, `UnitTransferType` int(11) NOT NULL, `UnitTransferQuality` int(11) NOT NULL, `UnitTransferTime_int` int(11) NOT NULL, `UnitTransferTime_txt` text NOT NULL, `UnitTransfer_ID_Base` int(11) NOT NULL, `TrainingUnitType` int(11) NOT NULL, `TrainingTime_int` int(11) NOT NULL, `TrainingTime_text` text NOT NULL, `TrainingQuality` int(11) NOT NULL, `SumUnitQuality` int(11) NOT NULL ) ENGINE=InnoDB DEFAULT CHARSET=latin1;"+ 
				"ALTER TABLE "+stringTable+" ADD PRIMARY KEY (`ID`);"+ 
				"ALTER TABLE "+stringTable+" MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;"
				db_s1_base_info.query(createNewTable,function (error,result) {
					if (!!error){DetailError = ('UpdateUser.js: createNewTable s1_base_info');functions.WriteLogError(DetailError);}
				});
			}
		});
		break;
		case 2:
		db_s2_base_info.query(findTableID,function (error,rows) {
			if (!!error){DetailError = ('UpdateUser.js: findTableID');functions.WriteLogError(DetailError);}
			if (rows.length==0) {
				var stringTable ="`s2_base_info`.`"+data.ID_User+"`";
				var createNewTable = "DROP TABLE IF EXISTS "+stringTable+";"+ 
				"CREATE TABLE "+stringTable+" ( `ID` int(11) NOT NULL, `ID_User` int(11) NOT NULL, `BaseNumber` int(11) NOT NULL, `Location` text NOT NULL, `Farm` double NOT NULL, `Wood` double NOT NULL, `Stone` double NOT NULL, `Metal` double NOT NULL, `UpgradeWaitType` int(11) NOT NULL, `UpgradeTime_int` int(11) NOT NULL, `UpgradeTime_text` text NOT NULL, `UnitTransferType` int(11) NOT NULL, `UnitTransferQuality` int(11) NOT NULL, `UnitTransferTime_int` int(11) NOT NULL, `UnitTransferTime_txt` text NOT NULL, `UnitTransfer_ID_Base` int(11) NOT NULL, `TrainingUnitType` int(11) NOT NULL, `TrainingTime_int` int(11) NOT NULL, `TrainingTime_text` text NOT NULL, `TrainingQuality` int(11) NOT NULL, `SumUnitQuality` int(11) NOT NULL ) ENGINE=InnoDB DEFAULT CHARSET=latin1;"+ 
				"ALTER TABLE "+stringTable+" ADD PRIMARY KEY (`ID`);"+ 
				"ALTER TABLE "+stringTable+" MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;"
				db_s2_base_info.query(createNewTable,function (error,result) {
					if (!!error){DetailError = ('UpdateUser.js: createNewTable s2_base_info');functions.WriteLogError(DetailError);}
				});
			}
		});
		break;
	}
}
