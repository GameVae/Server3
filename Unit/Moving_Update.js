'use strict';

// var db_all_user		= require('./../Util/Database/Db_all_user.js');
var db_position			= require('./../Util/Database/Db_position.js');
var db_server_task 		= require('./../Util/Database/Db_server_task.js');
// var moveRedis 		= require('./../Redis/Move/Move.js');

var functions 		= require('./../Util/Functions.js');

var Promise = require('promise')

var DetailError;
var currentTime,offlineTime,calcTime;

exports.UpdateDataBase = function updateDataBase (serverInt) {
	
}

updateDataBase (1)

function updateDataBase (serverInt) {

	new Promise((resolve,reject)=>{
		var stringQuery = "SELECT `Time` FROM `task` WHERE `Task`='OfflineTime';"
		db_server_task.query(stringQuery,function (error,rows) {
			offlineTime=functions.ExportTimeDatabase(rows[0].Time)
			
			resolve();
		});
	}).then(()=>new Promise((resolve,reject)=>{
		var stringQuery = "SELECT * FROM `s"+serverInt+"_unit` WHERE `TimeFinishMove`<> 'Null'";
		db_position.query(stringQuery,function (error,rows) {
			if (!!error) {console.log(error);}
			if (rows.length>0) {
				for (var i = 0; i < rows.length; i++) {
					getDataUpdate (serverInt,offlineTime,rows[i])
				}
			}
		});
		
	})
	)

}

var ListMove = [ { Position_Cell: '14,13,0',
Next_Cell: '15,14,0',
TimeMoveNextCell: '2019-03-14T04:21:05.044' },
{ Position_Cell: '15,14,0',
Next_Cell: '15,15,0',
TimeMoveNextCell: '2019-03-14T04:21:06.306' },
{ Position_Cell: '15,15,0',
Next_Cell: '16,15,0',
TimeMoveNextCell: '2019-03-14T04:21:07.706' } ]
//
// updateListMove (ListMove)
// function updateListMove (list) {
// 	// console.log(list.length)
// 	for (var i = 0; i < list.length; i++) {
// 		// list[i].TimeMoveNextCell = functions.ExportTimeDatabase(list[i].TimeMoveNextCell)
// 		var timeUpdate = functions.ExportTimeDatabase(list[i].TimeMoveNextCell)+calcTime

// 	}
// }
function getDataUpdate (serverInt,offlineTime,data){
	var updateData = data;
	updateData.TimeMoveNextCell = functions.ExportTimeDatabase(updateData.TimeMoveNextCell)
	calcTime = offlineTime - updateData.TimeMoveNextCell;
	console.log(calcTime);
	var ListMove = JSON.parse(updateData.ListMove);
	for (var i = 0; i < ListMove.length; i++) {
		var timeUpdate = functions.ExportTimeDatabase(ListMove[i].TimeMoveNextCell)+calcTime;
		ListMove[i].TimeMoveNextCell = functions.ImportTimeToDatabase(new Date(timeUpdate).toISOString());
		// console.log(ListMove[i].TimeMoveNextCell);
	}
	
	console.log(updateData.ListMove);
	// updateData.ListMove = ListMove;
	// console.log(updateData.ListMove);
	//console.log(JSON.parse(updateData.ListMove))
	
	// for (var i = 0; i < updateData.ListMove.length; i++) {
		
	// }

	// if (calcTime >= 0) {
	// 	updateData.TimeMoveNextCell = currentTime + 1000;

	// 	if (updateData.ListMove!=null) {
	// 		for (var i = 0; i < updateData.ListMove.length; i++) {

	// 			updateData.ListMove[i]
	// 		}
	// 	}
	// }
	// console.log(offlineTime)
	// console.log(updateData.TimeMoveNextCell);
}


// function getDataUpdate (serverInt,rowData) {
// 	// var updateData = rowData;
// 	// currentTime = functions.GetTime();
// 	// rowData.TimeFinishMove = functions.ExportTimeDatabase(rowData.TimeFinishMove)
// 	// // console.log(rowData.TimeFinishMove)
// 	// if (rowData.TimeFinishMove<currentTime) {	
// 	// 	updateData.Position_Cell = rowData.End_Cell;
// 	// 	updateData.Next_Cell = null;
// 	// 	updateData.End_Cell = null;
// 	// 	updateData.TimeMoveNextCell = null;
// 	// 	updateData.TimeFinishMove = null;
// 	// 	updateData.ListMove = null;
// 	// 	updateData.Status = functions.UnitStatus.Standby;		
// 	// }else {

// 	// }
// 	// updateUnit (serverInt,updateData);

// 	var updateData = rowData;
// 	currentTime = functions.GetTime();
// 	var calcTime = 0;
// 	rowData.TimeMoveNextCell = functions.ExportTimeDatabase(rowData.TimeMoveNextCell);

// 	if (rowData.TimeMoveNextCell>currentTime) {
// 		calcTime = rowData.TimeMoveNextCell - currentTime;
// 		updateData.TimeMoveNextCell = currentTime;

// 	}

// }

// function calcData (currentTime,rowData) {
// 	var returnData =rowData;
// 	if (rowData.TimeMoveNextCell==currentTime) {

// 	}else if (rowData.TimeMoveNextCell<currentTime){

// 	}
// 	return returnData;
// }
function updateUnit (serverInt,updateData) {
	var stringUpdate = "UPDATE `s"+serverInt+"_unit` SET "+
	"`Position_Cell`='"+updateData.Position_Cell+"',"+
	"`Next_Cell`='"+updateData.Next_Cell+"',"+
	"`End_Cell`='"+updateData.End_Cell+"',"+
	"`TimeMoveNextCell`='"+updateData.TimeMoveNextCell+"',"+
	"`TimeFinishMove`='"+updateData.TimeFinishMove+"',"+
	"`ListMove`='"+updateData.ListMove+"',"+
	"`Status`='"+updateData.Status+"';"
	console.log(stringUpdate);
	// db_position.query(stringUpdate,function (error,result) {
	// 	if (!!error) {console.log(error);}
	// })
}

// function updateDataBase (data) {
// 	var stringUpdate = "UPDATE `s"+data.Server_ID+"_unit` SET "
// 	+"`Next_Cell`='"+data.Next_Cell+"',"
// 	+"`End_Cell`='"+data.End_Cell+"',"
// 	+"`TimeMoveNextCell`='"+data.TimeMoveNextCell+"',"
// 	+"`TimeFinishMove`='"+data.TimeFinishMove+"',"
// 	+"`ListMove`='"+ JSON.stringify(data.ListMove) +"',"
// 	+"`Status`='"+functions.UnitStatus.Move+
// 	"' WHERE `ID`='"+data.ID+"'";
// 	//console.log(stringUpdate);
// 	db_position.query(stringUpdate,function (error,result) {
// 		if (!!error) {console.log(error);}
// 	})
// }
// exports.Start = function start (io) {
// 	io.on('connection', function(socket){
// 		socket.on('S_MOVE', function (data){
// 			R_MOVE (socket,data.S_MOVE);
// 			S_MOVE (socket,data.S_MOVE);			
// 		});
// 	});
// }
// function R_MOVE (socket,dataMove) {	
// 	socket.emit('R_MOVE',{R_MOVE:dataMove});
// }
// // var S_MOVE_data = {"Server_ID":1,"ID":13,"ID_Unit":16,"ID_User":42,"Position_Cell":"11,12,0","Next_Cell":"10,11,0","End_Cell":"10,9,0","TimeMoveNextCell":1262,"TimeFinishMove":3786,"ListMove":[{"CurrentCell":"10,11,0","NextCell":"10,10,0","TimeMoveNextCell":"1262"},{"CurrentCell":"10,10,0","NextCell":"10,9,0","TimeMoveNextCell":"2324"}]}
// var S_MOVE_data = {"Server_ID":1,"ID":13,"ID_Unit":16,"ID_User":42,"Position_Cell":"11,12,0","Next_Cell":"10,11,0","End_Cell":"10,9,0","TimeMoveNextCell":1262,"TimeFinishMove":3786,"ListMove":[{"CurrentCell":"10,11,0","NextCell":"10,10,0","TimeMoveNextCell":1262}]}
// // var S_MOVE_data = {"Server_ID":1,"ID":13,"ID_Unit":16,"ID_User":42,"Position_Cell":"7,7,0","Next_Cell":"10,12,0","End_Cell":"10,12,0","TimeMoveNextCell":1400,"TimeFinishMove":1400,"ListMove":[]}

// // S_MOVE ('socket',S_MOVE_data)

// function S_MOVE (socket,data) {
// 	currentTime = functions.GetTime();
// 	data.TimeMoveNextCell = functions.ImportTimeToDatabase(new Date(currentTime + data.TimeMoveNextCell).toISOString());
// 	data.TimeFinishMove = functions.ImportTimeToDatabase(new Date(currentTime + data.TimeFinishMove).toISOString());
// 	var ListMove = data.ListMove;
// 	for (var i = 0; i < ListMove.length; i++) {
// 		ListMove[i].TimeMoveNextCell = functions.ImportTimeToDatabase(new Date(currentTime + ListMove[i].TimeMoveNextCell).toISOString());
// 		// ListMove[i].TimeMoveNextCell = calc;
// 		//console.log(ListMove[i].TimeMoveNextCell)
// 	}
// 	console.log(data);
// 	//moveRedis.MoveCalc (data)	
// 	updateDataBase (data);
// }

// function updateDataBase (data) {
// 	var stringUpdate = "UPDATE `s"+data.Server_ID+"_unit` SET "
// 	+"`Next_Cell`='"+data.Next_Cell+"',"
// 	+"`End_Cell`='"+data.End_Cell+"',"
// 	+"`TimeMoveNextCell`='"+data.TimeMoveNextCell+"',"
// 	+"`TimeFinishMove`='"+data.TimeFinishMove+"',"
// 	+"`ListMove`='"+ JSON.stringify(data.ListMove) +"',"
// 	+"`Status`='"+functions.UnitStatus.Move+
// 	"' WHERE `ID`='"+data.ID+"'";
// 	//console.log(stringUpdate);
// 	db_position.query(stringUpdate,function (error,result) {
// 		if (!!error) {console.log(error);}
// 	})
// }