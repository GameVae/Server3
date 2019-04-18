'use strict';

var db_all_user		= require('./../Util/Database/Db_all_user.js');
var functions 		= require('./../Util/Functions.js');

var DetailError,LogChange;

var playerInfo={};

var redis = require("redis"),
client = redis.createClient();
client.select(functions.RedisData.TestUnit);

var Promise = require('promise');

exports.Test = function Test (pa) {
	console.log(pa)
}
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
		if (!!error){DetailError = ('GetInfo.js: S_INFO '+ data.ID_User); functions.WriteLogError(DetailError,2);}	
		playerInfo=rows[0];
		delete playerInfo.ID;
		delete playerInfo.Diamond;
		delete playerInfo.ChatWorldColor;
		delete playerInfo.LastGuildID;
		socket.emit('R_INFO',{R_INFO:playerInfo})
	});
}

exports.UpdateMight_Kill = function updateMight_Kill (QualityLost,dataAttack,dataDefend) {
	var Server_ID = dataDefend.split("_")[0];
	var defend_ID = dataDefend.split("_")[2];

	var stringUpdateDefend = "UPDATE `game_info_s"+Server_ID+"` SET `Lost`= `Lost`+ '"+QualityLost+"' WHERE `ID_User`='"+defend_ID+"'";
	db_all_user.query(stringUpdateDefend,function (error,result) {
		if (!!error){DetailError = ('GetInfo.js: UpdateMight_Kill stringUpdateDefend '+stringUpdateDefend); functions.WriteLogError(DetailError,2);}		
	});

	for (var i = 0; i < dataAttack.length; i++) {
		var stringUpdateAttack = dataAttack[i].split("_")[2];
		var attack_ID = dataAttack[i].split("_")[2];
		var stringUpdateAttack = "UPDATE `game_info_s"+Server_ID+"` SET `Killed`= `Killed`+ '"+QualityLost+"' WHERE `ID_User`='"+attack_ID+"'";
		db_all_user.query(stringUpdateAttack,function (error,result) {
			if (!!error){DetailError = ('GetInfo.js: UpdateMight_Kill stringUpdateAttack'+ stringUpdateAttack); functions.WriteLogError(DetailError,2);}
		});
	}

	updateMightLost (Server_ID,QualityLost,dataDefend)
}

function updateMightLost (Server_ID,QualityLost,dataDefend) {
	var stringHKey = "unit_Might";
	var defend_ID = dataDefend.split("_")[2];
	var stringKUnit = dataDefend.split("_")[1];
	var mightLost=0;
	new Promise((resolve,reject)=>{
		client.hget(stringHKey,stringKUnit,function (errorr,rows) {
			var result = JSON.parse(rows);
			mightLost = QualityLost * result.MightBonus;
			resolve();
		})
	}).then(()=> new Promise((resolve,reject)=>{
		var stringUpdateMightLost = "UPDATE `game_info_s"+Server_ID+"` SET `Might`=`Might`-'"+mightLost+"' WHERE `ID_User`='"+defend_ID+"'"
		db_all_user.query(stringUpdateMightLost,function (error,result) {
			if (!!error){DetailError = ('GetInfo.js: updateMightLost: '+ stringUpdateMightLost); functions.WriteLogError(DetailError,2);}
			resolve();
		});
	})
	)
}