'use strict';

var db_s1_base_info			= require('./../Util/Database/Db_s1_base_info.js');
var db_s1_upgrade			= require('./../Util/Database/Db_s1_base_upgrade.js');

var db_s2_base_info			= require('./../Util/Database/Db_s2_base_info.js');
var db_s2_upgrade			= require('./../Util/Database/Db_s2_base_upgrade.js');

var db_all_user				= require('./../Util/Database/Db_all_user.js');
var db_upgrade_database		= require('./../Util/Database/Db_upgrade_database.js');


var functions 				= require('./../Util/Functions.js');

// var Promise 				= require('promise');
var dbUpgrade,dbBase;
var DetailError, LogChange;
var databaseTime;

var dataUpgrade={};
var DictTimeOut={};

exports.UpdateDatabase;

updateDatabase (1)
function updateDatabase (serverInt) {


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
		if (!!error){DetailError = ('Upgrade.js: query tableDatabase: ' + serverInt);functions.WriteLogError(DetailError);}
		if (rows!=undefined) {
			for (var i = 0; i < rows.length; i++) {
				queryTimeData(serverInt,dbBase,dbUpgrade,rows[i].TABLE_NAME);		
			}
		}

	});
}

function queryTimeData (serverInt,dbBase,dbUgrade, tableQuery) {
	//console.log(tableQuery);
	var stringQueryBaseUpgrade = "SELECT `ID_User`,`BaseNumber`,`UpgradeWait_ID` AS LevelUp_ID ,`UpgradeWait_Might` AS Might,`UpgradeTime` AS Time FROM `"+tableQuery+"`";
	var stringQueryBaseResearch= "SELECT `ID_User`,`BaseNumber`,`ResearchWait_ID` AS LevelUp_ID ,`ResearchWait_Might` AS Might,`ResearchTime` AS Time FROM `"+tableQuery+"`";
	// console.log(stringQueryBaseUpgrade);
	// console.log(stringQueryBaseResearch);
	

	dbBase.query(stringQueryBaseUpgrade,function (error,rows) {
		//console.log(rows)
		for (var i = 0; i < rows.length; i++) {
			if (rows[i].Time!=null) {
				//console.log(rows[i]);
				var databaseTime = functions.ExportTimeDatabase(rows[i].Time);
				var currentTime = functions.GetTime();
				//console.log(databaseTime);

				if (databaseTime<currentTime) {
					dataUpgrade={
						ID_User: rows[i].ID_User,
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
						LevelUp_ID: rows[i].LevelUp_ID,
						Might: rows[i].Might,
						UpgradeType: 1,
						timeOut: databaseTime-currentTime,
					};
					//console.log(dataUpgrade);
				}

				updateBase (dbBase,dbUgrade,dataUpgrade)
			}

		}
	});
}


function updateBase (dbBase,dbUgrade,dataUpgrade) {
	var stringTimeOut = dataUpgrade.ID_User+"_"+dataUpgrade.BaseNumber+"_"+dataUpgrade.LevelUp_ID+"_"+dataUpgrade.UpgradeType;
	//console.log(stringTimeOut)
	DictTimeOut[stringTimeOut] = setTimeout(function (dataUpgrade) {
var 
	},dataUpgrade.timeOut,dataUpgrade);
	//console.log(DictTimeOut);
}