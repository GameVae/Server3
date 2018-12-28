'use strict';
var db_s1_base_info			= require('./../Util/Database/Db_s1_base_info.js');
var db_s1_base_defend		= require('./../Util/Database/Db_s1_base_defend.js');


var db_s2_base_info			= require('./../Util/Database/Db_s2_base_info.js');
var db_s2_base_defend		= require('./../Util/Database/Db_s2_base_defend.js');

var db_training				= require('./../Util/Database/Db_training.js');

var db_all_user				= require('./../Util/Database/Db_all_user.js');

var functions 				= require('./../Util/Functions.js');

var Promise 				= require('promise');

var DetailError, LogChange;

exports.Start = function start (io) {
	io.on('connection', function(socket){
		socket.on('S_TRAINING', function (data){
			//console.log('socketID: '+socket.id);
			S_TRAINING (socket,data);
		});
	});
}

var data={
	ID_User: 	9,
	Server_ID: 	1,
	BaseNumber: 1,
	ID_Unit: 	1,
	Level: 		1,
	Quality: 	500,
}

var dataTraining={};
var materialCost={};
var trainingTime,mightBonus,trainingTimeOut;
var dbUpgrade,dbBase,dbDefend;

//S_TRAINING(data);


function S_TRAINING (data) {
	var stringQuery = "SELECT * FROM `unit` WHERE `ID`="+data.ID_Unit;
	return new Promise((resolve,reject)=>{
		getTrainingTime (stringQuery,data,resolve)
	}).then(()=>{
		return new Promise((resolve,reject)=>{
			getMightBonus (stringQuery,data,resolve)	
		});
	}).then(()=>{
		return new Promise((resolve,reject)=>{
			calcCost (stringQuery,data,resolve)	
		});
	}).then(()=>{
		dataTraining={
			Server_ID: 			data.Server_ID,
			ID_User: 			data.ID_User,
			BaseNumber: 		data.BaseNumber,
			TrainingUnit_ID: 	data.ID_Unit,
			TrainingTime: 		trainingTime,
			TrainingQuality: 	data.Quality,
			TrainingMight: 		mightBonus,
		}
		updateDatabaseTraining(materialCost,dataTraining);
		
	}).then(()=>{
		setTimeout(function (dataTraining) {
			setTimeUpdate (dataTraining);
		},trainingTimeOut , dataTraining);
		
	});
}

function setTimeUpdate (dataTraining) {
	var queryServer = "SELECT `Server_ID` FROM `user_info` WHERE `ID_User` ="+dataTraining.ID_User;
	db_all_user.query(queryServer,function (error,rowsQueryServer) {

		if (!!error){DetailError = ('Training.js: setTimeUpdate user_info ' + dataTraining.ID_User);functions.WriteLogError(DetailError);}
		
		switch (rowsQueryServer[0].Server_ID) {
			case 1:
			dbBase 		= db_s1_base_info;
			dbDefend 	= db_s1_base_defend;
			break;
			case 2:
			dbBase 		= db_s2_base_info;
			dbDefend 	= db_s2_base_defend;
			break;
		}

		var stringQuery = "SELECT * FROM `"+dataTraining.ID_User+"` WHERE "+
		"`BaseNumber`="+dataTraining.BaseNumber+" AND"+
		"`TrainingUnit_ID`="+dataTraining.TrainingUnit_ID+" AND"+
		"`TrainingTime`="+functions.ImportTimeToDatabase(dataTraining.TrainingTime)+" AND"+
		"`TrainingQuality`="+dataTraining.TrainingQuality+" AND"+
		"`Training_Might`="+dataTraining.Training_Might;

		dbBase.query(stringQuery,function (error,rows) {
			if (!!error){DetailError = ('Training.js: setTimeUpdate ' + dataTraining.ID_User);functions.WriteLogError(DetailError);}
			if (rows!=undefined) {
				updateBaseDefend(dbDefend,dataTraining);
				clearBaseInfo(dbBase,dataTraining);
			}
		});
	});
	
}

function clearBaseInfo (dbBase,dataTraining) {
	var clearString = "UPDATE `"+dataTraining.ID_User+"` SET "+
	"`TrainingUnit_ID` = null, `TrainingTime`=null, `TrainingQuality`=null,`Training_Might`=null"
	+" WHERE `BaseNumber` = "+dataTraining.BaseNumber;
	dbBase.query(clearString,function (error,result) {
		if (!!error){DetailError = ('Training.js: clearBaseInfo' + dataTraining.ID_User);functions.WriteLogError(DetailError);}
		LogChange='Training.js: clearBaseInfo '+dataTraining.ID_User;functions.LogChange(LogChange);
	});
}

function updateBaseDefend (dbDefend,dataTraining) {
	var stringQuery = "SELECT * FROM `"+dataTraining.ID_User+"` WHERE "+
	"`BaseNumber` = "+dataTraining.BaseNumber+" AND"+
	"`UnitType` = "+dataTraining.ID_Unit;
	var query_updateBaseDefend;
	dbDefend.query(stringQuery,function (error,rows) {
		if (!!error){DetailError = ('Training.js: query updateBaseDefend ' + dataTraining.ID_User);functions.WriteLogError(DetailError);}
		
		if (rows ==undefined) {
			var query_updateBaseDefend = "INSERT INTO `"+dataTraining.ID_User+"` (`BaseNumber`,`UnitType`,`Quality`) VALUES ("+
			dataTraining.BaseNumber+","+
			dataTraining.TrainingUnit_ID+","+
			dataTraining.TrainingQuality+")";
		}else{
			var query_updateBaseDefend = "UPDATE `"+dataTraining.ID_User+"` SET "+
			"`Quality`=`Quality`+"+dataTraining.TrainingQuality+"WHERE "+
			"`BaseNumber` = "+dataTraining.BaseNumber+" AND "+
			"`UnitType` = "+dataTraining.TrainingUnit_ID;
		}
		dbDefend.query(query_updateBaseDefend, function (error,result) {
			if (!!error){DetailError = ('Training.js: query_updateBaseDefend ' + dataTraining.ID_User);functions.WriteLogError(DetailError);}
			LogChange='Training.js: update_insert_BaseDefend '+dataTraining.ID_User;functions.LogChange(LogChange);
		});
	})
}

function updateDatabaseTraining (materialCost,dataTraining) {
	switch (dataTraining.Server_ID) {
		case 1:
		dbBase =db_s1_base_info;
		break;
		case 2:
		dbBase =db_s2_base_info;
		break;
	}
	var stringQuery = "UPDATE `"+dataTraining.ID_User+"` SET "+
	"`Farm`=`Farm`-"+materialCost.Farm+","+
	"`Wood`=`Wood`-"+materialCost.Wood+","+
	"`Stone`=`Stone`-"+materialCost.Stone+","+
	"`Metal`=`Metal`-"+materialCost.Metal+","+
	"`TrainingUnit_ID`="+dataTraining.ID_Unit+","+
	"`TrainingTime`="+functions.ImportTimeToDatabase(dataTraining.TrainingTime)+","+
	"`TrainingQuality`="+dataTraining.Quality+","+
	"`Training_Might`="+dataTraining.TrainingMight+","+
	"WHERE `BaseNumber`= '"+dataTraining.BaseNumber+"'";

	dbBase.query(stringQuery,function (error,result) {
		if (!!error){DetailError = ('Training.js: updateDatabaseTraining' + dataTraining.ID_User);functions.WriteLogError(DetailError);}
		LogChange='Training.js: updateDatabaseTraining '+dataTraining.ID_User;functions.LogChange(LogChange);
	});
}

function calcCost (stringQuery,data,resolve) {
	db_training.query(stringQuery, function (error,rows) {	
		if (!!error){DetailError = ('Training.js: calcCost' + data.ID_User);functions.WriteLogError(DetailError);}
		materialCost={
			Food: 	rows[0].Food * data.Quality,
			Wood: 	rows[0].Wood * data.Quality,
			Stone: 	rows[0].Stone * data.Quality,
			Metal: 	rows[0].Metal * data.Quality
		}
		resolve();
	});
}


function getTrainingTime (stringQuery,data,resolve) {
	db_training.query(stringQuery, function (error,rows) {	
		if (!!error){DetailError = ('Training.js: getTrainingTime' + data.ID_User);functions.WriteLogError(DetailError);}
		data.Level = (data.Level==0)?1:data.Level;
		var trainingTable = "SELECT * FROM `"+rows[0].Unit+"` WHERE `Level`= "+data.Level;
		db_training.query(trainingTable,function (error,rowsTrainingTable) {
			if (!!error){DetailError = ('Training.js: getTrainingTime trainingTable ' + data.ID_User);functions.WriteLogError(DetailError);}
			trainingTimeOut = rowsTrainingTable[0].TrainingTime*1000* data.Quality;
			trainingTime = new Date(functions.GetTime()+trainingTimeOut).toISOString();
			resolve();
		});

	});
}

function getMightBonus (stringQuery,data,resolve) {
	db_training.query(stringQuery, function (error,rows) {	
		if (!!error){DetailError = ('Training.js: getMightBonus ' + data.ID_User);functions.WriteLogError(DetailError);}
		mightBonus=rows[0].MightBonus * data.Quality;
		resolve();
	});
}


exports.UpdateDatabase = function updateDatabase (serverInt) {
	switch (serverInt) {
		case 1:
		dbBase 		= db_s1_base_info;
		dbDefend 	= db_s1_base_defend;
		break;
		case 2:
		dbBase 		= db_s2_base_info;
		dbDefend 	= db_s2_base_defend;
		break;
	}
	var database = "s"+serverInt+"_base_info";
	var tableQuery;
	var stringQuery = "SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='"+database+"' AND TABLE_NAME <>'"+database+"'";
	//console.log(tableQuery)
	
	dbBase.query(stringQuery,function (error,rows) {
		if (!!error){DetailError = ('Training.js: queryTable UpdateDatabase ' + serverInt);functions.WriteLogError(DetailError);}
		if (rows!=undefined) {
			for (var i = 0; i < rows.length; i++) {
				tableQuery = "SELECT * FROM `"+rows[i].TABLE_NAME+"` WHERE `TrainingTime`<>null";
				checkTimeDataBase (serverInt,dbBase,dbDefend,tableQuery);
			}
		}
	});
}

function checkTimeDataBase (serverInt,dbBase,dbDefend,tableQuery) {
	dbBase.query(tableQuery,function (error,rows) {
		if (!!error){DetailError = ('Training.js: checkTimeDataBase ' + serverInt);functions.WriteLogError(DetailError);}
		if (rows!=undefined) {
			var currentTime = functions.getTime();
			var databaseTime = functions.ExportTimeDatabase(rows[0].TrainingTime);
			dataTraining={
				Server_ID: 			serverInt,
				ID_User: 			rows[0].ID_User,
				BaseNumber: 		rows[0].BaseNumber,
				TrainingUnit_ID: 	rows[0].TrainingUnit_ID,
				TrainingTime: 		rows[0].TrainingTime,
				TrainingQuality: 	rows[0].TrainingQuality,
				TrainingMight: 		rows[0].Training_Might,
			}
			if (databaseTime<=currentTime) {
				updateBaseDefend(dbDefend,dataTraining);
				clearBaseInfo(dbBase,dataTraining);
			}else{
				trainingTimeOut =  new Date(databaseTime).getTime() -currentTime;
				setTimeout(function (dataTraining) {
					setTimeUpdate (dataTraining);
				},trainingTimeOut , dataTraining);
			}
		}
	});
}