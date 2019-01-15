'use strict';

var db_all_user				= require('./../../Util/Database/Db_all_user.js');

var db_s1_base_info			= require('./../../Util/Database/Db_s1_base_info.js');
var db_s1_upgrade			= require('./../../Util/Database/Db_s1_base_upgrade.js');

var db_s2_base_info			= require('./../../Util/Database/Db_s2_base_info.js');
var db_s2_upgrade			= require('./../../Util/Database/Db_s2_base_upgrade.js');

var functions 				= require('./../../Util/Functions.js');

var Promise 				= require('promise');
var dbInfo,dbUpgrade;

var playerData ={};
var dataInfo={};

exports.R_BASE_INFO = function r_base_info (socket,ID_User,Server_ID) {
	switch (parseInt(Server_ID)) {
		case 1:
		dbInfo = db_s1_base_info;
		break;
		case 2:
		dbInfo = db_s2_base_info;
		break;
	}
	var stringQuery = "SELECT * FROM `"+ID_User+"`";
	dbInfo.query(stringQuery, function (error,rows) {
		if (!!error){DetailError = ('GetUserBase.js: query '+stringQuery); functions.WriteLogError(DetailError,2);}
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
		
		socket.emit('R_BASE_INFO',{R_BASE_INFO:dataInfo});
	});
}

exports.R_BASE_UPGRADE = function r_base_upgrade (socket,ID_User,Server_ID) {
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
	//console.log(stringQueryBaseNumber)
	dbInfo.query(stringQueryBaseNumber,function (error,rows) {
		if (!!error){DetailError = ('GetUserBase.js: stringQueryBaseNumber '+stringQueryBaseNumber); functions.WriteLogError(DetailError,2);}
		if (rows!=undefined) {
			for (var i = 0; i < rows.length; i++) {
				getBaseUpgrade (socket,dbUpgrade,ID_User,rows[i].BaseNumber);	
			}
		}
	});
}

function getBaseUpgrade (socket,dbUpgrade,ID_User,BaseNumber) {
	var queryBaseUpgrade = "SELECT * FROM `"+ID_User+"_"+BaseNumber+"`";
	//console.log(queryBaseUpgrade)
	dbUpgrade.query(queryBaseUpgrade,function(error,rows){
		if (!!error){DetailError = ('GetUserBase.js: getBaseUpgrade '+queryBaseUpgrade); functions.WriteLogError(DetailError,2);}
		delete rows.ID;
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
exports.R_BASE_PLAYER = function r_base_player (socket,ID_User,Server_ID) {
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
	var stringID = "SELECT `ID_User`,`NameInGame`,`Guild_ID`,`Might`,`Killed` FROM `game_info_s"+Server_ID+"` WHERE "+
	"`ID_User`<>"+ID_User;

	db_all_user.query(stringID, function (error,rows) {
		if (!!error){DetailError = ('GetUserBase.js: query stringID :'+ ID_User); functions.WriteLogError(DetailError,2);}
		if (rows!=undefined) {	
			for (var i = 0; i < rows.length; i++) {
				getData (socket,dbInfo,dbUpgrade,rows[i]);
			}		
		}
	});
}


function getData (socket,dbInfo,dbUpgrade,rowsData) {
	var stringQuery = "SELECT `ID_User`,`BaseNumber`,`Position` FROM `"+rowsData.ID_User+"`";
	//console.log(stringQuery);	
	dbInfo.query(stringQuery,function (error,rows) {
		if (!!error){DetailError = ('GetUserBase.js: query getData :'+ stringQuery); functions.WriteLogError(DetailError,2);}
		if (rows!=undefined) {
			//console.log(rows.length);
			for (var i = 0; i < rows.length; i++) {
				//console.log(rows[i])
				var dataPlayer = rows[i];

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
					socket.emit('R_BASE_PLAYER',{R_BASE_PLAYER:playerData});
					
					//console.log(playerData);
				});
			}
		}	
	});
}

function getUpgrade (dbUpgrade,rowsData,level) {
	var stringQuery = "SELECT `Level` From `"+rowsData.ID_User+"_"+rowsData.BaseNumber+"` WHERE `ID`= 1"
	// console.log(stringQuery);
	dbUpgrade.query(stringQuery,function(error,rows){
		if (!!error){DetailError = ('GetUserBase.js: query getUpgrade :'+ stringQuery); functions.WriteLogError(DetailError,2);}
		level(rows[0].Level);
	});
}

exports.R_PLAYER_INFO = function r_player_info (socket,ID_User,Server_ID) {
	var stringQuery = "SELECT `ID_User`,`NameInGame`,`ChatWorldColor`,`Guild_ID`,`Might`,`Killed` FROM `game_info_s"+Server_ID+"` WHERE "+
	"`ID_User`<>'"+ID_User+"'";
	//console.log(stringQuery);
	db_all_user.query(stringQuery,function (error,rows) {
		// console.log(rows);
		if (!!error){DetailError = ('GetUserBase.js: query R_PLAYER_INFO: '+ stringQuery); functions.WriteLogError(DetailError,2);}
		socket.emit('R_PLAYER_INFO',{R_PLAYER_INFO:rows});
	});
}
