'use strict';

// var db_all_user		= require('./../Util/Database/Db_all_user.js');
var move 				= require('./Moving.js');
var db_position			= require('./../Util/Database/Db_position.js');
var db_server_task 		= require('./../Util/Database/Db_server_task.js');
// var moveRedis 		= require('./../Redis/Move/Move.js');


var functions 		= require('./../Util/Functions.js');
var DetailError,logChangeDetail;

var Promise = require('promise')


var currentTime,offlineTime,calcTime;
// move.Test(2)
exports.UpdateDataBase = function (serverInt) {
	functions.ShowLog(functions.ShowLogBool.Check,'Moving_Update.js UpdateDataBase=>updateDataBase serverInt',[serverInt]);
	updateDataBase (serverInt);
}
// updateDataBase2 (1)
function updateDataBase (serverInt) {
	var stringQuery = "SELECT * FROM `s"+serverInt+"_unit` WHERE `TimeFinishMove`<> 'Null'";
	functions.ShowLog(functions.ShowLogBool.Check,'Moving_Update.js updateDataBase serverInt,stringQuery',[serverInt,stringQuery]);
	db_position.query(stringQuery,function (error,rows) {
		if (!!error){functions.ShowLog(functions.ShowLogBool.Check,'Moving_Update.js updateDataBase stringQuery',[stringQuery]);}
		if (rows.length>0) {
			for (var i = 0; i < rows.length; i++) {
				// updateData = rows[i];
				// rows[i].TimeFinishMove = new Date(functions.ExportTimeDatabase(rows[i].TimeFinishMove));
				// rows[i].TimeMoveNextCell = new Date( functions.ExportTimeDatabase(rows[i].TimeMoveNextCell));

				// console.log('moving update unit')
				// getDataUpdate (serverInt,updateData);
				functions.ShowLog(functions.ShowLogBool.Check,'Moving_Update.js updateDataBase=>getDataUpdate serverInt,rows[i]',[serverInt,rows[i]]);
				getDataUpdate (serverInt,rows[i]);
				// console.log(updateData)
			}
		}
	});

}

// var S_MOVE_data = {
// 	ID: 17,
// 	ID_Unit: 16,
// 	ID_User: 42,
// 	BaseNumber: 1,
// 	Level: 2,
// 	Quality: 3,
// 	Hea_cur: 5.45,
// 	Health: 5.45,
// 	Attack: 2.3,
// 	Defend: 1.15,
// 	Position_Cell: '4,4,0',
// 	Next_Cell: '5,5,0',
// 	End_Cell: '12,12,0',
// 	TimeMoveNextCell: '2019-04-01T07:06:13.000Z',
// 	TimeFinishMove: '2019-04-01T07:06:42.000Z',
// 	ListMove: '[{"Position_Cell":"5,5,0","Next_Cell":"5,6,0","TimeMoveNextCell":"2019-04-01T07:06:16.021"},{"Position_Cell":"5,6,0","Next_Cell":"6,7,0","TimeMoveNextCell":"2019-04-01T07:06:18.545"},{"Position_Cell":"6,7,0","Next_Cell":"6,8,0","TimeMoveNextCell":"2019-04-01T07:06:21.068"},{"Position_Cell":"6,8,0","Next_Cell":"7,9,0","TimeMoveNextCell":"2019-04-01T07:06:23.592"},{"Position_Cell":"7,9,0","Next_Cell":"7,10,0","TimeMoveNextCell":"2019-04-01T07:06:26.116"},{"Position_Cell":"7,10,0","Next_Cell":"8,11,0","TimeMoveNextCell":"2019-04-01T07:06:28.640"},{"Position_Cell":"8,11,0","Next_Cell":"9,11,0","TimeMoveNextCell":"2019-04-01T07:06:31.440"},{"Position_Cell":"9,11,0","Next_Cell":"10,11,0","TimeMoveNextCell":"2019-04-01T07:06:34.240"},{"Position_Cell":"10,11,0","Next_Cell":"11,11,0","TimeMoveNextCell":"2019-04-01T07:06:37.040"},{"Position_Cell":"11,11,0","Next_Cell":"11,12,0","TimeMoveNextCell":"2019-04-01T07:06:39.564"},{"Position_Cell":"11,12,0","Next_Cell":"12,12,0","TimeMoveNextCell":"2019-04-01T07:06:42.364"}]',
// 	Status: 1,
// 	Attack_Base_ID: null,
// 	Attack_Unit_ID: null,
// 	AttackedBool: 0 }
//
// getDataUpdate (1,S_MOVE_data)

function getDataUpdate (serverInt,data){		
	functions.ShowLog(functions.ShowLogBool.Check,'Moving_Update.js getDataUpdate serverInt,data',[serverInt,data]);

	currentTime = functions.GetTime();
	// var updateData = data;
	var updateData  = Object.create(data);
	updateData.Server_ID = serverInt;
	updateData.ID = data.ID;
	updateData.ID_Unit = data.ID_Unit;
	updateData.ID_User = data.ID_User;
	updateData.BaseNumber = data.BaseNumber;
	updateData.Level = data.Level;
	updateData.Quality = data.Quality;
	updateData.Hea_cur = data.Hea_cur;
	updateData.Health = data.Health;
	updateData.Attack = data.Attack;
	updateData.Defend = data.Defend;
	updateData.Position_Cell = data.Position_Cell;
	updateData.Next_Cell = data.Next_Cell;
	updateData.End_Cell = data.End_Cell;
	
	var TimeMoveNextCell = functions.TimeMove.Diagonal*0.5;
	updateData.TimeMoveNextCell = TimeMoveNextCell;
	var ListMove = data.ListMove;
	if (data.ListMove.length>0) {
		ListMove = JSON.parse(data.ListMove);
	}

	updateData.TimeFinishMove = TimeMoveNextCell + functions.ExportTimeDatabase(data.TimeFinishMove) - functions.ExportTimeDatabase(data.TimeMoveNextCell)	
	
	if (data.ListMove.length>0) {
		if (updateData.ListMove.length>0) {
			for (var i = 0; i < ListMove.length; i++) {
				ListMove[i].TimeMoveNextCell = TimeMoveNextCell + functions.ExportTimeDatabase(ListMove[i].TimeMoveNextCell) - functions.ExportTimeDatabase(data.TimeMoveNextCell);
			}
		}
		updateData.ListMove = ListMove;	
	}
	// console.log(updateData);

	functions.ShowLog(functions.ShowLogBool.Check,'Moving_Update.js getDataUpdate=>updateDatabase updateData',[updateData]);
	updateDatabase(updateData);
	functions.ShowLog(functions.ShowLogBool.Check,'Moving_Update.js getDataUpdate=>move.MoveCalc updateData',[updateData]);
	move.MoveCalc(null,null,updateData);	
}

function updateDatabase (data) {
	functions.ShowLog(functions.ShowLogBool.Check,'Moving_Update.js updateDatabase data',[data]);
	var updateData = data;
	// console.log(updateData)
	// console.log(data.TimeMoveNextCell)
	// console.log(currentTime)
	updateData.TimeMoveNextCell = functions.ImportTimeToDatabase(new Date(data.TimeMoveNextCell + currentTime).toISOString())
	updateData.TimeFinishMove = functions.ImportTimeToDatabase(new Date(data.TimeFinishMove + currentTime).toISOString())
	var ListMove = data.ListMove;
	if (data.ListMove.length>0) {		
		if (ListMove.length>0) {
			for (var i = 0; i < ListMove.length; i++) {
				ListMove[i].TimeMoveNextCell = functions.ImportTimeToDatabase(new Date(ListMove[i].TimeMoveNextCell + currentTime).toISOString())
			}
		}
		// console.log(updateData)
	}
	functions.ShowLog(functions.ShowLogBool.Check,'Moving_Update.js updateDatabase data,updateData',[data,updateData]);
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
	functions.ShowLog(functions.ShowLogBool.Check,'Moving_Update.js updateDatabase stringUpdate',[stringUpdate]);
	db_position.query(stringUpdate,function (error,result) {
		if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'Moving_Update.js updateDatabase stringUpdate',[stringUpdate]);}
		functions.ShowLog(functions.ShowLogBool.LogChange,'Moving_Update.js updateDatabase stringUpdate',[stringUpdate]);
	});
}