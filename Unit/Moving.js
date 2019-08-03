'use strict';

var db_position				= require('./../Util/Database/Db_position.js');
var moving_Attack 			= require('./Moving_Attack.js');
var attackFunc    			= require('./../Attack/AttackFunc.js');
var move_GetNewPos 			= require('./Move_GetNewPosition.js');

var positionAdd 			= require('./../Redis/Position/Position.js');
var positionCheckPos		= require('./../Redis/Position/Position_CheckPos.js');
var positionRemove 			= require('./../Redis/Position/Position_Remove.js');

// var guildData				= require('./../Redis/Guild/GuildData.js');
// var friendData				= require('./../Redis/Friend/FriendData.js');

var functions 				= require('./../Util/Functions.js');

var DetailError,logChangeDetail;
var currentTime;


var redis 					= require("redis"),
client 						= redis.createClient();
client.select(functions.RedisData.TestUnit);

var Promise = require('promise');

var DictMoveTimeOut = {};
var DictMoveAttack = {};

var stringMoveAttack,stringKeyMove,stringHUnit,stringUnit;
var stringMove;
var stringHSocket,stringHPos,stringHAttack;
// var moveUnit_Attack = require('./Moving_Attack.js');

// console.log(dataMove.S_MOVE.Server_ID)
// var S_MOVE_data = { 
// 	Server_ID: 1,
// 	ID: 10,
// 	ID_Unit: 16,
// 	ID_User: 9,
// 	Position_Cell: '11,11,0',
// 	Next_Cell: '11,11,0',
// 	End_Cell: '11,11,0',
// 	TimeMoveNextCell: '2019-03-19T01:27:24.473',
// 	TimeFinishMove: '2019-03-19T01:27:24.473',
// 	ListMove: [] 
// }

exports.Start = function start (io) {
	io.on('connection', function(socket){
		socket.on('S_MOVE', function (data){

			functions.ShowLog(functions.ShowLogBool.Clear,'Moving.js Start data',[data])

			stringUnit = data.S_MOVE.Server_ID+"_"+data.S_MOVE.ID_Unit+"_"+data.S_MOVE.ID_User+"_"+data.S_MOVE.ID;
			functions.ShowLog(functions.ShowLogBool.Clear,'Moving.js Start data',[stringUnit])

			clearMoveTimeout (io,stringUnit,data.S_MOVE);	
			stringKeyMove = "s"+data.S_MOVE.Server_ID+"_move";
			
			// var stringUnit = rowData.Server_ID+"_"+rowData.ID_Unit+"_"+rowData.ID_User+"_"+rowData.ID;

			functions.ShowLog(functions.ShowLogBool.Clear,'Moving.js Start=>R_MOVE data',[data.S_MOVE.Server_ID,stringKeyMove])
			R_MOVE (io,data.S_MOVE.Server_ID,stringKeyMove,stringUnit);


			new Promise((resolve,reject)=>{
				client.hset(stringKeyMove,stringUnit,JSON.stringify(data.S_MOVE));
				resolve();
			}).then(()=>{
				return new Promise((resolve,reject)=>{
					S_MOVE (io,socket,data.S_MOVE,stringUnit);
					resolve();
				})
			})
		});
	});
}

// #R_MOVE
function R_MOVE (io,Server_ID,stringKMove,stringUnit) {
	functions.ShowLog(functions.ShowLogBool.Clear,'Moving.js R_MOVE Server_ID',[Server_ID])
	
	stringHSocket = "s"+Server_ID+"_socket";
	functions.ShowLog(functions.ShowLogBool.Clear,'Moving.js R_MOVE hgetall stringHSocket',[stringHSocket])
	client.hgetall(stringHSocket,function (error,rows) {
		if (rows!=undefined) {
			var result = rows;
			// delete result[ID_User];
			functions.ShowLog(functions.ShowLogBool.Clear,'Moving.js R_MOVE stringHSocket result',[result])
			if (Object.values(result).length>0) {
				for (var i = 0; i < Object.values(result).length; i++) {						
					sendToClient (io,stringKMove,Object.values(result)[i],stringUnit);
				}
			}

		}		
	});
}
function sendToClient (io,stringKMove,socketID,stringUnit) {
	
	
	functions.ShowLog(functions.ShowLogBool.Clear,'Moving.js sendToClient stringKMove socketID',[stringKeyMove,socketID])
	client.hget(stringKMove,stringUnit,function (error,rowData) {
		io.to(socketID).emit('R_MOVE',{R_MOVE:JSON.parse(rowData)});
	})
}
// function sendToClient2 (io,stringKMove,socketID) {
// 	functions.ShowLog(functions.ShowLogBool.Clear,'Moving.js sendToClient stringKMove socketID',[stringKeyMove,socketID])
// 	client.get(stringKMove,function (error,rowData) {
// 		io.to(socketID).emit('R_MOVE',{R_MOVE:JSON.parse(rowData)});
// 	})
// }
// #R_MOVE

//#S_MOVE
function S_MOVE (io,socket,data,stringUnit) {
	functions.ShowLog(functions.ShowLogBool.Clear,'Moving.js S_MOVE data,stringUnit',[socket,data,stringUnit])
	
	currentTime = functions.GetTime();
	
	data.TimeMoveNextCell = functions.ImportTimeToDatabase(new Date(currentTime + data.TimeMoveNextCell).toISOString());
	data.TimeFinishMove = functions.ImportTimeToDatabase(new Date(currentTime + data.TimeFinishMove).toISOString());

	functions.ShowLog(functions.ShowLogBool.Clear,'Moving.js S_MOVE data.TimeMoveNextCell,data.TimeFinishMove',[data.TimeMoveNextCell,data.TimeFinishMove])

	var ListMove = data.ListMove;
	for (var i = 0; i < ListMove.length; i++) {
		ListMove[i].TimeMoveNextCell = functions.ImportTimeToDatabase(new Date(currentTime + ListMove[i].TimeMoveNextCell).toISOString());		
	}	
	functions.ShowLog(functions.ShowLogBool.Clear,'Moving.js S_MOVE=>updateDataBaseSMOVE data',[data])
	updateDataBaseSMOVE (data);
	functions.ShowLog(functions.ShowLogBool.Clear,'Moving.js S_MOVE=>setTimerUpdateDatabase data',[data,stringUnit])
	setTimerUpdateDatabase (io,socket,data,stringUnit);
}

function updateDataBaseSMOVE (data) {
	functions.ShowLog(functions.ShowLogBool.Clear,'Moving.js updateDataBaseSMOVE data',[data])

	var stringUpdate;
	var stringQuery = "SELECT * FROM `s"+data.Server_ID+"_unit` WHERE `ID`='"+data.ID+"'";	
	
	stringHAttack = "s"+data.Server_ID+"_attack";
	stringUnit = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;
	

	functions.ShowLog(functions.ShowLogBool.Clear,'Moving.js updateDataBaseSMOVE stringQuery,stringHAttack,stringUnit',[stringQuery,stringHAttack,stringUnit])

	if (data.Attack_Unit_ID=="NULL") {
		stringUpdate = "UPDATE `s"+data.Server_ID+"_unit` SET "
		+"`Position_Cell`='"+data.Position_Cell+"',"
		+"`Next_Cell`='"+data.Next_Cell+"',"
		+"`End_Cell`='"+data.End_Cell+"',"
		+"`TimeMoveNextCell`='"+data.TimeMoveNextCell+"',"
		+"`TimeFinishMove`='"+data.TimeFinishMove+"',"
		+"`ListMove`='"+ JSON.stringify(data.ListMove) +"',"
		+"`Attack_Unit_ID`= NULL,"
		+"`Status`='"+functions.UnitStatus.Move+
		"' WHERE `ID`='"+data.ID+"'";
	}else{
		stringUpdate = "UPDATE `s"+data.Server_ID+"_unit` SET "
		+"`Position_Cell`='"+data.Position_Cell+"',"
		+"`Next_Cell`='"+data.Next_Cell+"',"
		+"`End_Cell`='"+data.End_Cell+"',"
		+"`TimeMoveNextCell`='"+data.TimeMoveNextCell+"',"
		+"`TimeFinishMove`='"+data.TimeFinishMove+"',"
		+"`ListMove`='"+ JSON.stringify(data.ListMove) +"',"
		+"`Attack_Unit_ID`='"+ data.Attack_Unit_ID +"',"
		+"`Status`='"+functions.UnitStatus.Move+
		"' WHERE `ID`='"+data.ID+"'";
	}

	db_position.query(stringUpdate,function (error,result) {
		if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'Moving.js updateDataBaseSMOVE stringUpdate',[stringUpdate]);}

		var stringQuery = "SELECT * FROM `s"+data.Server_ID+"_unit` WHERE `ID`='"+data.ID+"'";
		db_position.query(stringQuery,function (error,rowsUpdate) {
			if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'Moving.js updateDataBaseSMOVE stringQuery',[stringQuery]);}
			if (rowsUpdate[0]!=null) {
				updateRedisData (data,rowsUpdate[0]);
			}
			
		});
	});
}

function updateRedisData (data,rowsData) {
	functions.ShowLog(functions.ShowLogBool.Clear,'Moving.js updateRedisData data,rowsData',[data,rowsData])

	stringHUnit ="s"+data.Server_ID+"_unit";
	stringUnit = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;
	functions.ShowLog(functions.ShowLogBool.Clear,'Moving.js updateRedisData stringHUnit,stringUnit',[stringHUnit,stringUnit]);

	client.hset(stringHUnit,stringUnit,JSON.stringify(rowsData));
}

function setTimerUpdateDatabase (io,socket,data,stringKey) {
	functions.ShowLog(functions.ShowLogBool.Clear,'Moving.js setTimerUpdateDatabase data,stringKey',[data,stringKey])
	
	var	timeOut  = functions.ExportTimeDatabase(data.TimeMoveNextCell) - functions.GetTime();
	functions.ShowLog(functions.ShowLogBool.Clear,'Moving.js setTimerUpdateDatabase timeOut',[timeOut])

	var stringMove = "Moving_"+stringKey;

	DictMoveTimeOut[stringMove] = setTimeout(function (stringKey,data) {
		var updateDataMove = data;
		var Position_Cell = data.Position_Cell;

		if (data.ListMove.length>0) {

			updateDataMove.Position_Cell = data.Next_Cell;
			updateDataMove.Next_Cell = data.ListMove[0].Next_Cell;
			updateDataMove.TimeMoveNextCell = data.ListMove[0].TimeMoveNextCell;
			updateDataMove.ListMove.shift();

			// updateDatabase (io,updateDataMove);
			updateDatabase (updateDataMove);
			setTimerUpdateDatabase (io,socket,updateDataMove,stringKey);			
		}else{	
			checkPosition (updateDataMove,function (returnBool) {
				functions.ShowLog(functions.ShowLogBool.Clear,'Moving.js setTimerUpdateDatabase checkPosition data',[returnBool])
				if (returnBool) {
					// console.log(returnBool)					
					if (io!=null) {move_GetNewPos.SendGetNewPos(io,updateDataMove);}
					else{						
						// var express			= require('express');
						// var app				= express();
						// var server			= require('http').createServer(app);
						// var io 				= require('socket.io').listen(server);

						// app.set('port', process.env.PORT);
						console.log('get new pos with no socket');
						// console.log(index.IO);
						functions.ShowLog(functions.ShowLogBool.Clear,'Moving.js setTimerUpdateDatabase=>move_GetNewPos.SendGetNewPos data',[updateDataMove])
						move_GetNewPos.SendGetNewPos(io,updateDataMove);
						// move_GetNewPos.SendGetNewPos(GetIO.IO,updateData);
					}	
				}else{
					var stringUpdate = "UPDATE `s"+data.Server_ID+"_unit` SET"+
					" `Position_Cell`='"+data.Next_Cell
					+"',`Next_Cell`= NULL,`End_Cell`=NULL,`TimeMoveNextCell`= NULL,`TimeFinishMove`=NULL,`ListMove`=NULL,`Status`='"+functions.UnitStatus.Standby+"' "+
					"WHERE `ID`='"+data.ID+"'";
					db_position.query(stringUpdate,function (error,result) {
						if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'Moving.js setTimerUpdateDatabase stringUpdate',[stringUpdate]);}
						logChangeDetail = ("Moving.js: setTimerUpdateDatabase "+stringUpdate); functions.LogChange(logChangeDetail,2);
					});
					updateDataMove.Position_Cell = data.End_Cell;
					Position_Cell = updateDataMove.Position_Cell;
					updateDataMove.Next_Cell = null;
					updateDataMove.End_Cell = null;
					updateDataMove.ListMove = [];
					updateDataMove.TimeMoveNextCell = null;
					updateDataMove.TimeFinishMove = null;
					updateDataMove.Status = 6;

					attackFunc.CheckAttackPosition(io,stringKey,updateDataMove.Position_Cell,null);

					// updateDataMove.Server_ID = parseInt(stringKey.split("_")[0])
					// functions.ShowLog(functions.ShowLogBool.On,'Moving.js setTimerUpdateDatabase=>attackFunc.CheckAttackPosition stringKey,updateDataMove.Position_Cell',[stringKey,updateDataMove.Position_Cell]);
					// var attackBool = true;

					// if (updateDataMove.Attack_Unit_ID==null) {attackBool = false;}
					// if (updateDataMove.Attack_Unit_ID=='null') {attackBool = false;}
					// if (updateDataMove.Attack_Unit_ID=='NULL') {attackBool = false;}

					// if (attackBool == true) {
					// 	attackFunc.SetAttackData(io,updateDataMove.Server_ID,updateDataMove.Attack_Unit_ID,stringKey)
					// }else{
					// 	attackFunc.CheckAttackPosition(io,stringKey,updateDataMove.Position_Cell,null);
					// }
					// functions.ShowLog(functions.ShowLogBool.Check,'Moving.js setTimerUpdateDatabase=>checkAttack updateDatabase.Attack_Unit_ID',[updateDatabase.Attack_Unit_ID]);
					// if (updateDatabase.Attack_Unit_ID.length>6) {
					// 	functions.ShowLog(functions.ShowLogBool.Check,'Moving.js setTimerUpdateDatabase=>checkAttack updateDatabase.Attack_Unit_ID.length',[updateDatabase.Attack_Unit_ID.length]);
					// 	stringHAttack = "s"+data.Server_ID+"_attack";
					// 	client.hget(stringHAttack,updateDatabase.Attack_Unit_ID,function (error,rows) {
					// 		if (rows!=null) {
					// 			var listUnit = rows.split("/").filter(String);

					// 		}
							
					// 	})
					// }
					


					positionAdd.AddPosition(updateDataMove);
				}

				updateRedisDataPosition (stringKey,updateDataMove,Position_Cell);
			})						
		}

		updateRedisDataPosition (stringKey,updateDataMove,Position_Cell);
	}, timeOut, stringKey,data);
}

function updateRedisDataPosition (stringKey,updateDataM,Position_Cell) {

	stringHUnit = "s"+updateDataM.Server_ID+"_unit";
	functions.ShowLog(functions.ShowLogBool.Clear,'Moving.js updateRedisDataPosition hget stringKey,updateDataM,Position_Cell',[stringHUnit,stringKey,updateDataM,Position_Cell])

	client.hget(stringHUnit,stringKey,function (error,rows){
		if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'Moving.js updateRedisDataPosition hget stringHUnit,stringKey',[stringHUnit,stringKey])}
			if (rows!=null) {
				var result = JSON.parse(rows);
				result.Position_Cell = Position_Cell;
				result.Next_Cell = updateDataM.Next_Cell;
				result.End_Cell = updateDataM.End_Cell;
				result.TimeMoveNextCell = updateDataM.TimeMoveNextCell;
				result.TimeFinishMove = updateDataM.TimeFinishMove;
				result.ListMove = updateDataM.ListMove;
				result.Status = updateDataM.Status;
				result.Attack_Unit_ID = updateDataM.Attack_Unit_ID;

				functions.ShowLog(functions.ShowLogBool.Clear,'Moving.js updateRedisDataPosition hset result',[result])
				client.hset(stringHUnit,stringKey,JSON.stringify(result));
			}
		})
	
}

function checkPosition (data,returnBool) {
	functions.ShowLog(functions.ShowLogBool.Clear,'Moving.js checkPosition data',[data])
	var checkBool = false;
	// var stringQuery = "SELECT * FROM `s"+data.Server_ID+"_unit` WHERE "
	// +"`Status`='"+functions.UnitStatus.Standby
	// +"' AND `Position_Cell`='"+data.End_Cell
	// +"' AND `ID`<>'"+data.ID+"'";

	var stringQuery = "SELECT * FROM `s"+data.Server_ID+"_unit` WHERE "
	+"`Position_Cell`='"+data.End_Cell+"'";
	functions.ShowLog(functions.ShowLogBool.Clear,'Moving.js checkPosition stringQuery,data.End_Cell',[stringQuery,data.End_Cell])
	db_position.query(stringQuery,function (error,rows) {
		if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'Moving.js checkPosition stringQuery',[stringQuery]);}
		if (rows.length>0) {checkBool = true;}
		returnBool(checkBool);
	});
}

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
	functions.ShowLog(functions.ShowLogBool.Clear,'Moving.js updateDatabase stringUpdate,data',[stringUpdate,data]);
	db_position.query(stringUpdate,function (error,result) {
		if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'Moving.js updateDatabase stringUpdate',[stringUpdate]);}
		logChangeDetail =("Moving.js: updateDatabase "+stringUpdate); functions.LogChange(logChangeDetail,2);
	});
}
// #S_MOVE
exports.ClearMoveTimeout = function (io,stringData,data){
	clearMoveTimeout (io,stringData,data);
}

function clearMoveTimeout (io,stringData,data) {
	functions.ShowLog(functions.ShowLogBool.Clear,'Moving.js clearMoveTimeout=>clearMove stringData,data',[stringData,data])
	clearMove (stringData,data);
	// clearMoveAttack (io,stringData);
}

function clearMove (stringData,data) {
	
	functions.ShowLog(functions.ShowLogBool.Clear,'Moving.js clearMove=>positionRemove.PostionRemove stringData,data',[stringData,data])
	if (data.Server_ID==null||data.Server_ID==undefined) {
		data.Server_ID = stringData.split("_")[0]
	}
	positionRemove.PostionRemove(data);
	stringMove = "Moving_"+stringData;
	functions.ShowLog(functions.ShowLogBool.Clear,'Moving.js clearMove stringMove',[stringMove])

	if (DictMoveTimeOut[stringMove]!=undefined) {
		clearTimeout(DictMoveTimeOut[stringMove]);
		delete DictMoveTimeOut[stringMove];
	}
}

exports.MoveCalc = function (io,socket,data) {
	moveCalc (io,socket,data)
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
function moveCalc (io,socket,data) {
	// console.log(data)
	var stringHkey = "s"+data.Server_ID+"_unit";
	var stringKey = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;
	// clearMoveTimeout(stringKey);
	functions.ShowLog(functions.ShowLogBool.Clear,'Moving.js moveCalc=>clearMoveTimeout stringKey,data',[stringKey,data])
	clearMoveTimeout (io,stringKey,data)
	positionRemove.PostionRemove(data);
	functions.ShowLog(functions.ShowLogBool.Clear,'Moving.js moveCalc=>setTimerUpdateDatabase data,stringKey',[data,stringKey])
	setTimerUpdateDatabase (io,socket,data,stringKey);

}

// function setTimerUpdateDatabase (io,socket,data,stringKey) {
// 	// console.log(data.TimeMoveNextCell)
// 	var	timeOut = functions.ExportTimeDatabase(data.TimeMoveNextCell) - functions.GetTime();		
// 	// console.log(timeOut);
// 	DictMoveTimeOut[stringKey] = setTimeout(function (stringKey) {
// 		var updateData = data;
// 		// console.log(data)
// 		var Position_Cell = data.Position_Cell;
// 		// console.log(updateData.Next_Cell,data.ListMove[0].Position_Cell)
// 		if (data.ListMove.length>0) {
// 			// console.log(updateData)
// 			updateData.Position_Cell = data.Next_Cell;
// 			updateData.Next_Cell = data.ListMove[0].Next_Cell;
// 			updateData.TimeMoveNextCell = data.ListMove[0].TimeMoveNextCell;
// 			updateData.ListMove.shift();
// 			// console.log(updateData.ListMove)
// 			updateDatabase (updateData);
// 			// updateRedisData (stringKey,updateData,Position_Cell);
// 			setTimerUpdateDatabase (io,socket,updateData,stringKey);

// 		}else{	
// 			checkPosition (updateData,function (returnBool) {
// 				if (returnBool) {
// 					// console.log(returnBool)					
// 					if (io!=null) {move_GetNewPos.SendGetNewPos(io,updateData);}
// 					else{						
// 						// var express			= require('express');
// 						// var app				= express();
// 						// var server			= require('http').createServer(app);
// 						// var io 				= require('socket.io').listen(server);

// 						// app.set('port', process.env.PORT);
// 						console.log('get new pos with no socket');
// 						// console.log(index.IO);
// 						move_GetNewPos.SendGetNewPos(io,updateData);
// 						// move_GetNewPos.SendGetNewPos(GetIO.IO,updateData);
// 					}	
// 				}else{
// 					var stringUpdate = "UPDATE `s"+data.Server_ID+"_unit` SET"+
// 					" `Position_Cell`='"+data.Next_Cell
// 					+"',`Next_Cell`= NULL,`End_Cell`=NULL,`TimeMoveNextCell`=NULL,`TimeFinishMove`=NULL,`ListMove`=NULL,`Status`='"+functions.UnitStatus.Standby+"' "+
// 					"WHERE `ID`='"+data.ID+"'";
// 					db_position.query(stringUpdate,function (error,result) {
// 						if (!!error){DetailError = ('Move.js: updateDatabase: '+stringUpdate); functions.WriteLogError(DetailError,2);}
// 						logChangeDetail = ("Move.js: updateDatabase "+stringUpdate); functions.LogChange(logChangeDetail,2);
// 					});
// 					updateData.Position_Cell = data.End_Cell;
// 					updateData.Next_Cell = null;
// 					updateData.End_Cell = null;
// 					updateData.ListMove = null;
// 					updateData.TimeMoveNextCell = null;
// 					updateData.TimeFinishMove = null;
// 					updateData.Status = 6;

// 					positionAdd.AddPosition(updateData);
// 					checkAttackData (io,data);

// 				}
// 				updateRedisData (stringKey,updateData,Position_Cell);
// 			})						
// 		}
// 		//console.log(updateData)
// 		updateRedisData (stringKey,updateData,Position_Cell);
// 	}, timeOut, stringKey);
// }