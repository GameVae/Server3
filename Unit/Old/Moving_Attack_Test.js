'use strict';

// var db_all_user		= require('./../Util/Database/Db_all_user.js');
// var db_position				= require('./../Util/Database/Db_position.js');

var functions 				= require('./../Util/Functions.js');
// console.log(functions.TimeMove.Straight)
var guildData				= require('./../Redis/Guild/GuildData.js');
var friendData				= require('./../Redis/Friend/FriendData.js');

var attackFunc 				= require('./../Attack/AttackFunc.js');

var DetailError,LogChange;
var currentTime;
var stringKeyMove;

var redis 				= require("redis"),
client 					= redis.createClient();
client.select(functions.RedisData.TestUnit);

var Promise = require('promise');

var stringUnitMoving;
var DictTimeMoveAttack = {};
var stringHPos, stringHUnit,stringHAttack,stringHMoveAttack;
var stringTimeout;
// exports.Test = function test (param) {
// 	console.log(param)
// }

exports.ClearMoveTimeout = function clearMoveTimeout2 (stringData) {
	stringTimeout = "Unit_Moving_"+stringData;
	clearMoveTimeout (stringTimeout)
	// clearMoveTimeout (stringData);
}

function clearMoveTimeout (stringData) {
	if (DictTimeMoveAttack[stringData]!=undefined) {
		clearTimeout(DictTimeMoveAttack[stringData]);
		delete DictTimeMoveAttack[stringData];
	}
}

exports.Start = function start (io) {
	io.on('connection', function(socket){
		socket.on('S_MOVE', function (data){			
			// S_MOVE (io,socket,data.S_MOVE);		
			S_MOVE_ATT (io,data.S_MOVE);		
		});
	});
}

// var S_MOVE_data = { 
// 	Server_ID: 1,
// 	ID: 47,
// 	ID_Unit: 16,
// 	ID_User: 42,
// 	Position_Cell: '10,10,0',
// 	Next_Cell: '11,9,0',
// 	End_Cell: '12,8,0',
// 	TimeMoveNextCell: '2019-04-24T04:26:39.137',
// 	TimeFinishMove: '2019-04-24T04:26:41.799',
// 	ListMove:
// 	[ { Position_Cell: '11,9,0',
// 	Next_Cell: '11,8,0',
// 	TimeMoveNextCell: '2019-04-24T04:26:40.399' },
// 	{ Position_Cell: '11,8,0',
// 	Next_Cell: '12,8,0',
// 	TimeMoveNextCell: '2019-04-24T04:26:41.799' } ],
// 	Attack_Unit_ID: 'NULL' }

var S_MOVE_data ={ Server_ID: 1,
	ID: 57,
	ID_Unit: 16,
	ID_User: 42,
	Position_Cell: '9,4,0',
	Next_Cell: '10,5,0',
	End_Cell: '12,9,0',
	TimeMoveNextCell: '2019-05-03T02:12:24.645',
	TimeFinishMove: '2019-05-03T02:12:29.693',
	ListMove:
	[ { Position_Cell: '10,5,0',
	Next_Cell: '10,6,0',
	TimeMoveNextCell: '2019-05-03T02:12:25.907' },
	{ Position_Cell: '10,6,0',
	Next_Cell: '11,7,0',
	TimeMoveNextCell: '2019-05-03T02:12:27.169' },
	{ Position_Cell: '11,7,0',
	Next_Cell: '11,8,0',
	TimeMoveNextCell: '2019-05-03T02:12:28.431' },
	{ Position_Cell: '11,8,0',
	Next_Cell: '12,9,0',
	TimeMoveNextCell: '2019-05-03T02:12:29.693' } ],
	Attack_Unit_ID: 'NULL' }
//
// S_MOVE_ATT (null,S_MOVE_data)

function S_MOVE_ATT (io,data) {
	
	// console.log(data)
	stringHMoveAttack = "s"+data.Server_ID+"_movingAttack";
	stringUnitMoving = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;
	// clearMoveTimeout ("Unit_Moving_"+stringUnitMoving);
	stringTimeout = "Unit_Moving_"+stringUnitMoving;
	clearMoveTimeout (stringTimeout);
	clearAttackUnit (stringUnitMoving);

	new Promise((resolve,reject)=>{
		client.hset(stringHMoveAttack,stringUnitMoving,JSON.stringify(data), function (error,rows) {
			if (!!error) {console.log(error)}
				resolve();
		});
	}).then(()=>new Promise((resolve,reject)=>{
		client.hget(stringHMoveAttack,stringUnitMoving,function (error,rows) {
			var result = JSON.parse(rows);
			checkTimeMoveAttack(io,result);
			resolve();
		})
	})
	);


	// var dataMove =  Object.create(data);

	// dataMove = {
	// 	Server_ID: data.Server_ID,
	// 	ID: data.ID,
	// 	ID_Unit: data.ID_Unit,
	// 	ID_User: data.ID_User,
	// 	Position_Cell: data.Position_Cell,
	// 	Next_Cell: data.Next_Cell,
	// 	End_Cell: data.End_Cell,
	// 	TimeMoveNextCell: data.TimeMoveNextCell,
	// 	TimeFinishMove: data.TimeFinishMove,
	// 	ListMove: data.ListMove,
	// 	Attack_Unit_ID: data.Attack_Unit_ID,
	// }
	// // console.log(dataMove);
	// // console.log(data);
	
	// // checkCurrentPosition (io,dataMove,data.Position_Cell);
	// checkTimeMoveAttack (io,dataMove);

	
	
	// // stringUnitMoving = dataMove.Server_ID+"_"+dataMove.ID_Unit+"_"+dataMove.ID_User+"_"+dataMove.ID;
	// // clearMoveTimeout2 (stringUnitMoving);
}

function clearAttackUnit (stringUnitMoving) {
	stringHUnit = "s"+stringUnitMoving.split("_")[0]+"_unit";
	stringHAttack = "s"+stringUnitMoving.split("_")[0]+"_attack";
	
	client.hexists(stringHUnit,stringUnitMoving,function (error,resultBool) {
		if (resultBool==1) {
			client.hget(stringHUnit,stringUnitMoving,function (error,rows){
				var result = JSON.parse(rows);
				// console.log('result.Attack_Unit_ID: '+result.Attack_Unit_ID)
				if (result.Attack_Unit_ID!=null) {
					// console.log(stringHAttack,result.Attack_Unit_ID,stringUnitMoving)
					attackFunc.RemoveRedisData(stringHAttack,result.Attack_Unit_ID,stringUnitMoving);
				}
			})
		}
	})
}
function checkTimeMoveAttack (io,data) {
	// console.log(data)
	stringHUnit = "s"+data.Server_ID+"_unit";
	stringUnitMoving = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;

	client.hexists(stringHUnit,stringUnitMoving,function (error,rowResult) {
		if (rowResult==1) {
			checkCurrentPosition (io,data,data.Position_Cell);
			
			if (data.TimeMoveNextCell!=data.TimeFinishMove&&data.Next_Cell!=data.End_Cell) {
				calcMove (io,data,stringUnitMoving);
			}
			else if (data.TimeMoveNextCell==data.TimeFinishMove&&data.Next_Cell==data.End_Cell) {
				var timeOutLast = (functions.ExportTimeDatabase(data.TimeMoveNextCell) - functions.GetTime())*0.5;
				DictTimeMoveAttack[stringUnitMoving] = setTimeout(function (io,data) {
					data.TimeMoveNextCell = null;
					data.TimeFinishMove = null;
					checkCurrentPosition (io,data,data.End_Cell);
				}, timeOutLast,io,data);
			}

		}else {
			clearMoveTimeout(stringUnitMoving);
		}
	});	
}
function checkTimeMoveAttack2 (io,data) {
	// console.log(data)
	stringHUnit = "s"+data.Server_ID+"_unit";
	stringUnitMoving = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;

	client.hexists(stringHUnit,stringUnitMoving,function (error,rowResult) {
		if (rowResult==1) {
			checkCurrentPosition (io,data,data.Position_Cell);

			if (data.TimeMoveNextCell!=data.TimeFinishMove&&data.Position_Cell!=data.End_Cell) {
				calcMove (io,data,stringUnitMoving);
			}else{
				var timeOutLast = (functions.ExportTimeDatabase(data.TimeMoveNextCell) - functions.GetTime())*0.5;
				DictTimeMoveAttack[stringUnitMoving] = setTimeout(function (io,data) {
					data.TimeMoveNextCell = null;
					data.TimeFinishMove = null;
					checkCurrentPosition (io,data,data.End_Cell);
				}, timeOutLast,io,data);
			}							
		}else {
			clearMoveTimeout(stringUnitMoving);
		}
	});	
}


function calcMove (io,data,stringUnitMoving) {
	// console.log('stringUnitMoving: '+stringUnitMoving)
	var timeOut,timeNextCellAttack;
	var timeCheck = calcTimeCheck (data);
	var nextCellTime = timeCheck*0.5;

	// console.log(data)
	var timeMoveObj = Object.create(data);

	timeMoveObj = {
		Server_ID: data.Server_ID,
		ID: data.ID,
		ID_Unit: data.ID_Unit,
		ID_User: data.ID_User,
		Position_Cell: data.Position_Cell,
		Next_Cell: data.Next_Cell,
		End_Cell: data.End_Cell,
		TimeMoveNextCell: data.TimeMoveNextCell,
		TimeFinishMove: data.TimeFinishMove,
		ListMove: data.ListMove,
		Attack_Unit_ID: data.Attack_Unit_ID,
	}
	// console.log(timeMoveObj)
	if (timeMoveObj.TimeMoveNextCell == timeMoveObj.TimeFinishMove||timeMoveObj.Next_Cell == timeMoveObj.End_Cell) {
		timeNextCellAttack = (functions.ExportTimeDatabase(timeMoveObj.TimeMoveNextCell) - functions.GetTime())*0.5;	
		timeMoveObj.Position_Cell = data.End_Cell;
		timeMoveObj.Next_Cell = null;
		timeMoveObj.End_Cell = null;
		timeMoveObj.TimeMoveNextCell = null;
		timeMoveObj.TimeFinishMove = null;
		timeMoveObj.ListMove = [];		
	}else{
		if (timeMoveObj.ListMove.length>0) {
			// console.log('timeMoveObj.ListMove.length: '+timeMoveObj.ListMove.length)
			timeMoveObj.Position_Cell = data.Next_Cell;
			timeMoveObj.Next_Cell = data.ListMove[0].Next_Cell;
			// timeMoveObj.End_Cell = data.End_Cell;
			timeMoveObj.TimeMoveNextCell = data.ListMove[0].TimeMoveNextCell;		
			timeMoveObj.ListMove.shift();	
		}else {
			timeMoveObj.Position_Cell = data.Next_Cell;
			timeMoveObj.Next_Cell = data.End_Cell;
			timeMoveObj.TimeMoveNextCell = data.TimeFinishMove;					
		}
	}

	if (timeMoveObj.TimeMoveNextCell!=null&&timeMoveObj.TimeMoveNextCell!=timeMoveObj.TimeFinishMove) {
		timeOut = functions.ExportTimeDatabase(timeMoveObj.TimeMoveNextCell) - functions.GetTime();
		if (timeOut > timeCheck) {			
			timeNextCellAttack = timeOut - nextCellTime;
		}else if (timeOut == timeCheck) {
			timeNextCellAttack = nextCellTime;
		}
	}
	// if (timeMoveObj.TimeMoveNextCell!=null&&timeMoveObj.TimeMoveNextCell==timeMoveObj.TimeFinishMove) {
	// 	timeNextCellAttack = (functions.ExportTimeDatabase(timeMoveObj.TimeMoveNextCell) - functions.GetTime())*0.5;
	// }
	// console.log("timeNextCellAttack: "+timeNextCellAttack);

	DictTimeMoveAttack[stringUnitMoving] = setTimeout(function (io,timeMoveObj) {
		checkTimeMoveAttack (io,timeMoveObj)
	}, timeNextCellAttack,io,timeMoveObj);

}

function calcTimeCheck (data) {
	var timeCheck;
	var Position_Cell_X = data.Position_Cell.split(',')[0];
	var Position_Cell_Y = data.Position_Cell.split(',')[1];
	var Next_Cell_X = data.Next_Cell.split(',')[0];
	var Next_Cell_Y = data.Next_Cell.split(',')[1];
	var caseReturn =1;
	if (Position_Cell_X != Next_Cell_X && Position_Cell_Y != Next_Cell_Y) {caseReturn = 2;}
	switch (caseReturn) {
		case 1:
		timeCheck = functions.TimeMove.Straight;
		break;
		case 2:
		timeCheck = functions.TimeMove.Diagonal;
		break;
	}
	return timeCheck;
}

function checkCurrentPosition (io,data,pos) {
	console.log(new Date().toISOString()+"_"+pos);

	stringHPos = "s"+data.Server_ID+"_pos";
	stringHUnit = "s"+data.Server_ID+"_unit";
	stringUnitMoving = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;
	
	var unitBool = false;
	var posBool = false;

	new Promise((resolve,reject)=>{
		attackFunc.ClearIntervalAttack(stringUnitMoving);
		resolve();
	}).then(()=> new Promise((resolve,reject)=>{
		client.hexists(stringHPos,pos,function (error,resultPos) {
			if (resultPos==1) {
				posBool = true;
			}
			resolve();
		});
	}).then(()=>new Promise((resolve,reject)=>{
		if (posBool == true) {
			client.hget(stringHPos,pos,function (error,rowsUnit) {
				var unitResult = rowsUnit.split("/").filter(String);
				for (var i = 0; i < unitResult.length; i++) {
					var Attack_ID = unitResult[i].split("_")[2];
					if (Attack_ID!=data.ID_User) {
						getAttackData (io,data,unitResult[i]);
						// break;
					}
				}
			});
		}
	}))
	);

}

// getAttackData (S_MOVE_data,stringKeyAttack)
function getAttackData (io,data,stringKeyAttack) {
	// console.log(data,stringKeyAttack)
	var checkBoolFriendData = false;
	var checkBoolGuildData = false;
	var attackBool = false;
	var stringKeyDefend;	

	new Promise((resolve,reject)=>{
		friendData.CheckFriendData (data.ID_User,stringKeyAttack.split("_")[2],function (returnBool) {
			checkBoolFriendData = returnBool;
			resolve();
		})
	}).then(()=>new Promise((resolve,reject)=>{
		guildData.CheckSameGuildID (data.ID_User,stringKeyAttack.split("_")[2],function (returnBool) {
			checkBoolGuildData = returnBool;
			resolve();
		})						
	}).then(()=>new Promise((resolve,reject)=>{
		// console.log(checkBoolFriendData,checkBoolGuildData)
		if (checkBoolFriendData==false&&checkBoolGuildData==false) {
			stringKeyDefend = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;
			// console.log(stringKeyAttack);
			stringHUnit = "s"+data.Server_ID+"_unit";
			client.hget(stringHUnit,stringKeyAttack,function (error,rows) {
				if (rows!=null) {
					var result = JSON.parse(rows);
					if (result.Status==functions.UnitStatus.Standby) {
						attackBool = true;
						attackFunc.SetAttackData(data.Server_ID,stringKeyDefend,stringKeyAttack);
						resolve();
					}
				}
				
			})				
		}
	}).then(()=>new Promise((resolve,reject)=>{
		if (attackBool == true) {
			// console.log('stringKeyDefend:'+stringKeyDefend)
			// console.log(data.TimeFinishMove)
			if (data.TimeFinishMove==null) {
				// console.log(data);
				// console.log('hrer')
				attackFunc.CheckAttackedUnit(io,data.Server_ID,stringKeyDefend);
			}			
			attackFunc.AttackInterval(io,data.Server_ID,stringKeyDefend);
			resolve();
		}			
	}))
	)
	)		
}

// convertTimeMove (S_MOVE_data)
function convertTimeMove (data) {
	var returnData=data;
	currentTime = functions.GetTime();
	if (returnData.TimeMoveNextCell!=null) {
		returnData.TimeMoveNextCell = functions.ExportTimeDatabase(returnData.TimeMoveNextCell) - currentTime;
	}
	if (returnData.TimeFinishMove!=null) {
		returnData.TimeFinishMove = functions.ExportTimeDatabase(returnData.TimeFinishMove) - currentTime;
	}
	var ListMove = returnData.ListMove;

	if (ListMove.length>0) {
		for (var i = 0; i < ListMove.length; i++) {
			ListMove[i].TimeMoveNextCell = functions.ExportTimeDatabase(ListMove[i].TimeMoveNextCell) - currentTime;
		}
	}
	// console.log(returnData)
	return returnData;
}