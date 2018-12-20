'use strict';

var db_s1_base_info			= require('./../Util/Database/Db_s1_base_info.js');
var db_s1_upgrade			= require('./../Util/Database/Db_s1_base_upgrade.js');

var db_s2_base_info			= require('./../Util/Database/Db_s2_base_info.js');
var db_s2_upgrade			= require('./../Util/Database/Db_s2_base_upgrade.js');

var db_all_user				= require('./../Util/Database/Db_all_user.js');
var db_upgrade				= require('./../Util/Database/Db_upgrade_database.js');


var functions 				= require('./../Util/Functions.js');


var DetailError, LogChange;
var arraySetTimeOut = exports.ArraySetTimeOut = [];

// exports.Start = function start (io) {
// 	io.on('connection', function(socket){
// 		getS1Pos ();
// 		socket.on('S_UPGRADE', function (data){
// 			//console.log('socketID: '+socket.id);
// 			S_UPGRADE (socket,data);
// 		});
// 	});
// }
var data = {
	ID_Server:'1',
	ID_User: '9',
	ID_Base: '1',
	ID_Upgrade: '1',
	Level:'2'
}
// function S_UPGRADE (socket,data) {
// 	console.log('S_UPGRADE'+ data);
// }




function S_UPGRADE (data) {
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
	//console.log(stringQuery);
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
		//setTimerUpdateDatabase (owsUpgrade[0].TimeInt*1000,dataUser,upgradeType);
	});

}
//S_UPGRADE (data);
test(data,1);
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
			})

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
	var thisTime = setTimeout(function (dataUser,upgradeType) {
		var dbQuery;
		var stringQuery = "SELECT * FROM `user_info` WHERE `ID_User`="+dataUser.ID_User;
		db_all_user.query(stringQuery, function (error,rows) {
			console.log(error);
			console.log(rows);
		});

		// var stringUpdate;
		// switch (upgradeType) {
		// 	case 1:
		// 	stringUpdate = "UPDATE `"+dataUser.ID_User+"` SET `UpgradeWait_ID`= NULL,"
		// 	+" `UpgradeWait_Might`= NULL,"
		// 	+" `UpgradeTime`= NULL;";
		// 	console.log(stringUpdate);
		// 	break;
		// 	case 2:
		// 	stringUpdate = "UPDATE `"+dataUser.ID_User+"` SET `ResearchWait_ID`= NULL,"
		// 	+" `ResearchWait_Might`= NULL,"
		// 	+" `ResearchTime`= NULL;";
		// 	break;
		// }
		// dbQuery.query(stringUpdate,function (error,result) {
		// 	console.log(error);
		// 	console.log(result);
		// });
		
	},time, dataUser,upgradeType);
	arraySetTimeOut.push(thisTime);
}




function clearTimer (param) {
	clearTimeout(arraySetTimeOut.find(item=>item._timerArgs==param));
	arraySetTimeOut = arraySetTimeOut.filter(item=>item._timerArgs==param);
}
