'use strict';

var db_all_user				= require('./../Util/Database/Db_all_user.js');

var db_s1_base_upgrade		= require('./../Util/Database/Db_s1_base_upgrade.js');
var db_s1_base_defend		= require('./../Util/Database/Db_s1_base_defend.js');

var db_s2_base_upgrade		= require('./../Util/Database/Db_s2_base_upgrade.js');
var db_s2_base_defend		= require('./../Util/Database/Db_s2_base_defend.js');

var db_position				= require('./../Util/Database/Db_position.js');
var db_training				= require('./../Util/Database/Db_training.js');
var functions 				= require('./../Util/Functions.js');

var DetailError, LogChange;
var dbDefend,dbUpgrade;
var Promise = require('promise');

exports.Start = function start (io) {
	io.on('connection', function(socket){
		socket.on('S_DEPLOY', function (data){
			S_DEPLOY (socket,data);
		});
	});
}

var dataDeploy={
	Server_ID: 1,
	ID_User: 9,
	ID_Unit: 16,
	Quality: 5,
	BaseNumber: 1
};


S_DEPLOY (dataDeploy)
function S_DEPLOY (data) {
	switch (parseInt(data.Server_ID)) {
		case 1:
		dbDefend = db_s1_base_defend;
		dbUpgrade = db_s1_base_upgrade;
		break;
		case 2:
		dbDefend = db_s2_base_defend;
		dbUpgrade = db_s2_base_upgrade;
		break;
	}

	checkUnitAvailable (dbDefend,data,function (checkBool) {
		//console.log(checkBool)
		if (checkBool) {
			sendUnitToMap (dbDefend,dbUpgrade,data);
		}else{
			DetailError = ('Deploy.js: checkUnitAvailable_ID_User: '+ data.ID_User
				+"_Quality:_"+data.Quality
				+"_BaseNumber:_"+data.BaseNumber
				+"_ID_Unit:_"+data.ID_Unit);functions.WriteLogError(DetailError,2);
		}
	});
}

function sendUnitToMap (dbDefend,dbUpgrade,data) {
	getBasePosition (data,function (resultPostion) {	
		checkPosition (data,resultPostion,function (checkBool) {
			if (checkBool) {
				getUnitLevel (data,dbUpgrade,function (returnValue) {
					data["Level"]= returnValue.Level;
					data["Hea_cur"]= returnValue.Hea_cur;
					data["Health"]= returnValue.Health;
					data["Attack"]= returnValue.Attack;
					data["Defend"]= returnValue.Defend;
					insertPosition (data,resultPostion);
					updateBaseDefend (dbDefend,data);
				});	
			}else {
				console.log("error send Unit => reload data");
			}
		});
	});
}

function getUnitLevel (data,dbUpgrade,returnResult) {
	var level,unit;
	var dataReturn={}
	var returnValue={};
	new Promise((resolve,reject)=>{
		var stringLevel = "SELECT `Level` FROM `"+data.ID_User+"_"+data.BaseNumber+"` WHERE `ID` = '"+data.ID_Unit+"'";
		dbUpgrade.query(stringLevel,function (error,rows) {
			if (rows[0].Level==0) {console.log('error Level');}
			level = rows[0].Level;
			resolve();
		});
	}).then(()=>new Promise((resolve,reject)=>{
		var stringUnit = "SELECT `Unit` FROM `unit` WHERE `ID_Unit`='"+data.ID_Unit+"'"
		db_training.query(stringUnit,function (error,rows) {
			unit = rows[0].Unit;
			resolve();			
		});
	}).then(()=>new Promise((resolve,reject)=>{
		var stringHea = "SELECT `Health`,`Attack`,`Defend` FROM `"+unit+"` WHERE `Level`='"+level+"'"
		db_training.query(stringHea,function (error,rows) {
			dataReturn.Level = level;
			dataReturn.Unit = unit;
			dataReturn.Hea_cur = rows[0].Health;
			dataReturn.Health = rows[0].Health;
			dataReturn.Attack = rows[0].Attack;
			dataReturn.Defend = rows[0].Defend;
			resolve();
		});
	}).then(()=>{
		// returnValue["Level"] = level;
		// returnValue["Hea_cur"] = Hea_cur;
		// returnValue["Health"] = Health;
		// returnValue["Attack"] = Attack;
		// returnValue["Defend"] = Defend;
		returnResult(dataReturn);
	})));
	
}


function updateBaseDefend (dbDefend,data) {	
	var stringUpdate = "UPDATE `"+data.ID_User+"` SET `Quality`=`Quality`-'"+data.Quality+"' WHERE `ID_Unit`= '"+data.ID_Unit+"' AND `BaseNumber`='"+data.BaseNumber+"'"
	dbDefend.query(stringUpdate,function (error,result) {
		if (!!error) {console.log(error);}
	});
}

function checkPosition (data,Cellposition,resultCheck) {
	var returnBool =true;
	var stringCheck = "SELECT * FROM `s1_unit` WHERE `Position_Cell`='"+Cellposition+"'";
	//console.log(stringCheck);
	db_position.query(stringCheck,function (error,rows) {
		if (rows.length>0) {returnBool = false;}
		resultCheck(returnBool);
	});
}
function insertPosition (data,Cellposition) {
	// console.log(data);
	// console.log(Cellposition);
	var stringInsert = "INSERT INTO `s1_unit`(`ID_Unit`, `Level`, `ID_User`, `BaseNumber`, `Quality`,`Hea_cur`,`Health`,`Attack`,`Defend`, `Position_Cell`) VALUES ('"
	+data.ID_Unit+"','"
	+data.Level+"','"
	+data.ID_User+"','"
	+data.BaseNumber+"','"
	+data.Quality+"','"
	+data.Hea_cur+"','"
	+data.Health+"','"
	+data.Attack+"','"
	+data.Defend+"','"
	+Cellposition
	+"');"
	//console.log(stringInsert);
	db_position.query(stringInsert,function (error,result) {
		if (!!error) {console.log(error)}
	});
}

function getBasePosition (data, returnResult) {
	var stringBase = "SELECT `Position_Cell` FROM `s"+data.Server_ID+"_position` WHERE `ID_Type`= '"+data.ID_User+"_0_"+data.BaseNumber+"'"
	db_position.query(stringBase,function (error,rows) {
		if (!!error) {console.log(error);}
		else{returnResult(rows[0].Position_Cell)}
	});

}

function checkUnitAvailable (dbDefend,data,checkBool) {
	var returnBool = false;
	var stringCheckQuality = "SELECT `Quality` FROM `"+data.ID_User+"` WHERE `ID_Unit`='"+data.ID_Unit+"' AND `BaseNumber`='"+data.BaseNumber+"'"
	dbDefend.query(stringCheckQuality,function (error,rows) {
		if (!!error) {console.log(error);}
		if (rows[0].Quality>=data.Quality) {returnBool = true;}
		checkBool(returnBool);
	});
}

