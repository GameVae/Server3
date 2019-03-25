'use strict';

// var db_all_user		= require('./../Util/Database/Db_all_user.js');
var db_position			= require('./../Util/Database/Db_position.js');
var db_server_task 		= require('./../Util/Database/Db_server_task.js');
// var moveRedis 		= require('./../Redis/Move/Move.js');
var move 				= require('./../Redis/Move/Move.js');

var functions 		= require('./../Util/Functions.js');
var DetailError,logChangeDetail;

var Promise = require('promise')

var DetailError;
var currentTime,offlineTime,calcTime;
// move.Test(2)
exports.UpdateDataBase = function updateDataBase (serverInt) {
	updateDataBase2 (serverInt);
}
//updateDataBase2 (1)
function updateDataBase2 (serverInt) {
	var stringQuery = "SELECT * FROM `s"+serverInt+"_unit` WHERE `TimeFinishMove`<> 'Null'";
	db_position.query(stringQuery,function (error,rows) {
		if (!!error){DetailError = ('Moving_Update.js: updateDataBase TimeFinishMove: '+stringQuery); functions.WriteLogError(DetailError,2);}
		if (rows.length>0) {
			for (var i = 0; i < rows.length; i++) {
				// console.log('moving update unit')
				getDataUpdate (serverInt,rows[i]);
			}
		}
	});

}

// var S_MOVE_data = {
// 	ID: 14,
// 	ID_Unit: 16,
// 	ID_User: 43,
// 	BaseNumber: 1,
// 	Level: 2,
// 	Quality: 1,
// 	Hea_cur: 5.45,
// 	Health: 5.45,
// 	Attack: 2.3,
// 	Defend: 1.15,
// 	Position_Cell: '298,1,0',
// 	Next_Cell: '298,2,0',
// 	End_Cell: '304,3,0',
// 	TimeMoveNextCell: '2019-03-19T23:22:21',
// 	TimeFinishMove: '2019-03-19T23:22:54',
// 	ListMove: '[{"Position_Cell":"298,2,0","Next_Cell":"299,3,0","TimeMoveNextCell":"2019-03-20T06:22:26.902"},{"Position_Cell":"299,3,0","Next_Cell":"300,3,0","TimeMoveNextCell":"2019-03-20T06:22:32.502"},{"Position_Cell":"300,3,0","Next_Cell":"301,3,0","TimeMoveNextCell":"2019-03-20T06:22:38.102"},{"Position_Cell":"301,3,0","Next_Cell":"302,3,0","TimeMoveNextCell":"2019-03-20T06:22:43.702"},{"Position_Cell":"302,3,0","Next_Cell":"303,3,0","TimeMoveNextCell":"2019-03-20T06:22:49.302"},{"Position_Cell":"303,3,0","Next_Cell":"304,3,0","TimeMoveNextCell":"2019-03-20T06:22:54.902"}]',
// 	Status: 1,
// 	Attack_Base_ID: null,
// 	Attack_Unit_ID: null,
// 	AttackedBool: 0 }
//
// getDataUpdate (1,S_MOVE_data)

function getDataUpdate (serverInt,data){
	
	
	// console.log(updateData)
	// updateCalcTime(data)
	data.Server_ID = serverInt;

	var updateData = data;
	// console.log(data)
	updateData.Server_ID = serverInt;
	currentTime = functions.GetTime();
	var TimeMoveNextCell = functions.TimeMove.Diagonal*0.5;
	updateData.TimeFinishMove = TimeMoveNextCell + functions.ExportTimeDatabase(data.TimeFinishMove) - functions.ExportTimeDatabase(data.TimeMoveNextCell)
	updateData.TimeMoveNextCell = TimeMoveNextCell;
	
	var ListMove = JSON.parse(updateData.ListMove)
	if (ListMove!=null) {
		for (var i = 0; i < ListMove.length; i++) {
			ListMove[i].TimeMoveNextCell = TimeMoveNextCell + functions.ExportTimeDatabase(ListMove[i].TimeMoveNextCell) - functions.ExportTimeDatabase(updateData.TimeMoveNextCell);
		}
	}
	updateData.ListMove = ListMove;
	updateCalcTime(updateData);
	updateDatabase(updateData);


	move.MoveCalc(null,null,updateData);	
}
function updateCalcTime(data){
	console.log(data)
	// var updateData = data;
	// // console.log(data)
	// updateData.Server_ID = serverInt;
	// currentTime = functions.GetTime();
	// var TimeMoveNextCell = functions.TimeMove.Diagonal*0.5;
	// updateData.TimeFinishMove = TimeMoveNextCell + functions.ExportTimeDatabase(data.TimeFinishMove) - functions.ExportTimeDatabase(data.TimeMoveNextCell)
	// updateData.TimeMoveNextCell = TimeMoveNextCell;
	
	// var ListMove = JSON.parse(updateData.ListMove)
	// if (ListMove!=null) {
	// 	for (var i = 0; i < ListMove.length; i++) {
	// 		ListMove[i].TimeMoveNextCell = TimeMoveNextCell + functions.ExportTimeDatabase(ListMove[i].TimeMoveNextCell) - functions.ExportTimeDatabase(updateData.TimeMoveNextCell);
	// 	}
	// }
	// updateData.ListMove = ListMove;

	// console.log(data)
	
}

function updateDatabase (data) {
	var updateData = data;
	updateData.TimeMoveNextCell = functions.ImportTimeToDatabase(new Date(data.TimeMoveNextCell + currentTime).toISOString())
	updateData.TimeFinishMove = functions.ImportTimeToDatabase(new Date(data.TimeFinishMove + currentTime).toISOString())
	
	var ListMove = data.ListMove;
	if (ListMove.length>0) {
		for (var i = 0; i < ListMove.length; i++) {
			ListMove[i].TimeMoveNextCell = functions.ImportTimeToDatabase(new Date(ListMove[i].TimeMoveNextCell + currentTime).toISOString())
		}
	}
	updateData.ListMove = ListMove;
	//console.log(updateData)
	
	var stringUpdate;
	if (updateData.ListMove.length==0) {
		stringUpdate = "UPDATE `s"+updateData.Server_ID+"_unit` SET "
		+"`Position_Cell`='"+updateData.Position_Cell+"',"
		+"`Next_Cell`='"+updateData.Next_Cell+"',"
		+"`End_Cell`='"+updateData.End_Cell+"',"
		+"`TimeMoveNextCell`='"+updateData.TimeMoveNextCell+"',"
		+"`TimeFinishMove`='"+updateData.TimeFinishMove+"',"
		+"`ListMove`='"+updateData.ListMove+"',"
		+"`Status`='"+functions.UnitStatus.Move+
		"' WHERE `ID`='"+updateData.ID+"'";
	}else{
		stringUpdate = "UPDATE `s"+updateData.Server_ID+"_unit` SET "
		+"`Position_Cell`='"+updateData.Position_Cell+"',"
		+"`Next_Cell`='"+updateData.Next_Cell+"',"
		+"`End_Cell`='"+updateData.End_Cell+"',"
		+"`TimeMoveNextCell`='"+updateData.TimeMoveNextCell+"',"
		+"`TimeFinishMove`='"+updateData.TimeFinishMove+"',"
		+"`ListMove`='"+JSON.stringify(updateData.ListMove)+"',"
		+"`Status`='"+functions.UnitStatus.Move+
		"' WHERE `ID`='"+updateData.ID+"'";
	}
	console.log(stringUpdate);
	// db_position.query(stringUpdate,function (error,result) {
	// 	if (!!error){DetailError = ('Moving_Update.js: updateDatabase: '+stringUpdate); functions.WriteLogError(DetailError,2);}
	// 	logChangeDetail = ("Moving_Update.js: updateDatabase "+stringUpdate); functions.LogChange(logChangeDetail,2);
	// });
}

// function moveCalc2 (socket,data) {
// 	// console.log(data)
// 	var stringHkey = "s"+data.Server_ID+"_unit";
// 	var stringKey = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;
// 	clearMoveTimeout(stringKey);
// 	positionRemove.PostionRemove(data);
// 	// setTimerUpdateDatabase (data,stringKey);
// 	setTimerUpdateDatabase2 (socket,data,stringKey);
// }

// function setTimerUpdateDatabase2 (socket,data,stringKey) {
// 	// console.log(data.TimeMoveNextCell)
// 	var timeOut = functions.ExportTimeDatabase(data.TimeMoveNextCell) - functions.GetTime();	
// 	// console.log(timeOut);
// 	DictMoveTimeOut[stringKey] = setTimeout(function (stringKey) {
// 		var updateData = data;
// 		var Position_Cell = data.Position_Cell;
// 		// console.log(updateData.Next_Cell,data.ListMove[0].Position_Cell)
// 		if (data.ListMove.length>0) {
// 			if (updateData.Next_Cell != data.ListMove[0].Position_Cell) {
// 				DetailError = ('Move.js: setTimerUpdateDatabase: '+stringKey); functions.WriteLogError(DetailError,3);
// 				// console.log(updateData)
// 				// console.log(updateData.Next_Cell,data.ListMove[0].Position_Cell)
// 			}else{
// 				updateData.Position_Cell = data.Next_Cell;
// 				updateData.Next_Cell = data.ListMove[0].Next_Cell;
// 				updateData.TimeMoveNextCell = data.ListMove[0].TimeMoveNextCell;					
// 				updateData.ListMove.shift();
// 				// console.log(updateData.ListMove)
// 				updateDatabase (updateData);
// 				setTimerUpdateDatabase2 (updateData,stringKey);
// 			}
// 		}else{	
// 			checkPosition (updateData,function (returnBool) {				
// 				if (returnBool) {
// 					// console.log(returnBool)
// 					move_GetNewPos.SendGetNewPos(socket,updateData);
// 				}else{
// 					var stringUpdate = "UPDATE `s"+data.Server_ID+"_unit` SET"+
// 					" `Position_Cell`='"+data.Next_Cell
// 					+"',`Next_Cell`= NULL,`End_Cell`=NULL,`TimeMoveNextCell`=NULL,`TimeFinishMove`=NULL,`ListMove`=NULL,`Status`='"+functions.UnitStatus.Standby+"' "+
// 					"WHERE `ID`='"+data.ID+"'";
// 					db_position.query(stringUpdate,function (error,result) {
// 						if (!!error){DetailError = ('Move.js: updateDatabase: '+stringUpdate); functions.WriteLogError(DetailError,3);}
// 						logChangeDetail =("Move.js: updateDatabase "+stringUpdate); functions.LogChange(logChangeDetail,3);
// 					});
// 					updateData.Position_Cell = data.Next_Cell;
// 					positionAdd.AddPosition(updateData);
// 				}
// 			})						
// 		}
// 		//console.log(updateData)
// 		// updateRedisData (stringKey,updateData,Position_Cell);
// 	}, timeOut, stringKey);
// }