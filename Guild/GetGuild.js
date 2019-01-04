'use strict';

var db_all_user		= require('./../Util/Database/Db_all_user.js');
var functions 		= require('./../Util/Functions.js');

var DetailError, LogChange;

var timeAccept 		= 24*60*60*60*1000;
var timeUnfriend 	= 8*60*60*60*1000;
var timeOut;

var diamondCreatGuild = 500;

exports.Start = function start (io) {
	// io.on('connection', function(socket){
	// 	socket.on('S_ADD_FRIEND', function (data){
	// 		//console.log('socketID: '+socket.id);
	// 		S_ADD_FRIEND (socket,data);
	// 	});
	// 	socket.on('S_ACCEPT_FRIEND',function (data) {
	// 		S_ACCEPT_FRIEND(socket,data);
	// 	});
	// 	socket.on('S_UNFRIEND',function (socket,data) {
	// 		S_UNFRIEND(socket,data);
	// 	});

	// });
}

var data ={
	GuildTag: 	'ABC',
	GuildName: 	'123456',
	ID_User: 	9,
	serverInt: 	1,
}

S_CREATE_GUILD (data);

function S_CREATE_GUILD (data) {
	checkDiamond(data,function (checkBool) {
		if(checkBool==true){

		}else{
			console.log("reload client");
		}
	});
}

function checkDiamond (data,checkBool) {
	var returnBool = false;
	var stringQuery = "SELECT `Diamond` FROM `user_info` WHERE `ID_User`="+data.ID_User;
	db_all_user.query(stringQuery,function (error,rows) {
		if (rows[0].Diamond>=diamondCreatGuild) {
			returnBool=true;
		}
		checkBool(returnBool);
	});
}