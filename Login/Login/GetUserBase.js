'use strict';

var db_all_user				= require('./../../Util/Database/Db_all_user.js');

var db_s1_base_info			= require('./../../Util/Database/Db_s1_base_info.js');
var db_s1_base_defend		= require('./../../Util/Database/Db_s1_base_defend.js');
var db_s1_upgrade			= require('./../../Util/Database/Db_s1_base_upgrade.js');

var db_s2_base_info			= require('./../../Util/Database/Db_s2_base_info.js');
var db_s2_base_defend		= require('./../../Util/Database/Db_s2_base_defend.js');
var db_s2_upgrade			= require('./../../Util/Database/Db_s2_base_upgrade.js');

var functions 				= require('./../../Util/Functions.js');

var Promise 				= require('promise');
var dbInfo,dbUpgrade,dbDefend;
// var DetailError;
var playerData ={};
var dataInfo={};
var stringHkey;

var redis = require("redis"),
client = redis.createClient();
client.select(functions.RedisData.TestUnit);

exports.R_BASE_INFO = function (socket,ID_User,Server_ID) {
	functions.ShowLog(functions.ShowLogBool.Clear,'GetUserBase.js R_BASE_INFO ID_User,Server_ID',[ID_User,Server_ID]);
	switch (parseInt(Server_ID)) {
		case 1:
		dbInfo = db_s1_base_info;
		break;
		case 2:
		dbInfo = db_s2_base_info;
		break;
	}
	var stringQuery = "SELECT * FROM `"+ID_User+"`";
	functions.ShowLog(functions.ShowLogBool.Clear,'GetUserBase.js R_BASE_INFO stringQuery',[stringQuery]);
	dbInfo.query(stringQuery, function (error,rows) {
		if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'GetUserBase.js R_BASE_INFO stringQuery',[stringQuery]);}
		var currentTime = functions.GetTime();
		for (var i = 0; i < rows.length; i++) {
			if (rows[i].UpgradeTime!=null) {
				rows[i]["UpgradeTime"]= (new Date(functions.ExportTimeDatabase(rows[i].UpgradeTime))-currentTime)*0.001;// /1000
			}
			if (rows[i].ResearchTime!=null) {
				rows[i]["ResearchTime"]= (new Date(functions.ExportTimeDatabase(rows[i].ResearchTime))-currentTime)*0.001;
			}
			if (rows[i].ResearchTime!=null) {
				rows[i]["UnitTransferTime "]= (new Date(functions.ExportTimeDatabase(rows[i].UnitTransferTime))-currentTime)*0.001;
			}
			if (rows[i].TrainingTime!=null) {
				rows[i]["TrainingTime"]= (new Date(functions.ExportTimeDatabase(rows[i].TrainingTime))-currentTime)*0.001;
			}
			dataInfo = rows;
			delete dataInfo["ID"];		
		}
		functions.ShowLog(functions.ShowLogBool.Clear,'GetUserBase.js R_BASE_INFO emit dataInfo',[dataInfo]);
		socket.emit('R_BASE_INFO',{R_BASE_INFO:dataInfo});
	});
}

exports.R_BASE_UPGRADE = function (socket,ID_User,Server_ID) {
	functions.ShowLog(functions.ShowLogBool.Clear,'GetUserBase.js R_BASE_UPGRADE ID_User,Server_ID',[ID_User,Server_ID]);
	switch (parseInt(Server_ID)) {
		case 1:
		dbInfo = db_s1_base_info;
		dbUpgrade = db_s1_upgrade;
		break;
		case 2:
		dbInfo = db_s2_base_info;
		dbUpgrade = db_s2_upgrade;
		break;
	}
	var stringQueryBaseNumber = "SELECT `BaseNumber` FROM `"+ID_User+"`";
	functions.ShowLog(functions.ShowLogBool.Clear,'GetUserBase.js R_BASE_UPGRADE stringQueryBaseNumber',[stringQueryBaseNumber]);
	dbInfo.query(stringQueryBaseNumber,function (error,rows) {
		if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'GetUserBase.js R_BASE_UPGRADE stringQueryBaseNumber',[stringQueryBaseNumber]);}
		if (rows!=undefined) {
			for (var i = 0; i < rows.length; i++) {
				functions.ShowLog(functions.ShowLogBool.Clear,'GetUserBase.js R_BASE_UPGRADE=>getBaseUpgrade ID_User,rows[i].BaseNumber',[ID_User,rows[i].BaseNumber]);
				getBaseUpgrade (socket,dbUpgrade,ID_User,rows[i].BaseNumber);	
			}
		}
	});
}

function getBaseUpgrade (socket,dbUpgrade,ID_User,BaseNumber) {
	functions.ShowLog(functions.ShowLogBool.Clear,'GetUserBase.js getBaseUpgrade ID_User,BaseNumber',[ID_User,BaseNumber]);
	var queryBaseUpgrade = "SELECT * FROM `"+ID_User+"_"+BaseNumber+"`";
	functions.ShowLog(functions.ShowLogBool.Clear,'GetUserBase.js getBaseUpgrade queryBaseUpgrade',[queryBaseUpgrade]);
	dbUpgrade.query(queryBaseUpgrade,function(error,rows){
		if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'GetUserBase.js getBaseUpgrade queryBaseUpgrade',[queryBaseUpgrade]);}
		delete rows.ID;
		// var dataSend = {
		// 	ID_User: ID_User,
		// 	BaseNumber: BaseNumber,
		// 	R_BASE_UPGRADE: rows
		// }
		functions.ShowLog(functions.ShowLogBool.Clear,'GetUserBase.js getBaseUpgrade queryBaseUpgrade',[queryBaseUpgrade]);
		socket.emit('R_BASE_UPGRADE',{
			ID_User: ID_User,
			BaseNumber: BaseNumber,
			R_BASE_UPGRADE: rows
		})
		// console.log(data)
	});
	// var data ={
	// 	ID_User: ID_User,
	// 	BaseNumber: baseNumber,
	// 	R_BASE_UPGRADE: rowsUpgrade[0]
	// }
}

exports.R_BASE_PLAYER  = function (socket,ID_User,Server_ID){
	functions.ShowLog(functions.ShowLogBool.Clear,'GetUserBase.js R_BASE_PLAYER queryBaseUpgrade',[queryBaseUpgrade]);
	switch (parseInt(Server_ID)) {
		case 1:
		dbInfo = db_s1_base_info;
		dbUpgrade = db_s1_upgrade;
		break;
		case 2:
		dbInfo = db_s2_base_info;
		dbUpgrade = db_s2_upgrade;
		break;
	}

	var playerData ={};
	stringHkey = "s"+Server_ID+"_base_info";
	functions.ShowLog(functions.ShowLogBool.Clear,'GetUserBase.js R_BASE_PLAYER stringHkey',[stringHkey]);
	new Promise((resolve,reject)=>{
		client.del(stringHkey,function (error,result) {
			resolve();
		});
	}).then(()=>new Promise((resolve,reject)=>{
		var stringID = "SELECT `ID_User`,`NameInGame` FROM `game_info_s"+Server_ID+"` WHERE `ID_User`<>'"+ID_User+"'"
		functions.ShowLog(functions.ShowLogBool.Clear,'GetUserBase.js R_BASE_PLAYER stringID',[stringID]);
		db_all_user.query(stringID, function (error,rows) {
			if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'GetUserBase.js R_BASE_PLAYER stringID',[stringID]);}
			if (rows!=undefined) {
				playerData =rows;
				for (var i = 0; i < rows.length; i++) {
					var stringKey = rows[i].ID_User;
					functions.ShowLog(functions.ShowLogBool.Clear,'GetUserBase.js R_BASE_PLAYER hset stringHkey,rows[i].ID_User,JSON.stringify(rows[i])',[stringHkey,rows[i].ID_User,JSON.stringify(rows[i])]);
					client.hset(stringHkey,rows[i].ID_User,JSON.stringify(rows[i]))
				}
				resolve();
			}
		});
	}).then(()=>new Promise((resolve,reject)=>{		
		for (var i = 0; i < playerData.length; i++) {
			var dataInfo = playerData[i];
			functions.ShowLog(functions.ShowLogBool.Clear,'GetUserBase.js R_BASE_PLAYER=>getBaseInfo dataInfo)',[dataInfo]);
			getBaseInfo (dbInfo,dataInfo,resolve)	
		}		
	}).then(()=>new Promise((resolve,reject)=>{
		functions.ShowLog(functions.ShowLogBool.Clear,'GetUserBase.js R_BASE_PLAYER hkeys stringHkey)',[stringHkey]);
		client.hkeys(stringHkey,function (error,rows) {
			for (var i = 0; i < rows.length; i++) {
				functions.ShowLog(functions.ShowLogBool.Clear,'GetUserBase.js R_BASE_PLAYER hkeys=>getUpgrade rows[i])',[rows[i]]);
				getUpgrade (dbUpgrade,rows[i],resolve)
			}			
		})
	}).then(()=> {
		functions.ShowLog(functions.ShowLogBool.Clear,'GetUserBase.js hkeys=>getBasePlayerData stringHkey)',[stringHkey]);
		getBasePlayerData (socket,stringHkey);
	})
	)));
}

function getBasePlayerData (socket,stringHkey) {
	var array=[]
	functions.ShowLog(functions.ShowLogBool.Clear,'GetUserBase.js getBasePlayerData stringHkey)',[stringHkey]);
	client.hkeys(stringHkey,function (error,rows) {
		client.hvals(stringHkey,function (error,rowsAll) {
			for (var i = 0; i < rowsAll.length; i++) {
				array.push(JSON.parse(rowsAll[i]))
			}
			functions.ShowLog(functions.ShowLogBool.Clear,'GetUserBase.js getBasePlayerData emit R_BASE_PLAYER array)',[array]);
			socket.emit('R_BASE_PLAYER',{R_BASE_PLAYER:array});
		})
	})
}

function getUpgrade (dbUpgrade,ID_User,resolve) {
	var stringQuery = "SELECT `Level` From `"+ID_User+"_1"+"` WHERE `ID`= 1"
	// console.log(stringQuery);
	dbUpgrade.query(stringQuery,function(error,rowsLevel){
		if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'GetUserBase.js getBasePlayerData emit R_BASE_PLAYER array)',[array]);}
		if (rowsLevel!=undefined) {
			client.hget(stringHkey,ID_User,function (error,rows) {
				var result = JSON.parse(rows);
				result.Level = rowsLevel[0].Level;
				client.hset(stringHkey,ID_User,JSON.stringify(result));
				resolve();
			})		
		}
	});
}

function getBaseInfo (dbInfo,playerData,resolve) {
	var stringQuery = "SELECT `BaseNumber`,`Position` FROM `"+playerData.ID_User+"`";
	dbInfo.query(stringQuery,function (error,rowsBaseInfo) {
		if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'GetUserBase.js getBaseInfo stringQuery)',[stringQuery]);}
		if (rowsBaseInfo!=undefined) {
			functions.ShowLog(functions.ShowLogBool.Clear,'GetUserBase.js getBaseInfo hget stringHkey,playerData.ID_User)',[stringHkey,playerData.ID_User]);
			client.hget(stringHkey,playerData.ID_User,function (error,rows) {
				var result = JSON.parse(rows);
				result.Position = rowsBaseInfo[0].Position;
				result.BaseNumber = rowsBaseInfo[0].BaseNumber;
				functions.ShowLog(functions.ShowLogBool.Clear,'GetUserBase.js getBaseInfo hset stringHkey,playerData.ID_User,JSON.stringify(result))',[stringHkey,playerData.ID_User,result]);
				client.hset(stringHkey,playerData.ID_User,JSON.stringify(result));

				resolve();
			})			
		}
	});
}

function getData (socket,dbInfo,dbUpgrade,rowsData) {
	var stringQuery = "SELECT `ID_User`,`BaseNumber`,`Position` FROM `"+rowsData.ID_User+"`";
	functions.ShowLog(functions.ShowLogBool.Clear,'GetUserBase.js getData dbUpgrade,rowsData)',[dbUpgrade,rowsData]);
	
	dbInfo.query(stringQuery,function (error,rows) {
		if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'GetUserBase.js getData dbUpgrade,rowsData)',[dbUpgrade,rowsData]);}
		if (rows!=undefined) {
			//console.log(rows.length);
			var dataSend =  rows;
			for (var i = 0; i < rows.length; i++) {
				//console.log(rows[i])
				var dataPlayer = rows[i];
				functions.ShowLog(functions.ShowLogBool.Clear,'GetUserBase.js getData=>getUpgrade rows[i])',[rows[i]]);

				getUpgrade (dbUpgrade,rows[i],function (level) {
					playerData={
						ID_User: dataPlayer.ID_User,
						NameInGame: rowsData.NameInGame,
						Guild_ID: rowsData.Guild_ID,
						Might: rowsData.Might,
						Killed: rowsData.Killed,
						BaseNumber: dataPlayer.BaseNumber,
						Level: level,
						Position: dataPlayer.Position
					}
					functions.ShowLog(functions.ShowLogBool.Clear,'GetUserBase.js getData getUpgrade emit R_BASE_PLAYER playerData',[rows[i],playerData]);
					socket.emit('R_BASE_PLAYER',{R_BASE_PLAYER:playerData});
					
					//console.log(playerData);
				});
			}
			//socket.emit('R_BASE_PLAYER',{R_BASE_PLAYER:dataSend});
		}	
	});
}

exports.R_PLAYER_INFO = function (socket,ID_User,Server_ID) {
	var stringQuery = "SELECT `ID_User`,`NameInGame`,`ChatWorldColor`,`Guild_ID`,`Guild_Name`,`Might`,`Killed` FROM `game_info_s"+Server_ID+"` WHERE "+
	"`ID_User`<>'"+ID_User+"'";
	
	functions.ShowLog(functions.ShowLogBool.Clear,'GetUserBase.js R_PLAYER_INFO ID_User,Server_ID,stringQuery',[ID_User,Server_ID,stringQuery]);
	db_all_user.query(stringQuery,function (error,rows) {
		// console.log(rows);
		if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'GetUserBase.js R_PLAYER_INFO ID_User,Server_ID,stringQuery',[ID_User,Server_ID,stringQuery]);}
		functions.ShowLog(functions.ShowLogBool.Clear,'GetUserBase.js R_PLAYER_INFO emit rows',[rows]);
		socket.emit('R_PLAYER_INFO',{R_PLAYER_INFO:rows});
	});
}


//R_BASE_DEFEND (9,1);
exports.R_BASE_DEFEND = function (socket,ID_User,Server_ID) {
	switch (Server_ID) {
		case 1:
		dbDefend = db_s1_base_defend;
		break;
		case 2:
		dbDefend = db_s2_base_defend;
		break;
	}
	
	var stringQuery = "SELECT * FROM `"+ID_User+"` ORDER BY `BaseNumber` ASC ";
	dbDefend.query(stringQuery,function (error,rows) {
		if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'GetUserBase.js R_BASE_DEFEND stringQuery',[stringQuery]);}
		functions.ShowLog(functions.ShowLogBool.Error,'GetUserBase.js R_BASE_DEFEND emit rows',[rows]);
		socket.emit('R_BASE_DEFEND',{R_BASE_DEFEND:rows});
	});
}