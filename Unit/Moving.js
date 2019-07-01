'use strict';

// var db_all_user		= require('./../Util/Database/Db_all_user.js');

var db_position				= require('./../Util/Database/Db_position.js');

var attackFunc    			= require('./../Attack/AttackFunc.js');

var move_GetNewPos 			= require('./Move_GetNewPosition.js');

var moving_Attack 			= require('./Moving_Attack.js');



// var moveUnit 			= require('./Move/Move.js');
var positionAdd 			= require('./../Redis/Position/Position.js');
var positionCheckPos		= require('./../Redis/Position/Position_CheckPos.js');
var positionRemove 			= require('./../Redis/Position/Position_Remove.js');

var guildData				= require('./../Redis/Guild/GuildData.js');
var friendData				= require('./../Redis/Friend/FriendData.js');

var functions 				= require('./../Util/Functions.js');

var DetailError,logChangeDetail;
var currentTime;
var stringKeyMove;

var redis 					= require("redis"),
client 						= redis.createClient();
client.select(functions.RedisData.TestUnit);

var Promise = require('promise');

var DictMoveTimeOut = {};
var DictMoveAttack = {};

var stringMoveAttack,stringHUnit,stringHPos,stringHAtttack,stringKeyMove,stringUnit;
var stringMove;
// var moveUnit_Attack = require('./Moving_Attack.js');

// console.log(dataMove.S_MOVE.Server_ID)
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

exports.Start = function start (io) {
	io.on('connection', function(socket){
		socket.on('S_MOVE', function (data){
			// console.log('S_MOVE')
			// console.log(data)						
			stringUnit = data.S_MOVE.Server_ID+"_"+data.S_MOVE.ID_Unit+"_"+data.S_MOVE.ID_User+"_"+data.S_MOVE.ID;
			clearMoveTimeout (stringUnit,data);	
			stringKeyMove = "s"+data.S_MOVE.Server_ID+"_move";
			client.set(stringKeyMove,JSON.stringify(data.S_MOVE));

			R_MOVE (io,socket,data.S_MOVE.ID_User,data.S_MOVE.Server_ID);	
			S_MOVE (io,socket,data.S_MOVE,stringUnit);
			moving_Attack.Moving_Attack(io,socket,data.S_MOVE);

			// var dataMovingAttack = Object.create(data.S_MOVE);
			// dataMovingAttack = {
			// 	Server_ID: data.S_MOVE.Server_ID,
			// 	ID: data.S_MOVE.ID,
			// 	ID_Unit: data.S_MOVE.ID_Unit,
			// 	ID_User: data.S_MOVE.ID_User,
			// 	Position_Cell: data.S_MOVE.Position_Cell,
			// 	Next_Cell: data.S_MOVE.Next_Cell,
			// 	End_Cell: data.S_MOVE.End_Cell,
			// 	TimeMoveNextCell: data.S_MOVE.TimeMoveNextCell,
			// 	TimeFinishMove: data.S_MOVE.TimeFinishMove,
			// 	ListMove: data.S_MOVE.ListMove 
			// }
			// console.log('Moving.js dataMovingAttack');
			// console.log(dataMovingAttack);


			// moveUnit_Attack.MOVE_ATTACK(io,data.S_MOVE);
		});
	});
}

function clearMoveTimeout (stringData,data) {
	clearMove (stringData,data)
	clearMoveAttack (stringData,data);	
}
function clearMoveAttack (stringData,data) {
	attackFunc.ClearAttackUnit(stringData);
	
}
function clearMove (stringData,data) {
	stringMove = "Moving_"+stringData;
	if (DictMoveTimeOut[stringMove]!=undefined) {
		clearTimeout(DictMoveTimeOut[stringMove]);
		delete DictMoveTimeOut[stringMove];
	}
	positionRemove.PostionRemove(data);
}

function removeValue (stringHkey,stringKey,rows,ID_Key) {
	var stringReplace = rows.replace(ID_Key+"/","");
	if (stringReplace.length==0) {
		client.hdel(stringHkey,stringKey);
	}else{
		client.hset(stringHkey,stringKey,stringReplace);
	}
}

function setTimerUpdateDatabase (io,socket,data,stringKey) {

	var	timeOut  = functions.ExportTimeDatabase(data.TimeMoveNextCell) - functions.GetTime();
	var stringMove = "Moving_"+stringKey;
	DictMoveTimeOut[stringMove] = setTimeout(function (stringKey) {
		var updateDataMove = data;
		var Position_Cell = data.Position_Cell;

		if (data.ListMove.length>0) {

			updateDataMove.Position_Cell = data.Next_Cell;
			updateDataMove.Next_Cell = data.ListMove[0].Next_Cell;
			updateDataMove.TimeMoveNextCell = data.ListMove[0].TimeMoveNextCell;
			updateDataMove.ListMove.shift();

			updateDatabase (updateDataMove);
			setTimerUpdateDatabase (io,socket,updateDataMove,stringKey);			
		}else{	
			checkPosition (updateDataMove,function (returnBool) {
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
						move_GetNewPos.SendGetNewPos(io,updateDataMove);
						// move_GetNewPos.SendGetNewPos(GetIO.IO,updateData);
					}	
				}else{
					var stringUpdate = "UPDATE `s"+data.Server_ID+"_unit` SET"+
					" `Position_Cell`='"+data.Next_Cell
					+"',`Next_Cell`= NULL,`End_Cell`=NULL,`TimeMoveNextCell`= NULL,`TimeFinishMove`=NULL,`ListMove`=NULL,`Status`='"+functions.UnitStatus.Standby+"' "+
					"WHERE `ID`='"+data.ID+"'";
					db_position.query(stringUpdate,function (error,result) {
						if (!!error){DetailError = ('Move.js: updateDatabase: '+stringUpdate); functions.WriteLogError(DetailError,2);}
						logChangeDetail = ("Move.js: updateDatabase "+stringUpdate); functions.LogChange(logChangeDetail,2);
					});
					updateDataMove.Position_Cell = data.End_Cell;
					updateDataMove.Next_Cell = null;
					updateDataMove.End_Cell = null;
					updateDataMove.ListMove = [];
					updateDataMove.TimeMoveNextCell = null;
					updateDataMove.TimeFinishMove = null;
					updateDataMove.Status = 6;

					attackFunc.CheckAttackPosition(io,stringKey,updateDataMove.Position_Cell);

					positionAdd.AddPosition(updateDataMove);


				}
				updateRedisDataPosition (stringKey,updateDataMove,Position_Cell);
			})						
		}

		updateRedisDataPosition (stringKey,updateDataMove,Position_Cell);
	}, timeOut, stringKey);
}

function updateRedisDataPosition (stringKey,updateDataM,Position_Cell) {
	var stringHUnit = "s"+updateDataM.Server_ID+"_unit";
	// console.log('stringKey '+stringKey)
	// console.log('stringHUnit '+stringHUnit)
	client.hget(stringHUnit,stringKey,function (error,rows){
		if (rows!=null) {
			var result = JSON.parse(rows);
			result.Position_Cell = Position_Cell;
			result.Next_Cell = updateDataM.Next_Cell;
			result.End_Cell = updateDataM.End_Cell;
			result.TimeMoveNextCell = updateDataM.TimeMoveNextCell;
			result.TimeFinishMove = updateDataM.TimeFinishMove;
			result.ListMove = updateDataM.ListMove;
			result.Status = updateDataM.Status;

			client.hset(stringHUnit,stringKey,JSON.stringify(result));
		}
	})
	
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
	db_position.query(stringUpdate,function (error,result) {
		if (!!error){DetailError = ('Moving.js: updateDatabase: '+stringUpdate); functions.WriteLogError(DetailError,2);}
		logChangeDetail =("Moving.js: updateDatabase "+stringUpdate); functions.LogChange(logChangeDetail,2);
	});
}

function R_MOVE (io,socket,ID_User,Server_ID) {
	var stringHSocket = "s"+Server_ID+"_socket";
	// console.log('stringHSocket: '+stringHSocket)
	client.hgetall(stringHSocket,function (error,rows) {
		if (rows!=undefined) {
			var result = rows;
			// delete result[ID_User];
			if (Object.values(result).length>0) {
				for (var i = 0; i < Object.values(result).length; i++) {						
					sendToClient (io,Object.values(result)[i])
				}
			}
		}		
	});
}

function sendToClient (io,socketID) {
	client.get(stringKeyMove,function (error,rowData) {
		io.to(socketID).emit('R_MOVE',{R_MOVE:JSON.parse(rowData)});
	})
}

function S_MOVE (io,socket,data,stringUnit) {
	// console.log('S_MOVE ')
	// console.log(data)
	currentTime = functions.GetTime();
	data.TimeMoveNextCell = functions.ImportTimeToDatabase(new Date(currentTime + data.TimeMoveNextCell).toISOString());
	data.TimeFinishMove = functions.ImportTimeToDatabase(new Date(currentTime + data.TimeFinishMove).toISOString());
	var ListMove = data.ListMove;
	for (var i = 0; i < ListMove.length; i++) {
		ListMove[i].TimeMoveNextCell = functions.ImportTimeToDatabase(new Date(currentTime + ListMove[i].TimeMoveNextCell).toISOString());		
	}
	
	updateDataBase (io,data);
	setTimerUpdateDatabase (io,socket,data,stringUnit);
}

function updateDataBase (io,data) {
	var stringUpdate;
	var stringQuery = "SELECT * FROM `s"+data.Server_ID+"_unit` WHERE `ID`='"+data.ID+"'";
	
	stringUnit = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;
	

	db_position.query(stringQuery,function (error,rows) {
		if (!!error){DetailError = ('Unit_Moving.js: query '+stringQuery); functions.WriteLogError(DetailError,2);}
		// console.log("Attack_Unit_ID_Moving: "+rows[0].Attack_Unit_ID)
		if (rows[0]!=undefined) {
			if (rows[0].Attack_Unit_ID!=null) {
				updateRedisAttack (data,rows[0].Attack_Unit_ID,rows[0]);
				var ID_Defend = data.Server_ID+"_"+rows[0].ID_Unit+"_"+rows[0].ID_User+"_"+rows[0].ID;
				var ID_Attack = rows[0].Attack_Unit_ID;
				attackFunc.RemoveRedisData(data.Server_ID,ID_Defend,ID_Attack);

			}
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
				if (!!error){DetailError = ('Unit_Moving.js: query '+stringUpdate); functions.WriteLogError(DetailError,2);}
				logChangeDetail='Unit_Moving.js: updateDataBase: '+stringUpdate;functions.LogChange(logChangeDetail,2);
				
				var stringQuery = "SELECT * FROM `s"+data.Server_ID+"_unit` WHERE `ID`='"+data.ID+"'";
				db_position.query(stringQuery,function (error,rowsUpdate) {
					updateRedisData (io,data,rowsUpdate[0]);
					
				});
			});	
		}

	});
}
function updateRedisAttack (data,Attack_Unit_ID,rowsUpdate) {
	stringUnit = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;
	stringHUnit = "s"+data.Server_ID+"_unit";
	client.hset(stringHUnit,stringUnit,JSON.stringify(rowsUpdate))
}
function updateRedisData (io,data,rowsData) {
	// console.log(data)
	stringHUnit ="s"+data.Server_ID+"_unit";
	stringUnit = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;
	
	// console.log('stringHUnit,stringUnit')
	// console.log(stringHUnit,stringUnit)
	client.hset(stringHUnit,stringUnit,JSON.stringify(rowsData));
}
function checkPosition (data,returnBool) {
	var checkBool = false;
	var stringQuery = "SELECT * FROM `s"+data.Server_ID+"_unit` WHERE "
	+"`Status`='"+functions.UnitStatus.Standby
	+"' AND `Position_Cell`='"+data.End_Cell
	+"' AND `ID`<>'"+data.ID+"'";
	db_position.query(stringQuery,function (error,rows) {
		if (rows.length>0) {checkBool =true;}
		returnBool(checkBool);
	});
}