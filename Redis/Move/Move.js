'use strict';

// var GetIO 					= require('./../../GetIO.js');
var move_GetNewPos 			= require('./Move_GetNewPosition.js');

var db_position				= require('./../../Util/Database/Db_position.js');
var attackFunc 				= require('./../Attack/Attack.js');
var guildData				= require('./../Guild/GuildData.js');
var friendData				= require('./../Friend/FriendData.js');
var positionAdd 			= require('./../Position/Position.js');
var positionCheck 			= require('./../Position/Position_Check.js');
var positionRemove 			= require('./../Position/Position_Remove.js');

var attacking    			= require('./../../Unit/Attacking.js');
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

var stringHkey,stringKey;
exports.Test = function test (data) {
	console.log(data)
}
exports.MoveCalc = function moveCalc (io,socket,data) {
	moveCalc2 (io,socket,data)
}

var S_MOVE_data = { 
	Server_ID: 1,
	ID: 10,
	ID_Unit: 16,
	ID_User: 9,
	Position_Cell: '11,11,0',
	Next_Cell: '11,11,0',
	End_Cell: '11,11,0',
	TimeMoveNextCell: '2019-03-19T01:27:24.473',
	TimeFinishMove: '2019-03-19T01:27:24.473',
	ListMove: [] 
}
//
// moveCalc2 (S_MOVE_data)
function moveCalc2 (io,socket,data) {
	// console.log(data)
	stringHkey = "s"+data.Server_ID+"_unit";
	stringKey = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;
	clearMoveTimeout(stringKey);
	positionRemove.PostionRemove(data);
	setTimerUpdateDatabase2 (io,socket,data,stringKey);
}

function setTimerUpdateDatabase2 (io,socket,data,stringKey) {
	// console.log(data.TimeMoveNextCell)
	var	timeOut = functions.ExportTimeDatabase(data.TimeMoveNextCell) - functions.GetTime();		
	// console.log(timeOut);
	DictMoveTimeOut[stringKey] = setTimeout(function (stringKey) {
		var updateData = data;
		// console.log(data)
		var Position_Cell = data.Position_Cell;
		// console.log(updateData.Next_Cell,data.ListMove[0].Position_Cell)
		if (data.ListMove.length>0) {
			// console.log(updateData)
			if (updateData.Next_Cell!=data.ListMove[0].Position_Cell) {
				DetailError = ('Move.js: setTimerUpdateDatabase: '+stringKey); functions.WriteLogError(DetailError,2);
				// console.log(updateData)
				// console.log(updateData.Next_Cell,data.ListMove[0].Position_Cell)
			}else{
				updateData.Position_Cell = data.Next_Cell;
				updateData.Next_Cell = data.ListMove[0].Next_Cell;
				updateData.TimeMoveNextCell = data.ListMove[0].TimeMoveNextCell;
				updateData.ListMove.shift();
				// console.log(updateData.ListMove)
				updateDatabase (updateData);
				// updateRedisData (stringKey,updateData,Position_Cell);
				setTimerUpdateDatabase2 (io,socket,updateData,stringKey);
			}
		}else{	
			checkPosition (updateData,function (returnBool) {				
				if (returnBool) {
					// console.log(returnBool)					
					if (io!=null) {move_GetNewPos.SendGetNewPos(io,updateData);}
					else{						
						// var express			= require('express');
						// var app				= express();
						// var server			= require('http').createServer(app);
						// var io 				= require('socket.io').listen(server);

						// app.set('port', process.env.PORT);
						console.log('get new pos with no socket');
						// console.log(index.IO);
						move_GetNewPos.SendGetNewPos(io,updateData);
						// move_GetNewPos.SendGetNewPos(GetIO.IO,updateData);
					}	
				}else{
					var stringUpdate = "UPDATE `s"+data.Server_ID+"_unit` SET"+
					" `Position_Cell`='"+data.Next_Cell
					+"',`Next_Cell`= NULL,`End_Cell`=NULL,`TimeMoveNextCell`=NULL,`TimeFinishMove`=NULL,`ListMove`=NULL,`Status`='"+functions.UnitStatus.Standby+"' "+
					"WHERE `ID`='"+data.ID+"'";
					db_position.query(stringUpdate,function (error,result) {
						if (!!error){DetailError = ('Move.js: updateDatabase: '+stringUpdate); functions.WriteLogError(DetailError,2);}
						logChangeDetail = ("Move.js: updateDatabase "+stringUpdate); functions.LogChange(logChangeDetail,2);
					});
					updateData.Position_Cell = data.Next_Cell;
					updateData.Next_Cell = null;
					updateData.End_Cell = null;
					updateData.ListMove = null;
					updateData.TimeMoveNextCell = null;
					updateData.TimeFinishMove = null;
					updateData.Status = 6;
					
					positionAdd.AddPosition(updateData);
					checkAttackData (io,data);

				}
				updateRedisData (stringKey,updateData,Position_Cell);
			})						
		}
		//console.log(updateData)
		updateRedisData (stringKey,updateData,Position_Cell);
	}, timeOut, stringKey);
}
var dataCheck={
	Server_ID: 1,
	ID: 36,
	ID_Unit: 16,
	ID_User: 42,
	Position_Cell: '11,12,0',
	Next_Cell: null,
	End_Cell: null,
	TimeMoveNextCell: null,
	TimeFinishMove: null,
	ListMove: null,
	Attack_Unit_ID: '1_16_9_10',
	Status: 6 }
//
// checkAttackData (dataCheck)
function checkAttackData (io,data) {
	// console.log(data);
	stringHkey = "s"+data.Server_ID+"_unit";
	stringKey = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;

	client.hget(stringHkey,stringKey,function (error,rows) {
		var result = JSON.parse(rows);
		// console.log("result.Attack_Unit_ID:"+result.Attack_Unit_ID)
		if(result.Attack_Unit_ID!="NULL"){
			// console.log(data,stringKey)
			checkPositionAttackUnit (io,data,stringKey);
		}
	});
}
//send move add unit
function checkPositionAttackUnit (io,data,stringKey) {
	var returnArrayPos=[];
	var posDefend;
	var boolAttack = false;
	var stringKeyDefend = data.Attack_Unit_ID;
	var stringHUnit = "s"+data.Server_ID+"_unit";
	var stringKeyAttack =data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;
	// console.log(data,stringKey)
	new Promise((resolve,reject)=>{
		positionCheck.GetPosition(stringKey,function (returnPosArray) {
			returnArrayPos =returnPosArray;
			resolve();
		});
	}).then(()=>new Promise((resolve,reject)=>{
		// console.log(data.Attack_Unit_ID);
		client.hget(stringHUnit,data.Attack_Unit_ID,function (error,rows) {
			var result = JSON.parse(rows)
			posDefend = result.Position_Cell;
			resolve();
		});
	}).then(()=>new Promise((resolve,reject)=>{
		// console.log(returnArrayPos,posDefend)
		if (returnArrayPos.includes(posDefend)) {

			boolAttack= true;
			attackFunc.SetAttackData(data.Server_ID,stringKeyDefend,stringKey);

		}else{
			/*remove unit database*/
			var stringUpdate = "UPDATE `s"+data.Server_ID+"_unit` SET `Attack_Unit_ID`= NULL WHERE `ID`='"+data.ID+"'";
			db_position.query(stringUpdate,function (error,result) {
				if (!!error){DetailError = ('Move.js: updateDatabase: '+stringUpdate); functions.WriteLogError(DetailError,2);}
				logChangeDetail =("Move.js: updateDatabase "+stringUpdate); functions.LogChange(logChangeDetail,2);
			});

			client.hget(stringHkey,stringKey,function (error,rows) {
				var result = JSON.parse(rows);
				result.Attack_Unit_ID = 'null';
				client.hset(stringHkey,stringKey,JSON.stringify(result));
			})
		}
		resolve();
	}).then(()=>new Promise((resolve,reject)=>{
		if (boolAttack==true) {
			attackFunc.AttackInterval(io,data.Server_ID,stringKeyDefend);
			attacking.CheckUnitDefend(io,stringKeyAttack,stringKeyDefend,data.Position_Cell);
		}	
		resolve();
	})))
	)
}

function checkPosition (data,returnBool) {
	var checkBool = false;
	// console.log('checkPosition')
	// console.log(data)
	var stringQuery = "SELECT * FROM `s"+data.Server_ID+"_unit` WHERE "
	+"`Status`='"+functions.UnitStatus.Standby
	+"' AND `Position_Cell`='"+data.End_Cell
	+"' AND `ID`<>'"+data.ID+"'";
	db_position.query(stringQuery,function (error,rows) {
		if (rows.length>0) {checkBool =true;}
		returnBool(checkBool);
	});
}
// var index = require('./../../index');
// console.log(index.Test('hi'))
function updateDatabase (data) {
	var stringUpdate = "UPDATE `s"+data.Server_ID+"_unit` SET "
	+"`Position_Cell`='"+data.Position_Cell+"',"
	+"`Next_Cell`='"+data.Next_Cell+"',"
	+"`End_Cell`='"+data.End_Cell+"',"
	+"`TimeMoveNextCell`='"+data.TimeMoveNextCell+"',"
	+"`TimeFinishMove`='"+data.TimeFinishMove+"',"
	+"`ListMove`='"+JSON.stringify(data.ListMove)+"',"
	+"`Attack_Base_ID`= NULL,"
	+"`Attack_Unit_ID`= NULL,"
	+"`Status`='"+functions.UnitStatus.Move+
	"' WHERE `ID`='"+data.ID+"'";
	//console.log(stringUpdate);
	db_position.query(stringUpdate,function (error,result) {
		if (!!error){DetailError = ('Move.js: updateDatabase: '+stringUpdate); functions.WriteLogError(DetailError,2);}
		logChangeDetail =("Move.js: updateDatabase "+stringUpdate); functions.LogChange(logChangeDetail,2);
	});
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
			DetailError = ('Move.js: updateRedisData: position unit: '+stringKey); functions.WriteLogError(DetailError,2);
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

function setTimerMoveAttack (data,stringData) {
	// if (data.TimeMoveNextCell!=null) {checkTimeMoveNextCell (data,stringData);}
}

exports.ClearMoveTimeMoveAttack = function clearMoveTimeMoveAttack2 (stringData) {
	clearMoveTimeMoveAttack (stringData);
}
function clearMoveTimeMoveAttack (stringData) {
	clearTimeout(DictTimeMoveAttack[stringData]);
	delete DictTimeMoveAttack[stringData];
}

// chua
// function checkPostionAttackUnit (data,stringPos) {
// 	//attackFunc
// 	var stringHkey = "s"+data.Server_ID+"_pos";
// 	client.hexists(stringHkey,stringPos,function (error,rows) {
// 		var ID_Defend = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;
// 		if (rows==1) {
// 			client.hget(stringHkey,stringPos,function (error,rowsPos){
// 				if (!!error){DetailError = ('Move.js: checkPostionAttackUnit: '+stringPos); functions.WriteLogError(DetailError,2);}	
// 				var unitResult = rowsPos.split("/").filter(String);
// 				for (var i = 0; i < unitResult.length; i++) {
// 					if (unitResult[i].split("_")[2]!=data.ID_User) {
// 						getAttackData (data,unitResult[i]);
// 					}			
// 				}
// 			});
// 		}		
// 	});
// }

// function getAttackData (data,ID_Player) {
// 	var checkBoolFriendData = false;
// 	var checkBoolGuildData = false;
// 	var ID_Defend;
// 	new Promise((resolve,reject)=>{
// 		friendData.CheckFriendData (data.ID_User,ID_Player.split("_")[2],function (returnBool) {
// 			checkBoolFriendData =returnBool;
// 			resolve();
// 		})
// 	}).then(()=>new Promise((resolve,reject)=>{
// 		guildData.CheckSameGuildID (data.ID_User,ID_Player.split("_")[2],function (returnBool) {
// 			checkBoolGuildData = returnBool;
// 			resolve();
// 		})						
// 	}).then(()=>new Promise((resolve,reject)=>{
// 		// console.log(checkBoolFriendData,checkBoolGuildData)
// 		if (checkBoolFriendData==false&&checkBoolGuildData==false) {
// 			// ID_Defend = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;
// 			ID_Defend = data.Attack_Unit_ID;
// 			attackFunc.SetAttackData(data.Server_ID,ID_Defend,ID_Player);
// 		}
// 	}).then(()=>new Promise((resolve,reject)=>{
// 		attackFunc.AttackInterval(data.Server_ID,ID_Defend);
// 	})))
// 	)
// }

// function checkTimeMoveNextCell (data,stringKey) {
// 	data.TimeMoveNextCell = functions.ExportTimeDatabase(data.TimeMoveNextCell) - functions.GetTime();
// 	var Position_Cell_X = data.Position_Cell.split(',')[0];
// 	var Position_Cell_Y = data.Position_Cell.split(',')[1];
// 	var Next_Cell_X = data.Next_Cell.split(',')[0];
// 	var Next_Cell_Y = data.Next_Cell.split(',')[1];
// 	var caseReturn = 1;
// 	var timeCheck = 0;

// 	if (Position_Cell_X!=Next_Cell_X&&Position_Cell_Y!=Next_Cell_Y) {caseReturn = 2};
// 	switch (caseReturn) {
// 		case 1:
// 		timeCheck = functions.TimeMove.Straight*0.5;
// 		break;
// 		case 2:
// 		timeCheck = functions.TimeMove.Diagonal*0.5;
// 		break;
// 	}

// 	var timeMove = 0;
// 	var stringPos = data.Position_Cell;
// 	if (data.TimeMoveNextCell>timeCheck) {
// 		timeMove = data.TimeMoveNextCell - timeCheck;
// 		stringPos = data.Next_Cell;
// 	}

// 	// DictTimeMoveAttack[stringKey] = setTimeout(function (data,stringPos) {
// 	// 	checkPostionAttackUnit (data,stringPos);
// 	// }, timeMove, data,stringPos);
// }
//checkPostionAttackUnit (S_MOVE_data,'489,82,0',)
