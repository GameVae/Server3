'use strict';

var db_friend		= require('./../Util/Database/Db_all_friend.js');
var db_all_user		= require('./../Util/Database/Db_all_user.js');
var functions 		= require('./../Util/Functions.js');


var Promise 		= require('promise')
var DetailError, LogChange;
var data_user_info={};

exports.Start = function start (io) {
	io.on('connection', function(socket){
		socket.on('S_SEARCH_PLAYER', function (data){
			S_SEARCH_PLAYER (socket,data);
		});
	});
}

var data={
	NameInGame: 'uan'
}
function S_SEARCH_PLAYER (socket,data) {
	var stringQuery = "SELECT `ID_User`,`NameInGame`,`Server_ID` FROM `user_info` WHERE `NameInGame` LIKE '%"+data.NameInGame+"%';"
	//console.log(stringQuery)
	new Promise((resolve,result)=>{
		db_all_user.query(stringQuery,function (error,rows) {
			if (!!error){DetailError = ('Search.js: query '+stringQuery); functions.WriteLogError(DetailError,1);}
			if (rows.length>0) {
				data_user_info=rows;
				resolve();			
			}
		});
	}).then(()=>{
		// console.log(data_user_info);	
		for (var i = 0; i < data_user_info.length; i++) {
			var stringInfo = "SELECT * FROM `game_info_s"+data_user_info[i].Server_ID+
			"` WHERE `ID_User`='"+data_user_info[i].ID_User+"'";
			//console.log(stringInfo);
			db_all_user.query(stringInfo, function (error,rows) {
				if (!!error){DetailError = ('Search.js: query '+stringInfo); functions.WriteLogError(DetailError,1);}
				delete rows.ID;
				delete rows.LastGuildID;
				//console.log(rows)
				socket.emit('R_SEARCH_PLAYER',{R_SEARCH_PLAYER:rows})
			});
		}
	});
}
