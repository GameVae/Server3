'use strict';

var db_s1_base_info			= require('./../Util/Database/Db_s1_base_info.js');
var db_s1_upgrade			= require('./../Util/Database/Db_s1_base_upgrade.js');

var db_s2_base_info			= require('./../Util/Database/Db_s2_base_info.js');
var db_s2_upgrade			= require('./../Util/Database/Db_s2_base_upgrade.js');

var db_all_user				= require('./../Util/Database/Db_all_user.js');
var db_upgrade				= require('./../Util/Database/Db_upgrade_database.js');


var functions 				= require('./../Util/Functions.js');

// var Promise 				= require('promise');

var DetailError, LogChange;

var thisTimeOut,upgradeTimeout, researchTimeout;

exports.Start = function start (io) {
	io.on('connection', function(socket){
		socket.on('S_UPGRADE', function (data){
			//console.log('socketID: '+socket.id);
			S_UPGRADE (socket,data);
		});
		socket.on('S_UPGRADE_SPEEDUP',function (data) {
			S_UPGRADE_SPEEDUP(socket,data);
		});
	});
}

function S_UPGRADE_SPEEDUP(socket,data) {
	//clearTimeout(thisTimeOut);
}

function S_UPGRADE (socket,data) {
	var stringQuery = "SELECT * FROM `upgrade` WHERE `ID`="+data.ID_Upgrade;

	db_upgrade.query(stringQuery,function(error,rows){
		var tableQuery = "SELECT * FROM `"+rows[0].Name_Upgrade +"` WHERE `Level`= "+data.Level;
		db_upgrade.query(tableQuery,function(error,rowsUpgrade){
			if (!!error){DetailError = ('Upgrade.js: tableQuery' + data.ID_User);functions.WriteLogError(DetailError);}
			checkUpgrade (data,rows[0].UpgradeType,rowsUpgrade);
		});
	});
}

function checkUpgrade (dataUser,upgradeType,rowsUpgrade) {
	var tableQuery 	= dataUser.ID_User+"_"+dataUser.ID_Base;
	var stringQuery = "SELECT * FROM `"+tableQuery+"` WHERE `ID`="+dataUser.ID_Upgrade;
	var dbQuery;
	switch (parseInt(dataUser.ID_Server)) {
		case 1:
		dbQuery = db_s1_upgrade;	
		break;
		case 2:
		dbQuery = db_s2_upgrade;
		break;
	}
	dbQuery.query(stringQuery,function (error,rows) {
		if (!!error){DetailError = ('Upgrade.js: checkUpgrade' + data.ID_User);functions.WriteLogError(DetailError);}
		if((rows[0].Level+1)==dataUser.Level){
			updateUpgrade (dataUser,upgradeType,rowsUpgrade);
		}else{
			// emit restart app
			console.log(false);
		}
	});
}

function updateUpgrade (dataUser,upgradeType,rowsUpgrade) {
	var stringUpdate;
	var timeOut = functions.GetTime()+rowsUpgrade[0].TimeInt*1000;
	var stringTime = new Date(timeOut).toISOString();
	var upgradeTime = functions.ImportTimeToDatabase(stringTime);
	var dbQuery;
	switch (upgradeType) {
		case 1:
		stringUpdate = "UPDATE `"+dataUser.ID_User+"` SET `UpgradeWait_ID`="+dataUser.ID_Upgrade+","
		+" `UpgradeWait_Might`="+rowsUpgrade[0].MightBonus+","
		+" `UpgradeTime`='"+upgradeTime+"';";
		console.log(stringUpdate);
		break;
		case 2:
		stringUpdate = "UPDATE `"+dataUser.ID_User+"` SET `ResearchWait_ID`="+dataUser.ID_Upgrade+","
		+" `ResearchWait_Might`="+rowsUpgrade[0].MightBonus+","
		+" `ResearchTime`='"+upgradeTime+"';";
		break;
	}

	switch (parseInt(dataUser.ID_Server)) {
		case 1:	
		dbQuery = db_s1_base_info;
		break;
		case 2:
		dbQuery = db_s2_base_info;
		break;
	}

	dbQuery.query(stringUpdate,function (error,result) {
		if (!!error){DetailError = ('Upgrade.js: updateUpgrade' + data.ID_User);functions.WriteLogError(DetailError);}
		LogChange='Upgrade.js: updateUpgrade: '+data.ID_User;functions.LogChange(LogChange);
		setTimerUpdateDatabase (rowsUpgrade[0].TimeInt*1000,dataUser,upgradeType);
	});

}


function test (dataUser,upgradeType) {

	var dbQuery_base_info,dbQuery_base_upgrade;
	var stringQuery = "SELECT * FROM `user_info` WHERE `ID_User`="+dataUser.ID_User;
	var stringQueryMightBounus,stringUpdateBaseInfo, stringUpdate_Game_info, stringUpdateBaseUpgrade;

	db_all_user.query(stringQuery, function (error,rows) {
		stringUpdate_Game_info = "UPDATE `game_info_s"+rows[0].Server_ID+"` SET `Might`=`Might`+";
		stringUpdateBaseUpgrade = "UPDATE `"+dataUser.ID_User+"_"+dataUser.ID_Base+"` SET `Level`="+dataUser.Level+" WHERE `ID` = "+ dataUser.ID_Upgrade;

		switch (rows[0].Server_ID) {
			case 1:
			dbQuery_base_info = db_s1_base_info;
			dbQuery_base_upgrade = db_s1_upgrade;
			break;

			case 2:
			dbQuery_base_info = db_s2_base_info;
			dbQuery_base_upgrade = db_s2_upgrade;
			break;
		}

		switch (upgradeType) {
			case 1:
			stringQueryMightBounus = "SELECT `UpgradeWait_Might` AS Might FROM `"+dataUser.ID_User+"`";
			stringUpdateBaseInfo = "UPDATE `"+dataUser.ID_User+"` SET `UpgradeWait_ID`= NULL,"
			+" `UpgradeWait_Might`= NULL,"
			+" `UpgradeTime`= NULL;";
			break;
			case 2:
			stringQueryMightBounus = "SELECT `ResearchWait_Might` AS Might FROM `"+dataUser.ID_User+"`";
			stringUpdateBaseInfo = "UPDATE `"+dataUser.ID_User+"` SET `ResearchWait_ID`= NULL,"
			+" `ResearchWait_Might`= NULL,"
			+" `ResearchTime`= NULL;";
			break;
		}

		dbQuery_base_info.query(stringQueryMightBounus,function(error,rows){
			stringUpdate_Game_info +=rows[0].Might;
			db_all_user.query(stringUpdate_Game_info,function (error,result_stringUpdate_Game_info) {
				if (!!error){DetailError = ('Upgrade.js: updateMight' + data.ID_User);functions.WriteLogError(DetailError);}
				LogChange='Upgrade.js: updateMight: '+data.ID_User;functions.LogChange(LogChange);
			});
		});
		dbQuery_base_upgrade.query(stringUpdateBaseUpgrade,function (error,result) {
			if (!!error){DetailError = ('Upgrade.js: updateLevel' + data.ID_User);functions.WriteLogError(DetailError);}
			LogChange='Upgrade.js: updateLevel: '+data.ID_User;functions.LogChange(LogChange);
		});
		dbQuery_base_info.query(stringUpdateBaseInfo,function(error,result){
			if (!!error){DetailError = ('Upgrade.js: resetBaseInfoUpdate' + data.ID_User);functions.WriteLogError(DetailError);}
			LogChange='Upgrade.js: resetBaseInfoUpdate: '+data.ID_User;functions.LogChange(LogChange);
		});
	});
}


function setTimerUpdateDatabase (time,dataUser,upgradeType) {
	thisTimeOut = setTimeout(function (dataUser,upgradeType) {
		
		var dbQuery_base_info,dbQuery_base_upgrade;
		var stringQuery = "SELECT * FROM `user_info` WHERE `ID_User`="+dataUser.ID_User;
		var stringQueryMightBounus,stringUpdateBaseInfo, stringUpdate_Game_info, stringUpdateBaseUpgrade;

		db_all_user.query(stringQuery, function (error,rows) {
			stringUpdate_Game_info 	= "UPDATE `game_info_s"+rows[0].Server_ID+"` SET `Might`=`Might`+";
			stringUpdateBaseUpgrade = "UPDATE `"+dataUser.ID_User+"_"+dataUser.ID_Base+"` SET `Level`="+dataUser.Level+" WHERE `ID` = "+ dataUser.ID_Upgrade;

			checkBoolUpgrade (dataUser,rows[0].Server_ID,upgradeType,function (checkBool) {
				if (checkBool==true) {
					switch (rows[0].Server_ID) {
						case 1:
						dbQuery_base_info = db_s1_base_info;
						dbQuery_base_upgrade = db_s1_upgrade;
						break;

						case 2:
						dbQuery_base_info = db_s2_base_info;
						dbQuery_base_upgrade = db_s2_upgrade;
						break;
					}

					switch (upgradeType) {
						case 1:
						stringQueryMightBounus = "SELECT `UpgradeWait_Might` AS Might FROM `"+dataUser.ID_User+"`";
						stringUpdateBaseInfo = "UPDATE `"+dataUser.ID_User+"` SET `UpgradeWait_ID`= NULL,"
						+" `UpgradeWait_Might`= NULL,"
						+" `UpgradeTime`= NULL;";
						break;
						case 2:
						stringQueryMightBounus = "SELECT `ResearchWait_Might` AS Might FROM `"+dataUser.ID_User+"`";
						stringUpdateBaseInfo = "UPDATE `"+dataUser.ID_User+"` SET `ResearchWait_ID`= NULL,"
						+" `ResearchWait_Might`= NULL,"
						+" `ResearchTime`= NULL;";
						break;
					}

					dbQuery_base_info.query(stringQueryMightBounus,function(error,rows){
						stringUpdate_Game_info +=rows[0].Might;
						db_all_user.query(stringUpdate_Game_info,function (error,result_stringUpdate_Game_info) {
							if (!!error){DetailError = ('Upgrade.js: updateMight' + data.ID_User);functions.WriteLogError(DetailError);}
							LogChange='Upgrade.js: updateMight: '+data.ID_User;functions.LogChange(LogChange);
						});
					});
					dbQuery_base_upgrade.query(stringUpdateBaseUpgrade,function (error,result) {
						if (!!error){DetailError = ('Upgrade.js: updateLevel' + data.ID_User);functions.WriteLogError(DetailError);}
						LogChange='Upgrade.js: updateLevel: '+data.ID_User;functions.LogChange(LogChange);
					});
					dbQuery_base_info.query(stringUpdateBaseInfo,function(error,result){
						if (!!error){DetailError = ('Upgrade.js: resetBaseInfoUpdate' + data.ID_User);functions.WriteLogError(DetailError);}
						LogChange='Upgrade.js: resetBaseInfoUpdate: '+data.ID_User;functions.LogChange(LogChange);
					});
				}
			});

		});
		
	},time, dataUser,upgradeType);

	switch (upgradeType) {
		case 1:
		upgradeTime = thisTimeOut;
		break;
		case 2:
		researchTimeout = thisTimeOut;
		break;
	}
}

function checkBoolUpgrade (dataUser,serverInt,upgradeType,checkBool) {
	var returnBool = false;
	var tableQuery = dataUser.ID_User+"_"+dataUser.ID_Base;

	var serverQuery,stringQuery;
	switch (serverInt) {
		case 1:
		serverQuery = db_s1_upgrade;
		break;
		case 2:
		serverQuery = db_s2_upgrade;
		break;
	}
	stringQuery = "SELECT `Level` FROM `"+tableQuery+"` WHERE `ID`="+dataUser.ID_Upgrade;
	serverQuery.query(stringQuery, function (error,rows) {
		if (!!error){DetailError = ('Upgrade.js: query checkBoolUpgrade' + data.ID_User);functions.WriteLogError(DetailError);}
		if (rows[0].Level+1==dataUser.Level) {
			returnBool = true;
		}
		checkBool(returnBool);
	});
}

exports.UpdateDatabase = function updateDatabase (serverInt) {
	var database = "s"+serverInt+"_base_info";
	var stringQuery = "SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='"+database+"'"
	var serverBase,serverUpdate;
	switch (serverInt) {
		case 1:
		serverBase = db_s1_base_info;
		serverUpdate = db_s1_upgrade;
		break;
		case 2:
		serverBase = db_s2_base_info;
		serverUpdate = db_s2_upgrade;
		break;
	}

	serverBase.query(stringQuery,function (error,rows) {
		if (!!error){DetailError = ('Upgrade.js: query tableDatabase: ' + serverInt);functions.WriteLogError(DetailError);}
		
		for (var i = 0; i < rows.length; i++) {
			if (rows[i].TABLE_NAME.toString().trim()!==database) {
				updateTime(serverInt,serverBase,serverUpdate,rows[i].TABLE_NAME);
			}
		}
	});
}

function updateTime (serverInt,serverBase,serverUpdate, tableQuery) {
	var stringQueryBaseUpgrade = "SELECT `ID_User`,`BaseNumber`,`UpgradeWait_ID` AS LevelUp_ID ,`UpgradeWait_Might` AS Might,`UpgradeTime` AS Time FROM `"+tableQuery+"`";
	var stringQueryBaseResearch="SELECT `ID_User`,`BaseNumber`,`ResearchWait_ID` AS LevelUp_ID ,`ResearchWait_Might` AS Might,`ResearchTime` AS Time FROM `"+tableQuery+"`";

	var currentTime = functions.GetTime();
	var dataTime;

	serverBase.query(stringQueryBaseUpgrade,function (error,rows) {	
		if (!!error){DetailError = ('Upgrade.js: query stringQueryBaseUpgrade: ' + tableQuery);functions.WriteLogError(DetailError);}		
		for (var i = 0; i < rows.length; i++) {
			if (rows[i].Time!=null) {
				dataTime = functions.ExportTimeDatabase(rows[i].Time);
				if (dataTime<currentTime) {
					updateTimeUpgrade (serverInt,serverBase,serverUpdate,rows[i]);
				}
			}
		}
	});

	serverBase.query(stringQueryBaseResearch,function (error,rows) {	
		if (!!error){DetailError = ('Upgrade.js: query stringQueryBaseResearch: ' + tableQuery);functions.WriteLogError(DetailError);}
		for (var i = 0; i < rows.length; i++) {
			if (rows[i].Time!=null) {
				dataTime = functions.ExportTimeDatabase(rows[i].Time);
				if (dataTime<currentTime) {
					updateTimeResearch (serverInt,serverBase,serverUpdate,rows[i]);
				}
			}
		}
	});
}

function updateTimeUpgrade (serverInt,serverBase,serverUpdate,rowsQuery) {
	var stringUpdateAllUser = "UPDATE `game_info_s"+serverInt+"` SET `Might` = `Might`+"+rowsQuery.Might;
	var stringUpdateUpgrade = "UPDATE `"+rowsQuery.ID_User+"_"+rowsQuery.BaseNumber+"` SET `Level`=`Level`+1 WHERE `ID`="+rowsQuery.LevelUp_ID;
	var stringClearUpgrade = "UPDATE `s"+serverInt+"_base_info` SET `UpgradeWait_ID`= NULL ,`UpgradeWait_Might`= NULL,`UpgradeTime`= NULL";
	
	db_all_user.query(stringUpdateAllUser,function (error,result) {
		if (!!error){DetailError = ('Upgrade.js: updateTimeUpgrade stringUpdateAllUser: ' + rowsQuery.ID_User);functions.WriteLogError(DetailError);}
		LogChange='Upgrade.js: updateTimeUpgrade_stringUpdateAllUser: '+rowsQuery.ID_User;functions.LogChange(LogChange);
	});
	serverUpdate.query(stringUpdateUpgrade,function (error,result) {
		if (!!error){DetailError = ('Upgrade.js: updateTimeUpgrade stringUpdateUpgrade: ' + rowsQuery.ID_User);functions.WriteLogError(DetailError);}
		LogChange='Upgrade.js: updateTimeUpgrade_stringUpdateUpgrade: '+rowsQuery.ID_User;functions.LogChange(LogChange);
	});
	serverBase.query(stringClearUpgrade,function (error,result) {
		if (!!error){DetailError = ('Upgrade.js: updateTimeUpgrade stringClearUpgrade: ' + rowsQuery.ID_User);functions.WriteLogError(DetailError);}
		LogChange='Upgrade.js: updateTimeUpgrade_stringClearUpgrade: '+rowsQuery.ID_User;functions.LogChange(LogChange);
	});
}

function updateTimeResearch (serverInt,serverBase,serverUpdate,rowsQuery) {
	var stringUpdateAllUser = "UPDATE `game_info_s"+serverInt+"` SET `Might` = `Might`+"+rowsQuery.Might;
	var stringUpdateUpgrade = "UPDATE `"+rowsQuery.ID_User+"_"+rowsQuery.BaseNumber+"` SET `Level`=`Level`+1 WHERE `ID`="+rowsQuery.LevelUp_ID;
	var stringClearUpgrade = "UPDATE `s"+serverInt+"_base_info` SET `ResearchWait_ID`= NULL ,`ResearchWait_Might`= NULL,`ResearchTime`= NULL";
	
	db_all_user.query(stringUpdateAllUser,function (error,result) {
		if (!!error){DetailError = ('Upgrade.js: updateTimeResearch stringUpdateAllUser: ' + rowsQuery.ID_User);functions.WriteLogError(DetailError);}
		LogChange='Upgrade.js: updateTimeResearch_stringUpdateAllUser: '+rowsQuery.ID_User;functions.LogChange(LogChange);
	});
	serverUpdate.query(stringUpdateUpgrade,function (error,result) {
		if (!!error){DetailError = ('Upgrade.js: updateTimeResearch stringUpdateUpgrade: ' + rowsQuery.ID_User);functions.WriteLogError(DetailError);}
		LogChange='Upgrade.js: updateTimeResearch_stringUpdateUpgrade: '+rowsQuery.ID_User;functions.LogChange(LogChange);
	});
	serverBase.query(stringClearUpgrade,function (error,result) {
		if (!!error){DetailError = ('Upgrade.js: updateTimeResearch stringClearUpgrade: ' + rowsQuery.ID_User);functions.WriteLogError(DetailError);}
		LogChange='Upgrade.js: updateTimeResearch_stringClearUpgrade: '+rowsQuery.ID_User;functions.LogChange(LogChange);
	});
}