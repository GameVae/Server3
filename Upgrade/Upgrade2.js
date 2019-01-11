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

var dataIns = {
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
S_UPGRADE (dataIns)
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

				switch (parseInt(data.UpgradeType)) {
					case 1:
					stringQueryMightBonus = "SELECT `UpgradeWait_Might` AS Might FROM `"+data.ID_User+"` WHERE `BaseNumber` = "+ data.BaseNumber;
					stringUpdateBaseInfo = "UPDATE `"+data.ID_User+"` SET `UpgradeWait_ID`= NULL,"
					+" `UpgradeWait_Might`= NULL,"
					+" `UpgradeTime`= NULL WHERE `BaseNumber` = "+ data.BaseNumber;
					console.log('stringQueryMightBonus2: '+stringQueryMightBonus)
					break;
					case 2:
					stringQueryMightBonus = "SELECT `ResearchWait_Might` AS Might FROM `"+data.ID_User+"` WHERE `BaseNumber` = "+ data.BaseNumber;
					stringUpdateBaseInfo = "UPDATE `"+data.ID_User+"` SET `ResearchWait_ID`= NULL,"
					+" `ResearchWait_Might`= NULL,"
					+" `ResearchTime`= NULL WHERE `BaseNumber` = "+ data.BaseNumber;
					console.log('stringQueryMightBonus3: '+stringQueryMightBonus)
					break;
				}

				checkUnlock (data);

				stringUpdateBaseUpgrade ="UPDATE `"+data.ID_User+"_"+data.BaseNumber+"` SET `Level`=`Level`+1 WHERE `ID` = "+ data.ID_Upgrade;
				console.log('stringUpdateBaseUpgrade '+stringUpdateBaseUpgrade);
				dbUpgrade.query(stringUpdateBaseUpgrade,function (error,result) {
					if (!!error){DetailError = ('Upgrade.js: updateLevel' + data.ID_User);functions.WriteLogError(DetailError);}
					LogChange='Upgrade.js: updateLevel: '+data.ID_User;functions.LogChange(LogChange);
				});

				
				console.log("stringQueryMightBonus: "+stringQueryMightBonus)
				dbBase.query(stringQueryMightBonus,function(error,rows){
					stringUpdate_Game_info = "UPDATE `game_info_s"+data.ID_Server+"` SET `Might`=`Might`+'"+rows[0].Might+"' WHERE `ID`='"+data.ID_User+"'";
					console.log("stringUpdate_Game_info: "+stringUpdate_Game_info);
					db_all_user.query(stringUpdate_Game_info,function (error,result_stringUpdate_Game_info) {
						if (!!error){DetailError = ('Upgrade.js: updateMight ' + data.ID_User);functions.WriteLogError(DetailError);}
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

			if (rows_tableQuery[0].Unlock_ID!=0) { returnUnlockID=rows_tableQuery[0].Unlock_ID;

				var stringUpdate = "UPDATE `"+data.ID_User+"_"+data.BaseNumber+"` SET `Level`= 1 WHERE `ID`= "+returnUnlockID;
				dbUpgrade.query(stringUpgrade,function (error,result) {

				});
			}
			
		});
	});

}

// function checkBoolUpgrade (data,dbUpgrade,checkBool) {
// 	var returnBool = false;
// 	var tableQuery = data.ID_User+"_"+data.BaseNumber;

// 	var stringQuery = "SELECT `Level` FROM `"+tableQuery+"` WHERE `ID`="+data.ID_Upgrade;
// 	//console.log('stringQuery:checkBoolUpgrade '+stringQuery);
// 	dbUpgrade.query(stringQuery, function (error,rows) {
// 		if (!!error){DetailError = ('Upgrade.js: query checkBoolUpgrade' + data.ID_User);functions.WriteLogError(DetailError);}
// 		if (parseInt(rows[0].Level)==parseInt(data.Level)||rows[0].Level==0) {
// 			returnBool = true;
// 		}
// 		console.log('returnBool: '+returnBool)
// 		checkBool(returnBool);
// 	});
// }
