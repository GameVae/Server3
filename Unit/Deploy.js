'use strict';

var db_all_user		= require('./../Util/Database/Db_all_user.js');

var db_s1_base_info			= require('./../Util/Database/Db_s1_base_info.js');
var db_s1_base_defend		= require('./../Util/Database/Db_s1_base_defend.js');

var db_s2_base_info			= require('./../Util/Database/Db_s2_base_info.js');
var db_s2_base_defend		= require('./../Util/Database/Db_s2_base_defend.js');

var functions 		= require('./../Util/Functions.js');

var DetailError;
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
			
		}
	})
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