'use strict';

var db_all_user		= require('./../Util/Database/Db_all_user.js');
var functions 		= require('./../Util/Functions.js');

var DetailError;

var playerInfo={};

exports.Start = function start (io) {
	io.on('connection', function(socket){
		socket.on('S_INFO', function (data){
			S_INFO (socket,data);
		});
	});
}

function S_INFO (socket,data) {
	var stringServer	= "game_info_s"+parseInt(data.serverInt);
	var stringQuery 	= "SELECT * FROM `"+stringServer+"` WHERE `ID_User`="+data.ID_User;
	db_all_user.query(stringQuery,function (error,rows) {
		if (!!error){DetailError = ('GetInfo.js: S_INFO '+ data.ID_User); functions.WriteLogError(DetailError);}	
		playerInfo=rows[0];
		delete playerInfo.ID;
		delete playerInfo.Diamond;
		delete playerInfo.ChatWorldColor;
		delete playerInfo.LastGuildID;
		socket.emit('R_INFO',{R_INFO:playerInfo})
	});
}