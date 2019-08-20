'use strict';

var db_s1_base_info			= require('./../Util/Database/Db_s1_base_info.js');
var db_s1_upgrade			= require('./../Util/Database/Db_s1_base_upgrade.js');

var db_s2_base_info			= require('./../Util/Database/Db_s2_base_info.js');
var db_s2_upgrade			= require('./../Util/Database/Db_s2_base_upgrade.js');

var db_all_user				= require('./../Util/Database/Db_all_user.js');
var db_all_harvest			= require('./../Util/Database/Db_all_harvest.js');
var db_positon 				= require('./../Util/Database/Db_position.js');
var db_upgrade_database		= require('./../Util/Database/Db_upgrade_database.js');

var upgrade_Redis 			= require ('./Upgrade_Redis.js')

var functions 				= require('./../Util/Functions.js');

// var Promise 				= require('promise');
var dbUpgrade,dbBase;
var DetailError, LogChange;

var DictTimeOut={};

// var dataIns = {
// 	ID_Server:'1',
// 	ID_User: '9',
// 	BaseNumber: '1',
// 	ID_Upgrade: '1',
// 	UpgradeType:'1',
// 	Level:'1'
// }

/*level nào thì lấy tài nguyên level đó nâng cấp lên lv1=>lv2 lấy tài nguyên hao tốn cùng hàng lv1*/
exports.Start = function start (io) {
	io.on('connection', function(socket){
		socket.on('S_UPGRADE', function (data){
			//console.log('socketID: '+socket.id);
			S_UPGRADE (data);
		});
		// socket.on('S_UPGRADE_SPEEDUP',function (data) {
		// 	S_UPGRADE_SPEEDUP(socket,data);
		// });
	});
}
// S_UPGRADE (dataIns);
function S_UPGRADE (data) {
	//console.log(data);
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

	var stringQuery ="SELECT * FROM `s"+data.ID_Server+"_base_info`.`"+data.ID_User+"` INNER JOIN `s"+data.ID_Server
	+"_base_upgrade`.`"+data.ID_User+"_"+data.BaseNumber+"` WHERE `BaseNumber`='"+data.BaseNumber
	+"' AND `s"+data.ID_Server+"_base_upgrade`.`"+data.ID_User+"_"+data.BaseNumber+"`.`ID`="+data.ID_Upgrade+";"
	// console.log(stringQuery);
	dbBase.query(stringQuery,function (error,rows) {
		if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'Upgrade.js S_UPGRADE stringQuery',[stringQuery]);}
		if (parseInt(data.UpgradeType)==1 && rows[0].UpgradeTime==null) {
			if (data.Level==rows[0].Level||data.Level==0) {
				functions.ShowLog(functions.ShowLogBool.Check,'Upgrade.js S_UPGRADE=>materialCalc1 data,rows[0]',[data,rows[0]]);
				materialCalc (dbBase,data,rows[0]);
			}
		}else if (parseInt(data.UpgradeType)==2 && rows[0].ResearchTime==null) {
			if (data.Level==rows[0].Level||data.Level==0) {
				functions.ShowLog(functions.ShowLogBool.Check,'Upgrade.js S_UPGRADE=>materialCalc2 data,rows[0]',[data,rows[0]]);
				materialCalc (dbBase,data,rows[0]);
			}
		}
	});
}

function materialCalc (dbBase,data,rowUpgrade) {
	var stringMaterial = "SELECT * FROM `"+rowUpgrade.Name_Upgrade+"` WHERE `Level`= "+data.Level;
	functions.ShowLog(functions.ShowLogBool.Check,'Upgrade.js materialCalc stringMaterial',[stringMaterial]);
	db_upgrade_database.query(stringMaterial,function (error,rows) {
		if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'Upgrade.js materialCalc stringMaterial',[stringMaterial]);}
		functions.ShowLog(functions.ShowLogBool.Check,'Upgrade.js materialCalc=>checkMaterial data,rows[0]',[data,rows[0]]);
		checkMaterial (dbBase,data,rows[0]);
	});
}

function checkMaterial (dbBase,data,rowsMaterial) {
	var stringQuery = "SELECT `Farm`,`Wood`,`Stone`,`Metal` FROM `"+data.ID_User+"` WHERE `ID`="+data.BaseNumber;
	functions.ShowLog(functions.ShowLogBool.Check,'Upgrade.js checkMaterial data,rowsMaterial,stringQuery',[data,rowsMaterial,stringQuery]);
	dbBase.query(stringQuery,function (error,rows) {
		if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'Upgrade.js checkMaterial stringQuery',[stringQuery]);}

		if (rows[0].Farm<rowsMaterial.FoodCost||rows[0].Wood<rowsMaterial.WoodCost||rows[0].Stone<rowsMaterial.StoneCost||rows[0].Metal<rowsMaterial.MetalCost){
			functions.ShowLog(functions.ShowLogBool.Check,'Upgrade.js checkMaterial -fail material-reset scene-not enough rss data,rowsMaterial',[data,rowsMaterial]);
			// console.log('fail material-reset scene-not enough rss');
		}else{
			updateUserMaterial (dbBase,data,rowsMaterial);
			updateBaseUser (dbBase,data,rowsMaterial);
		}
	});
}

function updateUserMaterial (dbBase,data,rowsMaterial) {
	var stringUpdateUser = "UPDATE `"+data.ID_User+"` SET"+
	" `Farm`=`Farm` - '"+rowsMaterial.FoodCost+
	"', `Wood`=`Wood` - '"+rowsMaterial.WoodCost+
	"', `Stone`=`Stone` - '"+rowsMaterial.StoneCost+
	"', `Metal`=`Metal` - '"+rowsMaterial.MetalCost+
	"' WHERE `ID` = "+data.BaseNumber;
	//console.log(stringUpdateUser);
	dbBase.query(stringUpdateUser,function (error,result) {
		if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'Upgrade.js checkMaterial updateUserMaterial stringUpdateUser',[stringUpdateUser]);}
		functions.ShowLog(functions.ShowLogBool.LogChange,'Upgrade.js checkMaterial updateUserMaterial stringUpdateUser',[stringUpdateUser]);
	});
}

function updateBaseUser (dbBase,data,rowUpgrade) {	
	var stringUpgrade;
	var timeUpgrade = functions.GetTime()+rowUpgrade.TimeInt*1000;
	var stringTime = new Date(timeUpgrade).toISOString();

	var upgradeTime = functions.ImportTimeToDatabase(stringTime);
	functions.ShowLog(functions.ShowLogBool.Check,'Upgrade.js updateBaseUser data,rowUpgrade,timeUpgrade,stringTime,upgradeTime',[data,rowUpgrade,timeUpgrade,stringTime,upgradeTime]);
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
	functions.ShowLog(functions.ShowLogBool.Check,'Upgrade.js updateBaseUser stringUpgrade',[stringUpgrade]);
	dbBase.query(stringUpgrade,function (error,result) {
		if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'Upgrade.js updateBaseUser stringUpgrade',[stringUpgrade]);}
		functions.ShowLog(functions.ShowLogBool.LogChange,'Upgrade.js updateBaseUser stringUpgrade',[stringUpgrade]);
		functions.ShowLog(functions.ShowLogBool.Check,'Upgrade.js updateBaseUser=>setTimerUpdateDatabase rowUpgrade.TimeInt*1000,data',[rowUpgrade.TimeInt*1000,data]);
		setTimerUpdateDatabase (rowUpgrade.TimeInt*1000,data);
	});
}

function setTimerUpdateDatabase (timeOut,data) {

	var stringTimeOut = data.ID_User+"_"+data.BaseNumber+"_"+data.ID_Upgrade+"_"+data.UpgradeType;
	//console.log("stringTimeOut: "+stringTimeOut)
	functions.ShowLog(functions.ShowLogBool.Check,'Upgrade.js setTimerUpdateDatabase timeOut,data,stringTimeOut',[timeOut,data,stringTimeOut]);
	DictTimeOut[stringTimeOut] = setTimeout(function (data) {
		var stringQueryMightBonus,stringUpdateBaseInfo, stringUpdate_Game_info, stringUpdateBaseUpgrade;
		var queryUser = "SELECT `Server_ID` FROM `user_info` WHERE `ID_User`="+data.ID_User;

		functions.ShowLog(functions.ShowLogBool.Check,'Upgrade.js setTimerUpdateDatabase queryUser',[queryUser]);
		
		db_all_user.query(queryUser,function (error,rows) {
			if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'Upgrade.js setTimerUpdateDatabase queryUser',[queryUser]);}

			if (rows!=undefined) {
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

				switch (parseInt(data.UpgradeType)) {
					case 1:
					stringQueryMightBonus = "SELECT `UpgradeWait_Might` AS Might FROM `"+data.ID_User+"` WHERE `BaseNumber` = "+ data.BaseNumber;
					stringUpdateBaseInfo = "UPDATE `"+data.ID_User+"` SET `UpgradeWait_ID`= NULL,"
					+" `UpgradeWait_Might`= NULL,"
					+" `UpgradeTime`= NULL WHERE `BaseNumber` = "+ data.BaseNumber;
					//console.log('stringQueryMightBonus2: '+stringQueryMightBonus)
					break;
					case 2:
					stringQueryMightBonus = "SELECT `ResearchWait_Might` AS Might FROM `"+data.ID_User+"` WHERE `BaseNumber` = "+ data.BaseNumber;
					stringUpdateBaseInfo = "UPDATE `"+data.ID_User+"` SET `ResearchWait_ID`= NULL,"
					+" `ResearchWait_Might`= NULL,"
					+" `ResearchTime`= NULL WHERE `BaseNumber` = "+ data.BaseNumber;
					//console.log('stringQueryMightBonus3: '+stringQueryMightBonus)
					break;
				}

				functions.ShowLog(functions.ShowLogBool.Check,'Upgrade.js setTimerUpdateDatabase=>checkUnlock data',[dbUpgrade,data]);
				checkUnlock (dbUpgrade,data);

				stringUpdateBaseUpgrade ="UPDATE `"+data.ID_User+"_"+data.BaseNumber+"` SET `Level`=`Level`+1 WHERE `ID` = "+ data.ID_Upgrade;
				functions.ShowLog(functions.ShowLogBool.Check,'Upgrade.js setTimerUpdateDatabase ',[stringUpdateBaseUpgrade]);

				dbUpgrade.query(stringUpdateBaseUpgrade,function (error,result) {
					if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'Upgrade.js setTimerUpdateDatabase stringUpdateBaseUpgrade',[stringUpdateBaseUpgrade]);}
					functions.ShowLog(functions.ShowLogBool.LogChange,'Upgrade.js setTimerUpdateDatabase stringUpdateBaseUpgrade',[stringUpdateBaseUpgrade]);
				});
				
				//console.log("stringQueryMightBonus: "+stringQueryMightBonus)
				dbBase.query(stringQueryMightBonus,function(error,rows){
					if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'Upgrade.js setTimerUpdateDatabase stringQueryMightBonus',[stringQueryMightBonus]);}
					
					stringUpdate_Game_info = "UPDATE `game_info_s"+data.ID_Server+"` SET `Might`=`Might`+'"+rows[0].Might+"' WHERE `ID_User`='"+data.ID_User+"'";
					functions.ShowLog(functions.ShowLogBool.Check,'Upgrade.js setTimerUpdateDatabase stringUpdate_Game_info',[stringUpdate_Game_info]);

					db_all_user.query(stringUpdate_Game_info,function (error,result_stringUpdate_Game_info) {
						if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'Upgrade.js setTimerUpdateDatabase stringUpdate_Game_info',[stringUpdate_Game_info]);}
						functions.ShowLog(functions.ShowLogBool.Check,'Upgrade.js setTimerUpdateDatabase stringUpdate_Game_info',[stringUpdate_Game_info]);
					});

				});

				dbBase.query(stringUpdateBaseInfo,function(error,result){
					if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'Upgrade.js setTimerUpdateDatabase stringUpdateBaseInfo',[stringUpdateBaseInfo]);}
					functions.ShowLog(functions.ShowLogBool.Check,'Upgrade.js setTimerUpdateDatabase stringUpdateBaseInfo',[stringUpdateBaseInfo]);
				});
				
				functions.ShowLog(functions.ShowLogBool.Error,'Upgrade.js setTimerUpdateDatabase delete DictTimeOut[stringTimeOut]',[stringTimeOut]);
				delete DictTimeOut[stringTimeOut];
			}
		});	
	},timeOut,data);

}

function checkUnlock (dbUpgrade,data) {
	var returnUnlockID = 0;
	var levelUpgrade = parseInt(data.Level)+1;
	//console.log(levelUpgrade)
	var stringQuery = "SELECT * FROM `upgrade` WHERE `ID`="+data.ID_Upgrade;

	db_upgrade_database.query(stringQuery,function(error,rows){
		if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'Upgrade.js checkUnlock stringQuery',[stringQuery]);}

		var tableQuery = "SELECT * FROM `"+rows[0].Name_Upgrade +"` WHERE `Level`= "+levelUpgrade;
		functions.ShowLog(functions.ShowLogBool.Check,'Upgrade.js checkUnlock tableQuery',[tableQuery]);
		
		db_upgrade_database.query(tableQuery,function(error,rows_tableQuery){
			if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'Upgrade.js checkUnlock tableQuery',[tableQuery]);}
			
			if (rows_tableQuery[0].Unlock_ID!=0) { 
				returnUnlockID = rows_tableQuery[0].Unlock_ID;				
				var stringUpgrade = "UPDATE `"+data.ID_User+"_"+data.BaseNumber+"` SET `Level`= 1 WHERE `ID`= '"+returnUnlockID+"'";
				dbUpgrade.query(stringUpgrade,function (error,result) {					
					if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'Upgrade.js checkUnlock stringUpgrade',[stringUpgrade]);}
					functions.ShowLog(functions.ShowLogBool.LogChange,'Upgrade.js checkUnlock stringUpgrade',[stringUpgrade]);
				});
			}
			functions.ShowLog(functions.ShowLogBool.Check,'Upgrade.js checkUnlock=>checkUnitInMap stringUpgrade',[stringUpgrade]);
			checkUnitInMap (data,levelUpgrade,rows_tableQuery[0]);
			checkUpgradeResource(data,levelUpgrade,rows_tableQuery[0]);
		});
	});
}

function checkUpgradeResource (data,levelUpgrade,rows_tableQuery) {
	functions.ShowLog(functions.ShowLogBool.Check,'Upgrade.js checkUpgradeResource data,levelUpgrade,rows_tableQuery',[data,levelUpgrade,rows_tableQuery]);
	if (data.ID_Upgrade<15&&data.ID_Upgrade>1) {
		if (data.UpgradeType==2) {
			/*
			di query loai upgrade => update loai nao
			*/
			var stringUpdate = "UPDATE `9` SET `Level`='"+levelUpgrade+"',`Harvest`=[value-7],`MaxStore`=[value-8] WHERE `ID_Upgrade`=''"
		}
	}
}

function checkUnitInMap (data,levelUpgrade,rows_tableQuery) {
	functions.ShowLog(functions.ShowLogBool.Check,'Upgrade.js checkUnitInMap data,levelUpgrade,rows_tableQuery',[data,levelUpgrade,rows_tableQuery]);
	functions.ShowLog(functions.ShowLogBool.Check,'Upgrade.js checkUnitInMap data.ID_Upgrade',[data.ID_Upgrade]);

	if (data.ID_Upgrade<35&&data.ID_Upgrade>14) {
		var dataUnitUpgrade ={};
		dataUnitUpgrade.Health = rows_tableQuery.Health;
		dataUnitUpgrade.Attack = rows_tableQuery.Attack;
		dataUnitUpgrade.Defend = rows_tableQuery.Defend;
		
		var stringQueryUnit = "SELECT * FROM `s"+data.ID_Server+"_unit` WHERE `ID_User`='"+data.ID_User+"' AND `BaseNumber`='"+data.BaseNumber+"' AND `ID_Unit` ='"+data.ID_Upgrade+"'"
		db_positon.query(stringQueryUnit,function (error,rows) {
			if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'Upgrade.js checkUnitInMap stringQueryUnit',[stringQueryUnit]);}
			if (rows.length>0) {
				functions.ShowLog(functions.ShowLogBool.Check,'Upgrade.js checkUnitInMap=>updateUnitInMap data,levelUpgrade,dataUnitUpgrade',[data,levelUpgrade,dataUnitUpgrade])
				updateUnitInMap (data,levelUpgrade,dataUnitUpgrade);
				for (var i = 0; i < rows.length; i++) {
					functions.ShowLog(functions.ShowLogBool.Check,'Upgrade.js checkUnitInMap=>upgrade_Redis.UpdateRedis_UnitInMap data,levelUpgrade,dataUnitUpgrade,rows[i].ID',[data,levelUpgrade,dataUnitUpgrade,rows[i].ID]);
					upgrade_Redis.UpdateRedis_UnitInMap(data,levelUpgrade,dataUnitUpgrade,rows[i].ID);
				}
			}
		});
	}
}

function updateUnitInMap (data,levelUpgrade,dataUnitUpgrade) {
	var stringUpdate = "UPDATE `s1_unit` SET `Level`= '"+levelUpgrade
	+"', `Health`= '"+dataUnitUpgrade.Health
	+"',`Attack`= '"+dataUnitUpgrade.Attack
	+"',`Defend`='"+dataUnitUpgrade.Defend
	+"' WHERE `ID_Unit` ='"+data.ID_Upgrade
	+"' AND `ID_User`='"+data.ID_User
	+"' AND `BaseNumber`='"+data.BaseNumber+"';"
	functions.ShowLog(functions.ShowLogBool.Check,'Upgrade.js updateUnitInMap data,levelUpgrade,dataUnitUpgrade,stringUpdate',[data,levelUpgrade,dataUnitUpgrade,stringUpdate]);
	db_positon.query(stringUpdate,function (error,result) {
		if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'Upgrade.js updateUnitInMap stringUpdate',[stringUpdate]);}
		functions.ShowLog(functions.ShowLogBool.Check,'Upgrade.js updateUnitInMap stringUpdate',[stringUpdate]);
	});
}