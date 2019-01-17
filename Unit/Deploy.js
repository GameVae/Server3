'use strict';

var db_all_user		= require('./../Util/Database/Db_all_user.js');

var db_s1_base_info			= require('./../Util/Database/Db_s1_base_info.js');
var db_s1_base_defend		= require('./../Util/Database/Db_s1_base_defend.js');

var db_s2_base_info			= require('./../Util/Database/Db_s2_base_info.js');
var db_s2_base_defend		= require('./../Util/Database/Db_s2_base_defend.js');




var functions 		= require('./../Util/Functions.js');

var DetailError;



exports.Start = function start (io) {
	io.on('connection', function(socket){
		socket.on('S_DEPLOY', function (data){
			S_DEPLOY (socket,data);
		});
	});
}

var data={
	Server_ID: 1,
	ID_User: 9,
	Unit_ID: 16,
	Quality: 500,
};
var dbDefend;

//S_DEPLOY (data)
function S_DEPLOY (data) {
	switch (parseInt(data.Server_ID)) {
		case 1:
		dbDefend = db_s1_base_defend;
		break;
		case 2:
		dbDefend = db_s2_base_defend;
		break;
	}
	//var stringQuery = 
}