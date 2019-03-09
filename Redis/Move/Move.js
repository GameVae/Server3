'use strict';
var db_position				= require('./../../Util/Database/Db_position.js');

var functions 				= require('./../../Util/Functions.js');

var attackFunc 				= require('./../Attack/Attack.js');
var positionRemove 			= require('./../Position/Position_Remove.js');

var redis = require("redis"),
client = redis.createClient();
client.select(functions.RedisData.TestUnit);

var DictMoveTimeOut = {};
var DictTimeMoveAttack = {};
var currentTime,stringData;

exports.MoveCalc = function moveCalc (data) {
	stringData = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;
}


// var S_MOVE_data = {"Server_ID":1,"ID":13,"ID_Unit":16,"ID_User":42,"Position_Cell":"11,12,0","Next_Cell":"10,11,0","End_Cell":"10,9,0","TimeMoveNextCell":1262,"TimeFinishMove":3786,"ListMove":[{"CurrentCell":"10,11,0","NextCell":"10,10,0","TimeMoveNextCell":"1262"},{"CurrentCell":"10,10,0","NextCell":"10,9,0","TimeMoveNextCell":"2324"}]}
//var S_MOVE_data = {"Server_ID":1,"ID":13,"ID_Unit":16,"ID_User":42,"Position_Cell":"11,12,0","Next_Cell":"10,11,0","End_Cell":"10,9,0","TimeMoveNextCell":1262,"TimeFinishMove":3786,"ListMove":[{"CurrentCell":"10,11,0","NextCell":"10,10,0","TimeMoveNextCell":1262}]}
// var S_MOVE_data = {"Server_ID":1,"ID":13,"ID_Unit":16,"ID_User":42,"Position_Cell":"7,7,0","Next_Cell":"10,12,0","End_Cell":"10,12,0","TimeMoveNextCell":1400,"TimeFinishMove":1400,"ListMove":[]}
var S_MOVE_data = { 
	Server_ID: 1,
	ID: 13,
	ID_Unit: 16,
	ID_User: 42,
	Position_Cell: '11,12,0',
	Next_Cell: '10,11,0',
	End_Cell: '10,9,0',
	TimeMoveNextCell: '2019-03-06T03:33:19.686',
	TimeFinishMove: '2019-03-05T01:25:22.210',
	ListMove:[ { CurrentCell: '10,11,0', NextCell: '10,10,0', TimeMoveNextCell: '2019-03-05T01:25:19.686' } ] };
//
test (S_MOVE_data);


function test (data) {
	var stringData = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;
	positionRemove.PostionRemove(data);
	checkRedisKey (data,stringData,function (checkBool) {
		// console.log(checkBool);
		if (checkBool) {			
			//setTimerUpdateDatabase (data,stringData);
			//setTimerMoveAttack (data,stringData);
		}else {
			console.log('error select unit');
		}
	});

}

function setTimerMoveAttack (data,stringData) {

	clearTimeout(DictTimeMoveAttack[stringData]);
	delete DictTimeMoveAttack[stringData];
	if (data.TimeMoveNextCell!=null) {checkTimeMoveNextCell (data,stringData);}

}
function checkTimeMoveNextCell (data,stringKey) {
	data.TimeMoveNextCell = functions.ExportTimeDatabase(data.TimeMoveNextCell) - functions.GetTime();
	var Position_Cell_X = data.Position_Cell.split(',')[0];
	var Position_Cell_Y = data.Position_Cell.split(',')[1];
	var Next_Cell_X = data.Next_Cell.split(',')[0];
	var Next_Cell_Y = data.Next_Cell.split(',')[1];
	var caseReturn = 1;
	var timeCheck = 0;

	if (Position_Cell_X!=Next_Cell_X&&Position_Cell_Y!=Next_Cell_Y) {caseReturn = 2};
	switch (caseReturn) {
		case 1:
		timeCheck = functions.TimeMove.Straight*0.5;
		break;
		case 2:
		timeCheck = functions.TimeMove.Diagonal*0.5;
		break;
	}

	var timeMove = 0;
	var stringPos = data.Position_Cell;
	if (data.TimeMoveNextCell>timeCheck) {
		timeMove = data.TimeMoveNextCell - timeCheck;
		stringPos = data.Next_Cell;
	}

	DictTimeMoveAttack[stringKey] = setTimeout(function (data,stringPos) {
		checkPostionAttackUnit (data,stringPos);
	}, timeMove, data,stringPos);
}

function checkPostionAttackUnit (data,stringPos) {
	//attackFunc
	var stringHkey = "s"+data.Server_ID+"_pos";

	client.hexists(stringHkey,stringPos,function (error,rows) {
		if (rows==1) {

		}
		// console.log(rows);
	})
}

function setTimerUpdateDatabase (data,stringKey) {
	clearMoveTimeout (stringData);
	data.TimeMoveNextCell = functions.ExportTimeDatabase(data.TimeMoveNextCell) - functions.GetTime();
	// console.log(data.TimeMoveNextCell);
	DictMoveTimeOut[stringKey] = setTimeout(function (stringKey) {
		var updateData = data;
		var Position_Cell = data.Position_Cell;

		if (data.ListMove.length>0) {
			if (updateData.Next_Cell!=data.ListMove[0].CurrentCell) {
				console.log('error postion Time Update');
			}else {
				updateData.Position_Cell = updateData.Next_Cell;
				updateData.Next_Cell = data.ListMove[0].NextCell;
				updateData.TimeMoveNextCell = data.ListMove[0].TimeMoveNextCell;
				data.ListMove.splice(0, 1);				
				updateData.ListMove = data.ListMove;
			}
			setTimerUpdateDatabase (updateData,stringKey);
		}else{
			updateData.Position_Cell = data.Next_Cell;
			updateData.End_Cell = null;
			updateData.Next_Cell = null;
			updateData.TimeMoveNextCell = null;
			updateData.TimeFinishMove = null;
			updateData.Status = functions.UnitStatus.Standby;
		}
		//updateDatabase (updateData);
		updateRedisData (stringKey,updateData,Position_Cell);

	}, data.TimeMoveNextCell, stringKey);
}

function updateDatabase (data) {
	var stringUpdate = "UPDATE `s"+data.Server_ID+"_unit` SET "
	+"`Next_Cell`='"+data.Next_Cell+"',"
	+"`End_Cell`='"+data.EndCell+"',"
	+"`TimeMoveNextCell`='"+data.TimeMoveNextCell+"',"
	+"`TimeFinishMove`='"+data.TimeFinishMove+"',"
	+"`ListMove`='"+data.ListMove+"',"
	+"`Status`='"+unitStatus.Move+
	"' WHERE `ID`='"+data.ID+"'";
	// console.log(stringUpdate);
	db_position.query(stringUpdate,function (error,result) {
		if (!!error) {console.log(error);}
	});
}

function updateRedisData (stringKey,updateData,Position_Cell) {
	var stringHkey = "s"+updateData.Server_ID+"_unit";
	client.hget(stringHkey,stringKey,function (error,rows) {
		var result = JSON.parse(rows);
		// console.log(result.Position_Cell)
		// console.log(data.Position_Cell)
		if (result.Position_Cell!=Position_Cell) {
			console.log('error position unit');
		}else{
			result.Position_Cell = updateData.Position_Cell;
			result.Next_Cell = updateData.Next_Cell;
			result.EndCell = updateData.End_Cell;
			result.TimeMoveNextCell = updateData.TimeMoveNextCell;
			result.TimeFinishMove = updateData.TimeFinishMove;
			result.ListMove = updateData.ListMove;
			result.Status = updateData.Status;
			//console.log(result);
			client.hset(stringHkey,stringKey,stringify(result));			
		}
	});
}

function checkRedisKey (data,stringKey,returnCheck) {
	var stringHkey = "s"+data.Server_ID+"_unit";
	var returnBool = false;
	client.hexists(stringHkey,stringKey,function (error,rows) {
		if (rows==1) {returnBool=true;}
		returnCheck(returnBool);
	});
}
function clearMoveTimeout (stringData) {
	clearTimeout(DictMoveTimeOut[stringData]);
	delete DictMoveTimeOut[stringData];
}
exports.ClearMoveTimeout = function clearMoveTimeout (stringData) {
	clearTimeout(DictMoveTimeOut[stringData]);
	delete DictMoveTimeOut[stringData];
}