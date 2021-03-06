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

var dataTraining 	= {};
var materialCost 	= {};
var trainingTime,mightBonus,trainingTimeOut,stringTimeOut;
var dbUpgrade,dbBase,dbDefend;
var DictTimeOut 	= {};

var dataTr={
	ID_User: 	42,
	Server_ID: 	1,
	BaseNumber: 1,
	ID_Unit: 	16,
	Level: 		1,
	Quality: 	1,
}

exports.Start = function start (io) {
	io.on('connection', function(socket){
		socket.on('S_TRAINING', function (data){
			//console.log('socketID: '+socket.id);
			S_TRAINING (data);
		});
		socket.on('S_TRAINING_SPEEDUP', function (data){
			//console.log('socketID: '+socket.id);
			S_TRAINING_SPEEDUP (socket,data);
		});
	});
}

function S_TRAINING_SPEEDUP (socket,data) {
	stringTimeOut = dataTraining.ID_User+"_"+dataTraining.BaseNumber;
	clearTimeout(DictTimeOut[stringTimeOut]);
}

//S_TRAINING (dataTr);
function S_TRAINING (data) {

	var stringQuery = "SELECT * FROM `unit` WHERE `ID_Unit`="+data.ID_Unit;

	new Promise((resolve,reject)=>{
		getTrainingTime (stringQuery,data,resolve);
	}).then(()=>new Promise((resolve,reject)=>{
		calcCost (stringQuery,data,resolve);
	}).then(()=>new Promise((resolve,reject)=>{
		dataTraining={
			Server_ID: 			data.Server_ID,
			ID_User: 			data.ID_User,
			BaseNumber: 		data.BaseNumber,
			TrainingUnit_ID: 	data.ID_Unit,
			TrainingTime: 		trainingTime,
			TrainingQuality: 	data.Quality,
			TrainingMight: 		mightBonus
		}
		updateDatabaseTraining(materialCost,dataTraining);
		resolve();
	}).then(()=>{
		stringTimeOut = dataTraining.ID_User+"_"+dataTraining.BaseNumber;
		DictTimeOut[stringTimeOut] = setTimeout(function (dataTraining) {
			setTimeUpdate (dataTraining);
		},trainingTimeOut , dataTraining);
	})));
}

function setTimeUpdate (data) {
	var queryServer = "SELECT `Server_ID` FROM `user_info` WHERE `ID_User` ='"+data.ID_User+"'";
	db_all_user.query(queryServer,function (error,rowsQueryServer) {
		if (!!error){DetailError = ('Training.js: setTimeUpdate user_info ' + data.ID_User);functions.WriteLogError(DetailError,2);}
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

		var stringQuery = "SELECT * FROM `"+data.ID_User+"` WHERE "+
		"`BaseNumber`='"+data.BaseNumber+"' AND"+
		"`TrainingUnit_ID`='"+data.TrainingUnit_ID+"' AND "+
		"`TrainingTime`='"+functions.ImportTimeToDatabase(data.TrainingTime)+"' AND"+
		"`TrainingQuality`='"+data.TrainingQuality+"' AND"+
		"`Training_Might`='"+data.TrainingMight+"'";

		dbBase.query(stringQuery,function (error,rows) {
			if (!!error){DetailError = ('Training.js: setTimeUpdate '+ stringQuery);functions.WriteLogError(DetailError,2);}
			if (rows!=undefined) {
				updateBaseDefend(dbDefend,data);
				updateUserMight(rowsQueryServer[0].Server_ID,data);
				clearBaseInfo(dbBase,data);
				delete DictTimeOut[stringTimeOut];
			}
		});
	});

}

function updateUserMight (serverID,dataTraining) {
	var stringUpdate = "UPDATE `game_info_s"+serverID+"` SET `Might`=`Might`+'"+dataTraining.TrainingMight+"' WHERE `ID_User`='"+dataTraining.ID_User+"'";
	db_all_user.query(stringUpdate,function (error,result) {
		if (!!error){DetailError = ('Training.js: updateUserMight: ' + stringUpdate);functions.WriteLogError(DetailError,2);}
		LogChange='Training.js: updateUserMight: '+stringUpdate;functions.LogChange(LogChange,2);
	});
}

function clearBaseInfo (dbBase,dataTraining) {
	//console.log(dataTraining)
	var clearString = "UPDATE `"+dataTraining.ID_User+"` SET "+
	"`TrainingUnit_ID` = NULL, `TrainingTime`=NULL, `TrainingQuality`=NULL,`Training_Might`=NULL"
	+" WHERE `BaseNumber` = "+dataTraining.BaseNumber;
	dbBase.query(clearString,function (error,result) {
		if (!!error){DetailError = ('Training.js: clearBaseInfo: ' + clearString);functions.WriteLogError(DetailError,2);}
		LogChange='Training.js: clearBaseInfo '+clearString;functions.LogChange(LogChange,2);
		
	});
}

function updateBaseDefend (dbDefend,dataTraining) {
	var stringQuery = "SELECT * FROM `"+dataTraining.ID_User+"` WHERE "+
	"`BaseNumber` = '"+dataTraining.BaseNumber+"' AND"+
	"`ID_Unit` = '"+dataTraining.TrainingUnit_ID+"'";
	var query_updateBaseDefend;
	dbDefend.query(stringQuery,function (error,rows) {
		if (!!error){DetailError = ('Training.js: updateBaseDefend ' + stringQuery);functions.WriteLogError(DetailError,2);}
		if (rows.length>0) {
			query_updateBaseDefend = "UPDATE `"+dataTraining.ID_User+"` SET "+
			"`Quality`=`Quality`+'"+dataTraining.TrainingQuality+"' WHERE "+
			"`BaseNumber` = '"+dataTraining.BaseNumber+"' AND "+
			"`ID_Unit` = '"+dataTraining.TrainingUnit_ID+"'";
		}else{
			query_updateBaseDefend = "INSERT INTO `"+dataTraining.ID_User+"` (`BaseNumber`,`ID_Unit`,`Quality`) VALUES ("+
			dataTraining.BaseNumber+","+
			dataTraining.TrainingUnit_ID+","+
			dataTraining.TrainingQuality+")";
		}
		//console.log('query_updateBaseDefend: '+query_updateBaseDefend);
		dbDefend.query(query_updateBaseDefend, function (error,result) {
			if (!!error){DetailError = ('Training.js: query_updateBaseDefend ' +query_updateBaseDefend);functions.WriteLogError(DetailError,2);}
			LogChange='Training.js: update_insert_BaseDefend '+query_updateBaseDefend;functions.LogChange(LogChange,2);
		});
	})
}

function updateDatabaseTraining (materialCost,dataTraining) {
	// console.log(dataTraining);
	switch (dataTraining.Server_ID) {
		case 1:
		dbBase =db_s1_base_info;
		break;
		case 2:
		dbBase =db_s2_base_info;
		break;
	}
	var stringQuery = "UPDATE `"+dataTraining.ID_User+"` SET "+
	"`Farm`=`Farm`-'"+materialCost.Farm+"',"+
	"`Wood`=`Wood`-'"+materialCost.Wood+"',"+
	"`Stone`=`Stone`-'"+materialCost.Stone+"',"+
	"`Metal`=`Metal`-'"+materialCost.Metal+"',"+
	"`TrainingUnit_ID`='"+dataTraining.TrainingUnit_ID+"',"+
	"`TrainingTime`='"+functions.ImportTimeToDatabase(dataTraining.TrainingTime)+"',"+
	"`TrainingQuality`='"+dataTraining.TrainingQuality+"',"+
	"`Training_Might`='"+dataTraining.TrainingMight+"'"+
	"WHERE `BaseNumber`= '"+dataTraining.BaseNumber+"'";

	dbBase.query(stringQuery,function (error,result) {
		if (!!error){DetailError = ('Training.js: updateDatabaseTraining ' +stringQuery);functions.WriteLogError(DetailError,2);}
		LogChange='Training.js: updateDatabaseTraining: '+stringQuery;functions.LogChange(LogChange,2);
	});
}

function calcCost (stringQuery,data,resolve) {
	db_training.query(stringQuery, function (error,rows) {	
		if (!!error){DetailError = ('Training.js: calcCost' + data.ID_User);functions.WriteLogError(DetailError,2);}
		//console.log(rows)
		materialCost={
			Farm: 	rows[0].Food * data.Quality,
			Wood: 	rows[0].Wood * data.Quality,
			Stone: 	rows[0].Stone * data.Quality,
			Metal: 	rows[0].Metal * data.Quality
		}
		// console.log(materialCost)
		resolve();
	});
}


function getTrainingTime (stringQuery,data,resolve) {
	
	// console.log(stringQuery);
	// var stringQuery = "SELECT * FROM `unit` WHERE `ID`="+data.ID_Unit;
	db_training.query(stringQuery, function (error,rows) {	
		if (!!error){DetailError = ('Training.js: getTrainingTime ' + data.ID_User);functions.WriteLogError(DetailError,2);}
		data.Level = (data.Level==0)?1:data.Level;
		mightBonus = data.Quality*rows[0].MightBonus;
		
		var trainingTable = "SELECT * FROM `"+rows[0].Unit+"` WHERE `Level`= "+data.Level;
		db_training.query(trainingTable,function (error,rowsTrainingTable) {
			if (!!error){DetailError = ('Training.js: getTrainingTime trainingTable ' + data.ID_User);functions.WriteLogError(DetailError,2);}
			trainingTimeOut = rowsTrainingTable[0].TrainingTime*1000* data.Quality;
			trainingTime = new Date(functions.GetTime()+trainingTimeOut).toISOString();
			//console.log(rowsTrainingTable)
			resolve();
		});

	});
}

// function getMightBonus (stringQuery,data,resolve) {
// 	db_training.query(stringQuery, function (error,rows) {	

// 		if (!!error){DetailError = ('Training.js: getMightBonus ' + data.ID_User);functions.WriteLogError(DetailError,2);}
// 		//dataTraining.TrainingMight=rows[0].MightBonus * data.Quality;

// 		resolve();
// 	});
// }


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
	
	dbBase.query(stringQuery,function (error,rows) {
		if (!!error){DetailError = ('Training.js: queryTable UpdateDatabase ' + serverInt);functions.WriteLogError(DetailError,2);}
		if (rows!=undefined) {

			for (var i = 0; i < rows.length; i++) {
				tableQuery = "SELECT * FROM `"+rows[i].TABLE_NAME+"` WHERE `TrainingTime`<> 'NULL'";
				checkTimeDataBase (serverInt,dbBase,dbDefend,tableQuery);
			}
		}
	});
}

function checkTimeDataBase (serverInt,dbBase,dbDefend,tableQuery) {
	
	dbBase.query(tableQuery,function (error,rows) {
		if (!!error){DetailError = ('Training.js: checkTimeDataBase ' + serverInt+"_"+tableQuery);functions.WriteLogError(DetailError,2);}
		
		if (rows.length>0) {
			
			var currentTime = functions.GetTime();
			var databaseTime = functions.ExportTimeDatabase(rows[0].TrainingTime);
			var dataTr={
				Server_ID: 			serverInt,
				ID_User: 			rows[0].ID_User,
				BaseNumber: 		rows[0].BaseNumber,
				TrainingUnit_ID: 	rows[0].TrainingUnit_ID,
				TrainingTime: 		rows[0].TrainingTime,
				TrainingQuality: 	rows[0].TrainingQuality,
				TrainingMight: 		rows[0].Training_Might,
			}

			var trainTime = 0;
			if (databaseTime>currentTime) {
				trainTime = new Date(databaseTime).getTime() - currentTime;
			}

			var stringTimeOut = dataTr.ID_User+"_"+dataTr.BaseNumber;
			DictTimeOut[stringTimeOut]=setTimeout(function (dataTr) {
				updateBaseDefend(dbDefend,dataTr);
				updateUserMight(serverInt,dataTr);
				clearBaseInfo(dbBase,dataTr);
				delete DictTimeOut[stringTimeOut];
			},trainTime, dataTr);
		}		
	});
}

