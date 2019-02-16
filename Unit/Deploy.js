'use strict';

var db_all_user		= require('./../Util/Database/Db_all_user.js');

var db_s1_base_info			= require('./../Util/Database/Db_s1_base_info.js');
var db_s1_base_defend		= require('./../Util/Database/Db_s1_base_defend.js');

var db_s2_base_info			= require('./../Util/Database/Db_s2_base_info.js');
var db_s2_base_defend		= require('./../Util/Database/Db_s2_base_defend.js');

var db_position				= require('./../Util/Database/Db_position.js');

var functions 				= require('./../Util/Functions.js');

var DetailError, LogChange;
var dbDefend;


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
		break;
		case 2:
		dbDefend = db_s2_base_defend;
		break;
	}

	checkUnitAvailable (dbDefend,data,function (checkBool) {
		//console.log(checkBool)
		if (checkBool) {
			sendUnitToMap (dbDefend,data);
		}else{
			DetailError = ('Deploy.js: checkUnitAvailable_ID_User: '+ data.ID_User
				+"_Quality:_"+data.Quality
				+"_BaseNumber:_"+data.BaseNumber
				+"_ID_Unit:_"+data.ID_Unit);functions.WriteLogError(DetailError,2);
		}
	});
}

function sendUnitToMap (dbDefend,data) {
	getBasePosition (data,function (resultPostion) {	
		checkPosition (data,resultPostion,function (checkBool) {
			if (checkBool) {
				insertPosition (data,resultPostion);
				updateBaseDefend (dbDefend,data);
			}else {
				console.log("error send Unit => reload data")
			}
		});
	});
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
	var stringInsert = "INSERT INTO `s1_unit`(`ID_Unit`, `ID_User`, `BaseNumber`, `Quality`, `Position_Cell`) VALUES ('"
	+data.ID_Unit+"','"
	+data.ID_User+"','"
	+data.BaseNumber+"','"
	+data.Quality+"','"
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

