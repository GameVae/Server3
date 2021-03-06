'use strict';

var db_s1_base_info			= require('./../Util/Database/Db_s1_base_info.js');
var db_s1_upgrade			= require('./../Util/Database/Db_s1_base_upgrade.js');

var db_s2_base_info			= require('./../Util/Database/Db_s2_base_info.js');
var db_s2_upgrade			= require('./../Util/Database/Db_s2_base_upgrade.js');

var db_all_user				= require('./../Util/Database/Db_all_user.js');
var db_upgrade_database		= require('./../Util/Database/Db_upgrade_database.js');

var upgrade_Redis 			= require('./Upgrade_Redis.js')
var functions 				= require('./../Util/Functions.js');

// var Promise 				= require('promise');
var dbUpgrade,dbBase;
var DetailError, LogChange;
var databaseTime;

var dataUpgrade={};
var DictTimeOut={};

exports.UpdateDatabase = function updateDatabase (serverInt) {
// console.log('serverInt: '+serverInt)
	var database = "s"+serverInt+"_base_info";
	var stringQuery = "SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='"+database+"' AND TABLE_NAME<>'"+database+"'";

	switch (serverInt) {
		case 1:
		dbBase = db_s1_base_info;
		dbUpgrade = db_s1_upgrade;
		break;
		case 2:
		dbBase = db_s2_base_info;
		dbUpgrade = db_s2_upgrade;
		break;
	}

	dbBase.query(stringQuery,function (error,rows) {
		if (!!error){DetailError = ('Upgrade.js: query tableDatabase: ' + serverInt);functions.WriteLogError(DetailError,1);}
		if (rows!=undefined) {
			for (var i = 0; i < rows.length; i++) {
				queryTimeData(serverInt,dbBase,dbUpgrade,rows[i].TABLE_NAME);		
			}
		}
	});
}

function queryTimeData (serverInt,dbBase,dbUpgrade, tableQuery) {
	var stringQueryBaseUpgrade = "SELECT `ID_User`,`BaseNumber`,`UpgradeWait_ID` AS LevelUp_ID ,`UpgradeWait_Might` AS Might,`UpgradeTime` AS Time FROM `"+tableQuery+"`";
	var stringQueryBaseResearch= "SELECT `ID_User`,`BaseNumber`,`ResearchWait_ID` AS LevelUp_ID ,`ResearchWait_Might` AS Might,`ResearchTime` AS Time FROM `"+tableQuery+"`";
	
	dbBase.query(stringQueryBaseUpgrade,function (error,rows) {
		//console.log(rows)
		if (!!error){DetailError = ('Upgrade.js: query queryTimeData: ' + stringQueryBaseUpgrade);functions.WriteLogError(DetailError,1);}
		for (var i = 0; i < rows.length; i++) {
			if (rows[i].Time!=null) {
				//console.log(rows[i]);
				var databaseTime = functions.ExportTimeDatabase(rows[i].Time);
				var currentTime = functions.GetTime();
				//console.log(databaseTime);
				if (databaseTime<currentTime) {
					dataUpgrade={
						ID_User: rows[i].ID_User,
						Server_ID: serverInt,
						BaseNumber: rows[i].BaseNumber,
						LevelUp_ID: rows[i].LevelUp_ID,
						Might: rows[i].Might,
						UpgradeType: 1,
						timeOut: 0,
					};
					//console.log(dataUpgrade);
				}else{
					dataUpgrade={
						ID_User: rows[i].ID_User,
						BaseNumber: rows[i].BaseNumber,
						Server_ID: serverInt,
						LevelUp_ID: rows[i].LevelUp_ID,
						Might: rows[i].Might,
						UpgradeType: 1,
						timeOut: databaseTime-currentTime,
					};
					//console.log(dataUpgrade);
				}				
				updateBase (dbBase,dbUpgrade,dataUpgrade)
			}

		}
	});
}

function updateBase (dbBase,dbUpgrade,dataUpgrade) {
	var stringTimeOut = dataUpgrade.ID_User+"_"+dataUpgrade.BaseNumber+"_"+dataUpgrade.LevelUp_ID+"_"+dataUpgrade.UpgradeType;
	//console.log(stringTimeOut)
	DictTimeOut[stringTimeOut] = setTimeout(function (dataUpgrade) {
		var stringUpdateGameInfo,stringUpdateBase, stringClearBase;

		stringUpdateGameInfo = "UPDATE `game_info_s"+dataUpgrade.Server_ID+"` SET `Might`=`Might`+"+dataUpgrade.Might+
		" WHERE `ID_User`='"+dataUpgrade.ID_User+"'";
		db_all_user.query(stringUpdateGameInfo,function (error,result) {
			if (!!error){DetailError = ('Upgrade.js: stringUpdateGameInfo: ' + stringUpdateGameInfo);functions.WriteLogError(DetailError,1);}
			LogChange='Upgrade.js: stringUpdateGameInfo '+stringUpdateGameInfo;functions.LogChange(LogChange,1);
		});

		stringUpdateBase = "UPDATE `"+dataUpgrade.ID_User+"_"+dataUpgrade.BaseNumber+"` SET `Level`=`Level`+1 WHERE "+
		"`ID`= '"+dataUpgrade.LevelUp_ID+"'";
		dbUpgrade.query(stringUpdateBase, function (error,result) {
			if (!!error){DetailError = ('Upgrade.js: stringUpdateBase: ' + stringUpdateBase);functions.WriteLogError(DetailError,1);}
			LogChange='Upgrade.js: stringUpdateBase '+stringUpdateBase;functions.LogChange(LogChange,1);
			checkUnlock (dbUpgrade,dataUpgrade);
		});

		switch (dataUpgrade.UpgradeType) {
			case 1:
			stringClearBase = "UPDATE `"+dataUpgrade.ID_User+"` SET `UpgradeWait_ID`=NULL,`UpgradeWait_Might`=NULL,`UpgradeTime`=NULL WHERE `BaseNumber`='"+dataUpgrade.BaseNumber+"'";
			break;
			case 2:
			stringClearBase ="UPDATE `"+dataUpgrade.ID_User+"` SET `ResearchWait_ID`=NULL,`ResearchWait_Might`=NULL,`ResearchTime`=NULL WHERE `BaseNumber`='"+dataUpgrade.BaseNumber+"'";
			break;
		}
		dbBase.query(stringClearBase,function (error,result) {
			if (!!error){DetailError = ('Upgrade.js: stringClearBase: ' + stringClearBase);functions.WriteLogError(DetailError,1);}
			LogChange='Upgrade.js: stringClearBase '+stringClearBase;functions.LogChange(LogChange,1);
		});

		delete DictTimeOut[stringTimeOut];

	},dataUpgrade.timeOut,dataUpgrade);
	
}

function checkUnlock (dbUpgrade,dataUpgrade) {
	var returnUnlockID = 0;
	var levelUpgrade;
	var stringQueryLevel = "SELECT `Level` FROM `"+dataUpgrade.ID_User+"_"+dataUpgrade.BaseNumber+"` WHERE "+
	"`ID`='"+dataUpgrade.LevelUp_ID+"'";
	// console.log(dataUpgrade);
	// console.log(stringQueryLevel)
	dbUpgrade.query(stringQueryLevel, function (error,rows) {
		if (!!error){DetailError = ('Upgrade.js: stringQueryLevel: ' + stringQueryLevel);functions.WriteLogError(DetailError,1);}
		
		levelUpgrade = rows[0].Level;

		var stringQuery = "SELECT * FROM `upgrade` WHERE `ID`="+dataUpgrade.LevelUp_ID;

		db_upgrade_database.query(stringQuery,function(error,rows){
			if (!!error){DetailError = ('Upgrade.js: query checkUnlock : '+ stringQuery); functions.WriteLogError(DetailError,1);}

			var tableQuery = "SELECT * FROM `"+rows[0].Name_Upgrade +"` WHERE `Level`= "+levelUpgrade;
			db_upgrade_database.query(tableQuery,function(error,rows_tableQuery){
				
				if (!!error){DetailError = ('Upgrade.js: query tableQuery : '+ tableQuery); functions.WriteLogError(DetailError,1);}
				if (rows_tableQuery[0].Unlock_ID!=0) { returnUnlockID=rows_tableQuery[0].Unlock_ID;
					var stringUpgrade = "UPDATE `"+dataUpgrade.ID_User+"_"+dataUpgrade.BaseNumber+"` SET `Level`= 1 WHERE `ID`= "+returnUnlockID;
					dbUpgrade.query(stringUpgrade,function (error,result) {

						if (!!error){DetailError = ('Upgrade.js: checkUnlock upgrade: '+ stringUpgrade); functions.WriteLogError(DetailError,1);}
						LogChange='Upgrade.js: checkUnlock upgrade: '+stringUpgrade;functions.LogChange(LogChange,1);	
					});
				}
				checkUnitInMap (dataUpgrade,levelUpgrade,rows_tableQuery[0]);
			});
		});
	});
}

function checkUnitInMap (data,levelUpgrade,rows_tableQuery) {
	if (data.ID_Upgrade<35&&data.ID_Upgrade>14) {
		var dataUnitUpgrade ={};
		dataUnitUpgrade.Health = rows_tableQuery.Health;
		dataUnitUpgrade.Attack = rows_tableQuery.Attack;
		dataUnitUpgrade.Defend = rows_tableQuery.Defend;
		
		var stringQueryUnit = "SELECT * FROM `s"+data.ID_Server+"_unit` WHERE `ID_User`='"+data.ID_User+"' AND `BaseNumber`='"+data.BaseNumber+"' AND `ID_Unit` ='"+data.ID_Upgrade+"'"
		db_positon.query(stringQueryUnit,function (error,rows) {
			if (!!error){DetailError = ('Upgrade.js: query checkUnitInMap : '+ stringQueryUnit); functions.WriteLogError(DetailError,2);}
			if (rows.length>0) {
				updateUnitInMap (data,levelUpgrade,dataUnitUpgrade);

				for (var i = 0; i < rows.length; i++) {
					upgrade_Redis.UpdateRedis_UnitInMap(data,levelUpgrade,dataUnitUpgrade,rows[i].ID)
				}
			}
		});
	}
}