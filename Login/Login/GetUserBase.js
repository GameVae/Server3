'use strict';

var db_all_user				= require('./../../Util/Database/Db_all_user.js');

var db_s1_base_info			= require('./../../Util/Database/Db_s1_base_info.js');
var db_s1_upgrade			= require('./../../Util/Database/Db_s1_base_upgrade.js');

var db_s2_base_info			= require('./../../Util/Database/Db_s2_base_info.js');
var db_s2_upgrade			= require('./../../Util/Database/Db_s2_base_upgrade.js');

var functions 				= require('./../../Util/Functions.js');

var dbInfo,dbUpgrade;

var dataInfo={};

exports.R_BASE_INFO = function r_base_info (socket,ID_User,Server_ID) {
	
	switch (parseInt(Server_ID)) {
		case 1:
		dbInfo = db_s1_base_info;
		break;
		case 2:
		dbInfo = db_s2_base_info;
		break;
	}
	var stringQuery = "SELECT * FROM `"+ID_User+"`";
	dbInfo.query(stringQuery, function (error,rows) {
		var currentTime = functions.GetTime();
		
		for (var i = 0; i < rows.length; i++) {
			dataInfo = rows[i]
			if (rows[i].UpgradeTime!=null) {
				dataInfo["UpgradeTime "]= (new Date(functions.ExportTimeDatabase(rows[i].UpgradeTime))-currentTime)/1000;
			}
			if (rows[i].ResearchTime!=null) {
				dataInfo["ResearchTime"]= (new Date(functions.ExportTimeDatabase(rows[i].ResearchTime))-currentTime)/1000;
			}
			if (rows[i].ResearchTime!=null) {
				dataInfo["UnitTransferTime "]= (new Date(functions.ExportTimeDatabase(rows[i].UnitTransferTime))-currentTime)/1000;
			}
			if (rows[i].TrainingTime!=null) {
				dataInfo["TrainingTime"]= (new Date(functions.ExportTimeDatabase(rows[i].TrainingTime))-currentTime)/1000;
			}
			delete dataInfo["ID"];
			socket.emit('R_BASE_INFO',{R_BASE_INFO:dataInfo});
		}
	});
}

// var playerData ={
// 	Position: "",
// 	ID_User:"",
// 	NameInGame:"",
// 	Level:"",
// }
var playerData ={};
var rowsTable;
exports.R_BASE_PLAYER = function r_base_player (socket,ID_User,Server_ID) {
	switch (parseInt(Server_ID)) {
		case 1:
		dbInfo = db_s1_base_info;
		break;
		case 2:
		dbInfo = db_s2_base_info;
		break;
	}
	var stringInfo = "SELECT * FROM `game_info_s"+Server_ID+"` WHERE `ID_User`<>"+ID_User;
	console.log(stringInfo);

}

r_base_player(9,1)
function r_base_player (ID_User,Server_ID){
	switch (parseInt(Server_ID)) {
		case 1:
		dbInfo = db_s1_base_info;
		break;
		case 2:
		dbInfo = db_s2_base_info;
		break;
	}

	var database = "s"+Server_ID+"_base_info";
	// var stringBase = "SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='"+
	// database+"' AND TABLE_NAME <>'"+database+"' AND TABLE_NAME <>'"+ID_User+"'";
	var stringBase = "SELECT `TABLE_NAME` FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='"+
	database+"' AND TABLE_NAME <>'"+database+"'";
	queryTable (dbInfo,stringBase,function (returnTableName) {
		queryTableData (dbInfo,Server_ID,returnTableName)

	});

}
function queryTableData (dbInfo,Server_ID,tableName) {
	console.log(tableName.length)
	for (var i = 0; i < tableName.length; i++) {
		var stringQuery = "SELECT `ID_User`,`BaseNumber`,`Position` FROM `"+tableName[i].TABLE_NAME+"`";
		//console.log(stringQuery);
		dbInfo.query(stringQuery,function (error,rows) {
			for (var i = 0; i < rows.length; i++) {
				playerData = rows[i];
				getBaseLevel (Server_ID,playerData);
			}
			// console.log(playerData)
		});
	}
}
function getBaseLevel (Server_ID,playerData) {
	//console.log(playerData)
	switch (Server_ID) {
		case 1:
		dbUpgrade = db_s1_upgrade;
		break;
		case 2:
		dbUpgrade = db_s2_upgrade;
		break;
	}
	var stringLevel = "SELECT `Level` FROM `"+playerData.ID_User+"_"+playerData.BaseNumber+"`";
	// console.log(stringLevel)
	dbUpgrade.query(stringLevel,function (error,rows) {
		playerData.Level = rows[0].Level;
		console.log(playerData)
	});
}
function queryTable (dbInfo,stringBase,returnTableName) {
	dbInfo.query(stringBase,function (error,rowsTableName) {
		if (rowsTableName!=undefined) {
			returnTableName(rowsTableName);	
		}
	});
}
