'use strict';
var move_GetNewPos 			= require('./Move_GetNewPos.js');

var db_position				= require('./../../Util/Database/Db_position.js');
// var attackFunc 				= require('./../Attack/Attack.js');
var guildData				= require('./../Guild/GuildData.js');
var friendData				= require('./../Friend/FriendData.js');
var positionRemove 			= require('./../Position/Position_Remove.js');

//var redisFunc 				=  require('./../../Redis.js');
var functions 				= require('./../../Util/Functions.js');

var redis = require("redis"),
client = redis.createClient();
client.select(functions.RedisData.TestUnit);

var Promise 				= require('promise');

var DictMoveTimeOut = {};
var DictTimeMoveAttack = {};
var currentTime,stringData;
var DetailError, logChangeDetail;

exports.MoveCalc = function moveCalc (socketdata) {
	moveCalc2 (socket,data)
}

var S_MOVE_data = { Server_ID: 1,
	ID: 10,
	ID_Unit: 16,
	ID_User: 9,
	Position_Cell: '11,11,0',
	Next_Cell: '11,11,0',
	End_Cell: '11,11,0',
	TimeMoveNextCell: '2019-03-19T01:27:24.473',
	TimeFinishMove: '2019-03-19T01:27:24.473',
	ListMove: [] }
//
// moveCalc2 (S_MOVE_data)
function moveCalc2 (socket,data) {
	// console.log(data)
	var stringHkey = "s"+data.Server_ID+"_unit";
	var stringKey = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;
	clearMoveTimeout(stringKey);
	positionRemove.PostionRemove(data);
	setTimerUpdateDatabase (data,stringKey);
	// setTimerUpdateDatabase2 (socket,data,stringKey);
	//setTimerMoveAttack (data,stringData);

	// checkRedisKey (stringHkey,stringKey,function (checkBool) {
	// 	// console.log(checkBool);
	// 	if (checkBool) {			
	// 		setTimerUpdateDatabase (data,stringKey);
	// 		
	// 	}else {
	// 		DetailError = ('Move.js: MoveCalc checkRedisKey error select unit: '+stringKey); functions.WriteLogError(DetailError,3);
	// 	}
	// });
}

function setTimerUpdateDatabase2 (socket,data,stringKey) {
	// console.log(data.TimeMoveNextCell)
	var timeOut = functions.ExportTimeDatabase(data.TimeMoveNextCell) - functions.GetTime();	
	// console.log(timeOut);

	DictMoveTimeOut[stringKey] = setTimeout(function (stringKey) {
		var updateData = data;
		var Position_Cell = data.Position_Cell;
		// console.log(updateData.Next_Cell,data.ListMove[0].Position_Cell)
		if (data.ListMove.length>0) {
			if (updateData.Next_Cell!=data.ListMove[0].Position_Cell) {
				DetailError = ('Move.js: setTimerUpdateDatabase: '+stringKey); functions.WriteLogError(DetailError,3);
				// console.log(updateData)
				// console.log(updateData.Next_Cell,data.ListMove[0].Position_Cell)
			}else{
				updateData.Position_Cell = data.Next_Cell;
				updateData.Next_Cell = data.ListMove[0].Next_Cell;
				updateData.TimeMoveNextCell = data.ListMove[0].TimeMoveNextCell;					
				updateData.ListMove.shift();
				// console.log(updateData.ListMove)
				updateDatabase (updateData);
				setTimerUpdateDatabase (updateData,stringKey);
			}
		}else{	
			checkPosition (updateData,function (returnBool) {				
				if (returnBool) {
					console.log(returnBool)
					move_GetNewPos.SendGetNewPos(socket,updateData);
				}else{
					var stringUpdate = "UPDATE `s"+data.Server_ID+"_unit` SET"+
					" `Position_Cell`='"+data.Next_Cell
					+"',`Next_Cell`= NULL,`End_Cell`=NULL,`TimeMoveNextCell`=NULL,`TimeFinishMove`=NULL,`ListMove`=NULL,`Status`='"+functions.UnitStatus.Standby+"' "+
					"WHERE `ID`='"+data.ID+"'";
					db_position.query(stringUpdate,function (error,result) {
						if (!!error){DetailError = ('Move.js: updateDatabase: '+stringUpdate); functions.WriteLogError(DetailError,3);}
						logChangeDetail =("Move.js: updateDatabase "+stringUpdate); functions.LogChange(logChangeDetail,3);
					});
				}
			})						
		}
		//console.log(updateData)
		// updateRedisData (stringKey,updateData,Position_Cell);
	}, timeOut, stringKey);
}

function checkPosition (data,returnBool) {
	var checkBool = false;
	var stringQuery = "SELECT * FROM `s"+data.Server_ID+"_unit` WHERE "+
	"`Status`='"+functions.UnitStatus.Standby
	+"' AND `Position_Cell`='"+data.End_Cell
	+"' AND `ID`<>'"+data.ID+"'";
	db_position.query(stringQuery,function (error,rows) {
		if (rows.length>0) {checkBool =true;}
		returnBool(checkBool);
	});
}

function setTimerUpdateDatabase (data,stringKey) {
	// console.log(data.TimeMoveNextCell)
	var timeOut = functions.ExportTimeDatabase(data.TimeMoveNextCell) - functions.GetTime();	
	// console.log(timeOut);

	DictMoveTimeOut[stringKey] = setTimeout(function (stringKey) {
		var updateData = data;
		var Position_Cell = data.Position_Cell;
		// console.log(updateData.Next_Cell,data.ListMove[0].Position_Cell)
		if (data.ListMove.length>0) {
			if (updateData.Next_Cell!=data.ListMove[0].Position_Cell) {
				DetailError = ('Move.js: setTimerUpdateDatabase: '+stringKey); functions.WriteLogError(DetailError,3);
				// console.log(updateData)
				// console.log(updateData.Next_Cell,data.ListMove[0].Position_Cell)
			}else{
				updateData.Position_Cell = data.Next_Cell;
				updateData.Next_Cell = data.ListMove[0].Next_Cell;
				updateData.TimeMoveNextCell = data.ListMove[0].TimeMoveNextCell;					
				updateData.ListMove.shift();
				// console.log(updateData.ListMove)
				updateDatabase (updateData);
				setTimerUpdateDatabase (updateData,stringKey);
			}
		}else{	
			// check pos
			
			// console.log(updateData.Next_Cell)
			var stringUpdate = "UPDATE `s"+data.Server_ID+"_unit` SET"+
			" `Position_Cell`='"+data.Next_Cell
			+"',`Next_Cell`= NULL,`End_Cell`=NULL,`TimeMoveNextCell`=NULL,`TimeFinishMove`=NULL,`ListMove`=NULL,`Status`='"+functions.UnitStatus.Standby+"' "+
			"WHERE `ID`='"+data.ID+"'";
			//console.log(stringUpdate);
			db_position.query(stringUpdate,function (error,result) {
				if (!!error){DetailError = ('Move.js: updateDatabase: '+stringUpdate); functions.WriteLogError(DetailError,3);}
				logChangeDetail =("Move.js: updateDatabase "+stringUpdate); functions.LogChange(logChangeDetail,3);
			});
			
		}
		//console.log(updateData)
		// updateDatabase (updateData);

		//updateDatabase (updateData);
		// updateRedisData (stringKey,updateData,Position_Cell);

	}, timeOut, stringKey);
}

function updateDatabase (data) {
	var stringUpdate = "UPDATE `s"+data.Server_ID+"_unit` SET "
	+"`Position_Cell`='"+data.Position_Cell+"',"
	+"`Next_Cell`='"+data.Next_Cell+"',"
	+"`End_Cell`='"+data.End_Cell+"',"
	+"`TimeMoveNextCell`='"+data.TimeMoveNextCell+"',"
	+"`TimeFinishMove`='"+data.TimeFinishMove+"',"
	+"`ListMove`='"+JSON.stringify(data.ListMove)+"',"
	+"`Status`='"+functions.UnitStatus.Move+
	"' WHERE `ID`='"+data.ID+"'";
	//console.log(stringUpdate);
	db_position.query(stringUpdate,function (error,result) {
		if (!!error){DetailError = ('Move.js: updateDatabase: '+stringUpdate); functions.WriteLogError(DetailError,3);}
		logChangeDetail =("Move.js: updateDatabase "+stringUpdate); functions.LogChange(logChangeDetail,3);
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

	// DictTimeMoveAttack[stringKey] = setTimeout(function (data,stringPos) {
	// 	checkPostionAttackUnit (data,stringPos);
	// }, timeMove, data,stringPos);
}
//checkPostionAttackUnit (S_MOVE_data,'489,82,0',)
function checkPostionAttackUnit (data,stringPos) {
	//attackFunc
	var stringHkey = "s"+data.Server_ID+"_pos";
	client.hexists(stringHkey,stringPos,function (error,rows) {
		var ID_Defend = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;
		if (rows==1) {
			client.hget(stringHkey,stringPos,function (error,rowsPos){
				if (!!error){DetailError = ('Move.js: checkPostionAttackUnit: '+stringPos); functions.WriteLogError(DetailError,3);}	
				var unitResult = rowsPos.split("/").filter(String);
				for (var i = 0; i < unitResult.length; i++) {
					if (unitResult[i].split("_")[2]!=data.ID_User) {
						getAttackData (data,unitResult[i]);
					}			
				}
			});
		}		
	});


}

function getAttackData (data,ID_Player) {
	var checkBoolFriendData = false;
	var checkBoolGuildData = false;
	new Promise((resolve,reject)=>{
		friendData.CheckFriendData (data.ID_User,ID_Player.split("_")[2],function (returnBool) {
			checkBoolFriendData =returnBool;
			resolve();
		})
	}).then(()=>new Promise((resolve,reject)=>{
		guildData.CheckSameGuildID (data.ID_User,ID_Player.split("_")[2],function (returnBool) {
			checkBoolGuildData = returnBool;
			resolve();
		})						
	}).then(()=>new Promise((resolve,reject)=>{
		// console.log(checkBoolFriendData,checkBoolGuildData)
		if (checkBoolFriendData==false&&checkBoolGuildData==false) {
			var ID_Defend = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;
			attackFunc.SetAttackData(data.Server_ID,ID_Defend,ID_Player);
		}
	}))
	)
}




function updateRedisData (stringKey,updateData,Position_Cell) {
	var stringHkey = "s"+updateData.Server_ID+"_unit";
	client.hget(stringHkey,stringKey,function (error,rows) {
		var result = JSON.parse(rows);
		// console.log(result.Position_Cell)
		// console.log(data.Position_Cell)
		// console.log('updateRedisData')
		// console.log(updateData,Position_Cell,rows)
		if (result.Position_Cell!=Position_Cell) {
			DetailError = ('Move.js: updateRedisData: position unit: '+stringKey); functions.WriteLogError(DetailError,3);
		}else{
			result.Position_Cell = updateData.Position_Cell;
			result.Next_Cell = updateData.Next_Cell;
			result.End_Cell = updateData.End_Cell;
			result.TimeMoveNextCell = updateData.TimeMoveNextCell;
			result.TimeFinishMove = updateData.TimeFinishMove;
			result.ListMove = updateData.ListMove;
			result.Status = updateData.Status;
			//console.log(result);
			client.hset(stringHkey,stringKey,JSON.stringify(result));			
		}
	});
}

function clearMoveTimeout (stringData) {
	clearTimeout(DictMoveTimeOut[stringData]);
	delete DictMoveTimeOut[stringData];
}
exports.ClearMoveTimeout = function clearTimeout (stringData) {
	clearMoveTimeout (stringData);
}
