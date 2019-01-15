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

var DictTimeOut={};

var data = {
	ID_Server:'1',
	ID_User: '9',
	BaseNumber: '1',
	ID_Upgrade: '1',
	UpgradeType:'1',
	Level:'1'
}
/*level nào thì lấy tài nguyên level đó nâng cấp lên lv1=>lv2 lấy tài nguyên hao tốn cùng hàng lv1*/
exports.Start = function start (io) {
	io.on('connection', function(socket){
		socket.on('S_UPGRADE', function (data){
			//console.log('socketID: '+socket.id);
			S_UPGRADE (socket,data);
		});
		// socket.on('S_UPGRADE_SPEEDUP',function (data) {
		// 	S_UPGRADE_SPEEDUP(socket,data);
		// });
	});
}

// function S_UPGRADE_SPEEDUP(socket,dataUser) {
// 	var stringClearTimeout = dataUser.ID_User+"_"+dataUser.BaseNumber+"_"+dataUser.ID_Upgrade+"_"+upgradeType;
// 	//clearTimeout(DictTimeOut[stringClearTimeout]);
// }
// S_UPGRADE (data)
function S_UPGRADE (socket,data) {
	console.log(data);
	switch (parseInt(data.ID_Server)) {
		case 1:
		dbBase = db_s1_base_info;
		dbUpgrade = db_s1_upgrade;	
		break;
		case 2:
		dbBase = db_s2_base_info;
		dbUpgrade = db_s2_upgrade;
		break;
	}
	//var stringQuery = "SELECT * FROM `"+data.ID_User+"_"+data.BaseNumber+"` WHERE `ID` ="+data.ID_Upgrade;
	var stringQuery ="SELECT * FROM `s"+data.ID_Server+"_base_info`.`"+data.ID_User+"` INNER JOIN `s"+data.ID_Server
	+"_base_upgrade`.`"+data.ID_User+"_"+data.BaseNumber+"` WHERE `BaseNumber`="+data.BaseNumber
	+" AND `s"+data.ID_Server+"_base_upgrade`.`"+data.ID_User+"_"+data.BaseNumber+"`.`ID`="+data.ID_Upgrade+";"
	//console.log(stringQuery);
	dbBase.query(stringQuery,function (error,rows) {
		//console.log(rows);
		if (parseInt(data.UpgradeType)==1 && rows[0].UpgradeTime==null) {
			if (data.Level==rows[0].Level||data.Level==0) {
				materialCalc (dbBase,data,rows[0]);
			}
		}else if (parseInt(data.UpgradeType)==2 && rows[0].ResearchTime==null) {
			if (data.Level==rows[0].Level||data.Level==0) {
				materialCalc (dbBase,data,rows[0]);
			}
		}else {
			console.log(false);
		}
	});
}

function materialCalc (dbBase,data,rowUpgrade) {
	//console.log(rowUpgrade.Name_Upgrade);
	var stringMaterial = "SELECT * FROM `"+rowUpgrade.Name_Upgrade+"` WHERE `Level`= "+data.Level;
	// console.log(stringMaterial);
	db_upgrade_database.query(stringMaterial,function (error,rows) {
		if (!!error){DetailError = ('Upgrade.js: tableQuery' + data.ID_User);functions.WriteLogError(DetailError);}
		//updateUserMaterial (dbBase,data,rows[0]);		
		checkMaterial (dbBase,data,rows[0]);
	});
}

function checkMaterial (dbBase,data,rowsMaterial) {

	var stringQuery = "SELECT `Farm`,`Wood`,`Stone`,`Metal` FROM `"+data.ID_User+"` WHERE `ID`="+data.BaseNumber;
	
	dbBase.query(stringQuery,function (error,rows) {
		
		if (rows[0].Farm<rowsMaterial.FoodCost||rows[0].Wood<rowsMaterial.WoodCost||rows[0].Stone<rowsMaterial.StoneCost||rows[0].Metal<rowsMaterial.MetalCost){
			console.log('fail material reset scene');
		}else{
			updateUserMaterial (dbBase,data,rowsMaterial);
			updateBaseUser (dbBase,data,rowsMaterial);
		}
	});
}

function updateUserMaterial (dbBase,data,rowsMaterial) {
	console.log(rowsMaterial);

	var stringUpdateUser = "UPDATE `"+data.ID_User+"` SET"+
	" `Farm`=`Farm` - '"+rowsMaterial.FoodCost+
	"', `Wood`=`Wood` - '"+rowsMaterial.WoodCost+
	"', `Stone`=`Stone` - '"+rowsMaterial.StoneCost+
	"', `Metal`=`Metal` - '"+rowsMaterial.MetalCost+
	"' WHERE `ID` = "+data.BaseNumber;
	//console.log(stringUpdateUser);
	dbBase.query(stringUpdateUser,function (error,result) {

	});
}

function updateBaseUser (dbBase,data,rowUpgrade) {
	// console.log(data);
	// console.log(rowUpgrade);
	
	var stringUpgrade;
	var timeUpgrade = functions.GetTime()+rowUpgrade.TimeInt*1000;
	var stringTime = new Date(timeUpgrade).toISOString();

	var upgradeTime = functions.ImportTimeToDatabase(stringTime);

	switch (parseInt(data.UpgradeType)) {
		case 1:
		stringUpgrade = "UPDATE `"+data.ID_User+"` SET `UpgradeWait_ID`="+data.ID_Upgrade+","
		+" `UpgradeWait_Might`="+rowUpgrade.MightBonus+","
		+" `UpgradeTime`='"+upgradeTime+"' WHERE `BaseNumber`="+data.BaseNumber+";";
		break;
		case 2:
		stringUpdate = "UPDATE `"+data.ID_User+"` SET `ResearchWait_ID`="+data.ID_Upgrade+","
		+" `ResearchWait_Might`="+rowUpgrade.MightBonus+","
		+" `ResearchTime`='"+upgradeTime+"' WHERE `BaseNumber`="+data.BaseNumber+";";
		break;
	}
	
	dbBase.query(stringUpgrade,function (error,result) {
		setTimerUpdateDatabase (rowUpgrade.TimeInt*1000,data);
	});

	//setTimerUpdateDatabase (rowUpgrade.TimeInt*1000,data);

}

function setTimerUpdateDatabase (timeOut,data) {

	var stringTimeOut = data.ID_User+"_"+data.BaseNumber+"_"+data.ID_Upgrade+"_"+data.UpgradeType;
	//console.log("stringTimeOut: "+stringTimeOut)
	DictTimeOut[stringTimeOut] = setTimeout(function (data) {

		var stringQueryMightBonus,stringUpdateBaseInfo, stringUpdate_Game_info, stringUpdateBaseUpgrade;
		var queryUser = "SELECT `Server_ID` FROM `user_info` WHERE `ID_User`="+data.ID_User;

		db_all_user.query(queryUser,function (error,rows) {
			if (rows!=undefined) {
				//console.log("here: ")
				
				
				switch (rows[0].Server_ID) {
					case 1:
					dbBase = db_s1_base_info;
					dbUpgrade = db_s1_upgrade;	
					break;
					case 2:
					dbBase = db_s2_base_info;
					dbUpgrade = db_s2_upgrade;
					break;
				}

				checkBoolUpgrade (data,dbUpgrade,function (checkBool){
					if (checkBool==true) {
						switch (data.UpgradeType) {
							case 1:
							stringQueryMightBonus = "SELECT `UpgradeWait_Might` AS Might FROM `"+data.ID_User+"` WHERE `BaseNumber` = "+ data.BaseNumber;
							stringUpdateBaseInfo = "UPDATE `"+data.ID_User+"` SET `UpgradeWait_ID`= NULL,"
							+" `UpgradeWait_Might`= NULL,"
							+" `UpgradeTime`= NULL WHERE `BaseNumber` = "+ data.BaseNumber;
							break;
							case 2:
							stringQueryMightBonus = "SELECT `ResearchWait_Might` AS Might FROM `"+data.ID_User+"` WHERE `BaseNumber` = "+ data.BaseNumber;
							stringUpdateBaseInfo = "UPDATE `"+data.ID_User+"` SET `ResearchWait_ID`= NULL,"
							+" `ResearchWait_Might`= NULL,"
							+" `ResearchTime`= NULL WHERE `BaseNumber` = "+ data.BaseNumber;
							break;
						}

						checkUnlock (data,function (unlockID) {
							if (unlockID!=0) {
								var stringUpdate = "UPDATE `"+data.ID_User+"_"+data.BaseNumber+"` SET `Level`= 1 WHERE `ID`= "+unlockID;
								dbUpgrade.query(stringUpgrade,function (error,result) {

								});
							}
						});

						stringUpdateBaseUpgrade ="UPDATE `"+data.ID_User+"_"+data.BaseNumber+"` SET `Level`=`Level`+1 WHERE `ID` = "+ data.ID_Upgrade;
						console.log('stringUpdateBaseUpgrade '+stringUpdateBaseUpgrade);
						dbUpgrade.query(stringUpdateBaseUpgrade,function (error,result) {
							if (!!error){DetailError = ('Upgrade.js: updateLevel' + data.ID_User);functions.WriteLogError(DetailError);}
							LogChange='Upgrade.js: updateLevel: '+data.ID_User;functions.LogChange(LogChange);
						});

						stringUpdate_Game_info = "UPDATE `game_info_s"+rows[0].Server_ID+"` SET `Might`=`Might`+";
						dbBase.query(stringQueryMightBonus,function(error,rows){
							stringUpdate_Game_info =+rows[0].Might;
							console.log("stringUpdate_Game_info: "+stringUpdate_Game_info);
							db_all_user.query(stringUpdate_Game_info,function (error,result_stringUpdate_Game_info) {
								if (!!error){DetailError = ('Upgrade.js: updateMight' + data.ID_User);functions.WriteLogError(DetailError);}
								LogChange='Upgrade.js: updateMight: '+data.ID_User;functions.LogChange(LogChange);
							});
						});

						dbBase.query(stringUpdateBaseInfo,function(error,result){
							if (!!error){DetailError = ('Upgrade.js: resetBaseInfoUpdate' + data.ID_User);functions.WriteLogError(DetailError);}
							LogChange='Upgrade.js: resetBaseInfoUpdate: '+data.ID_User;functions.LogChange(LogChange);
						});

						delete DictTimeOut[stringTimeOut];

					}

				});

			}
		});	
	},timeOut,data);
	
}

function checkUnlock (data) {
	var returnUnlockID = 0;
	var levelUpgrade = parseInt(data.Level)+1;
	//console.log(levelUpgrade)
	var stringQuery = "SELECT * FROM `upgrade` WHERE `ID`="+data.ID_Upgrade;

	db_upgrade_database.query(stringQuery,function(error,rows){
		//console.log(rows);
		var tableQuery = "SELECT * FROM `"+rows[0].Name_Upgrade +"` WHERE `Level`= "+levelUpgrade;
		db_upgrade_database.query(tableQuery,function(error,rows_tableQuery){

			if (rows_tableQuery[0].Unlock_ID!=0) { returnUnlockID=rows_tableQuery[0].Unlock_ID;}
			// unlockID(returnUnlockID);
			if (unlockID!=0) {
				var stringUpdate = "UPDATE `"+data.ID_User+"_"+data.BaseNumber+"` SET `Level`= 1 WHERE `ID`= "+unlockID;
				
				dbUpgrade.query(stringUpgrade,function (error,result) {

				});
			}
		});
	});

}

function checkBoolUpgrade (data,dbUpgrade,checkBool) {
	var returnBool = false;
	var tableQuery = data.ID_User+"_"+data.BaseNumber;

	var stringQuery = "SELECT `Level` FROM `"+tableQuery+"` WHERE `ID`="+data.ID_Upgrade;
	dbUpgrade.query(stringQuery, function (error,rows) {
		if (!!error){DetailError = ('Upgrade.js: query checkBoolUpgrade' + data.ID_User);functions.WriteLogError(DetailError);}
		if (parseInt(rows[0].Level)==parseInt(data.Level)||rows[0].Level==0) {
			returnBool = true;
		}
		checkBool(returnBool);
	});
}

exports.UpdateDatabase = function updateDatabase (serverInt) {
	var database = "s"+serverInt+"_base_info";
	var stringQuery = "SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='"+database+"' AND TABLE_NAME<>'"+database+"'";
	//console.log(stringQuery);

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
				updateTime(serverInt,dbBase,dbUpgrade,rows[i].TABLE_NAME);		
			}
		}

	});
}

function updateTime (serverInt,dbBase,dbUgrade, tableQuery) {
	//need fix
	var stringQueryBaseUpgrade = "SELECT `ID_User`,`BaseNumber`,`UpgradeWait_ID` AS LevelUp_ID ,`UpgradeWait_Might` AS Might,`UpgradeTime` AS Time FROM `"+tableQuery+"`";
	var stringQueryBaseResearch= "SELECT `ID_User`,`BaseNumber`,`ResearchWait_ID` AS LevelUp_ID ,`ResearchWait_Might` AS Might,`ResearchTime` AS Time FROM `"+tableQuery+"`";

	var currentTime = functions.GetTime();
	var dataTime, dataUpgrade;

	dbBase.query(stringQueryBaseUpgrade,function (error,rows) {	
		if (!!error){DetailError = ('Upgrade.js: query stringQueryBaseUpgrade: ' + tableQuery);functions.WriteLogError(DetailError);}		
		for (var i = 0; i < rows.length; i++) {
			if (rows[i].Time!=null) {
				dataTime = functions.ExportTimeDatabase(rows[i].Time);
				if (dataTime<currentTime) {
					updateTimeUpgrade (serverInt,dbBase,dbUgrade,rows[i]);
				}else{
					getDataLevel (dbUgrade,rows[i].ID_User,rows[i].BaseNumber,rows[i].LevelUp_ID,function (LevelUpgrade) {
						dataUpgrade = {
							ID_Server: serverInt,
							ID_User: rows[i].ID_User,
							BaseNumber: rows[i].BaseNumber,
							ID_Upgrade: rows[i].UpgradeWait_ID,
							Level: LevelUpgrade+1,
						}
						var timeOut = dataTime-currentTime;
						//console.log(dataUpgrade);
						setTimerUpdateDatabase (timeOut,dataUpgrade)
					});

				}
			}
		}
	});

	dbBase.query(stringQueryBaseResearch,function (error,rows) {	
		if (!!error){DetailError = ('Upgrade.js: query stringQueryBaseResearch: ' + tableQuery);functions.WriteLogError(DetailError);}
		for (var i = 0; i < rows.length; i++) {
			if (rows[i].Time!=null) {
				dataTime = functions.ExportTimeDatabase(rows[i].Time);
				if (dataTime<currentTime) {
					updateTimeResearch (serverInt,dbBase,dbUpgrade,rows[i]);
				}else{
					//getDataLevel (dbUgrade,ID_User,BaseNumber,ID_Upgrade,LevelUpgrade)
					getDataLevel (dbUgrade,rows[i].ID_User,rows[i].BaseNumber,rows[i].LevelUp_ID,function (LevelUpgrade) {
						dataUpgrade = {
							ID_Server: serverInt,
							ID_User: rows[i].ID_User,
							BaseNumber: rows[i].BaseNumber,
							ID_Upgrade: rows[i].ResearchWait_ID,
							Level: LevelUpgrade+1,
						}
						var timeOut = dataTime-currentTime;
						//console.log(dataUpgrade);
						setTimerUpdateDatabase (timeOut,dataUpgrade);
					});
				}
			}
		}
	});
}

function updateTimeUpgrade (serverInt,serverBase,dbUpgrade,rowsQuery) {
	//console.log("here")
	var stringUpdateAllUser = "UPDATE `game_info_s"+serverInt+"` SET `Might` = `Might`+"+rowsQuery.Might+" WHERE `ID`="+rowsQuery.ID_User;
	var stringUpdateUpgrade = "UPDATE `"+rowsQuery.ID_User+"_"+rowsQuery.BaseNumber+"` SET `Level`=`Level`+1 WHERE `ID`="+rowsQuery.LevelUp_ID;
	var stringClearUpgrade = "UPDATE `s"+serverInt+"_base_info`.`"+rowsQuery.ID_User+"` SET `UpgradeWait_ID`= NULL ,`UpgradeWait_Might`= NULL,`UpgradeTime`= NULL";
	// console.log(stringUpdateAllUser)
	// console.log(stringUpdateUpgrade)
	// console.log(stringClearUpgrade)
	db_all_user.query(stringUpdateAllUser,function (error,result) {
		if (!!error){DetailError = ('Upgrade.js: updateTimeUpgrade stringUpdateAllUser: ' + rowsQuery.ID_User);functions.WriteLogError(DetailError);}
		LogChange='Upgrade.js: updateTimeUpgrade_stringUpdateAllUser: '+rowsQuery.ID_User;functions.LogChange(LogChange);
	});
	dbUpgrade.query(stringUpdateUpgrade,function (error,result) {
		if (!!error){DetailError = ('Upgrade.js: updateTimeUpgrade stringUpdateUpgrade: ' + rowsQuery.ID_User);functions.WriteLogError(DetailError);}
		LogChange='Upgrade.js: updateTimeUpgrade_stringUpdateUpgrade: '+rowsQuery.ID_User;functions.LogChange(LogChange);
	});
	serverBase.query(stringClearUpgrade,function (error,result) {
		if (!!error){DetailError = ('Upgrade.js: updateTimeUpgrade stringClearUpgrade: ' + rowsQuery.ID_User);functions.WriteLogError(DetailError);}
		LogChange='Upgrade.js: updateTimeUpgrade_stringClearUpgrade: '+rowsQuery.ID_User;functions.LogChange(LogChange);
	});
}

function updateTimeResearch (serverInt,serverBase,dbUpgrade,rowsQuery) {
	var stringUpdateAllUser = "UPDATE `game_info_s"+serverInt+"` SET `Might` = `Might`+"+rowsQuery.Might;
	var stringUpdateUpgrade = "UPDATE `"+rowsQuery.ID_User+"_"+rowsQuery.BaseNumber+"` SET `Level`=`Level`+1 WHERE `ID`="+rowsQuery.LevelUp_ID;
	var stringClearUpgrade = "UPDATE `s"+serverInt+"_base_info`.`"+rowsQuery.ID_User+"` SET `ResearchWait_ID`= NULL ,`ResearchWait_Might`= NULL,`ResearchTime`= NULL";

	db_all_user.query(stringUpdateAllUser,function (error,result) {
		if (!!error){DetailError = ('Upgrade.js: updateTimeResearch stringUpdateAllUser: ' + rowsQuery.ID_User);functions.WriteLogError(DetailError);}
		LogChange='Upgrade.js: updateTimeResearch_stringUpdateAllUser: '+rowsQuery.ID_User;functions.LogChange(LogChange);
	});
	dbUpgrade.query(stringUpdateUpgrade,function (error,result) {
		if (!!error){DetailError = ('Upgrade.js: updateTimeResearch stringUpdateUpgrade: ' + rowsQuery.ID_User);functions.WriteLogError(DetailError);}
		LogChange='Upgrade.js: updateTimeResearch_stringUpdateUpgrade: '+rowsQuery.ID_User;functions.LogChange(LogChange);
	});
	serverBase.query(stringClearUpgrade,function (error,result) {
		if (!!error){DetailError = ('Upgrade.js: updateTimeResearch stringClearUpgrade: ' + rowsQuery.ID_User);functions.WriteLogError(DetailError);}
		LogChange='Upgrade.js: updateTimeResearch_stringClearUpgrade: '+rowsQuery.ID_User;functions.LogChange(LogChange);
	});
}

function getDataLevel (dbUgrade,ID_User,BaseNumber,ID_Upgrade,LevelUpgrade) {
	var stringQuery = "SELECT `Level` FROM `"+ID_User+"_"+BaseNumber+"` WHERE `ID`="+ID_Upgrade;
	console.log("getDataLevel: "+stringQuery);
	dbUgrade.query(stringQuery,function (error,rows) {

		LevelUpgrade(rows[0].Level);
	});
}
