'use strict';

// var db_all_user		= require('./../Util/Database/Db_all_user.js');

var db_position				= require('./../Util/Database/Db_position.js');

var attackFunc    			= require('./../Attack/AttackFunc.js');

var move_GetNewPos 			= require('./Move_GetNewPosition.js')
// var moveUnit 		= require('./../Redis/Move/Move.js');

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
var stringHUnit,stringUnit,stringKeyMove;
var stringMoveAttack;
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
			stringHUnit = "s"+data.S_MOVE.Server_ID+"_unit";
			stringUnit = data.S_MOVE.Server_ID+"_"+data.S_MOVE.ID_Unit+"_"+data.S_MOVE.ID_User+"_"+data.S_MOVE.ID;

			clearMoveTimeout (stringUnit,data);	

			stringKeyMove = "s"+data.S_MOVE.Server_ID+"_move";	
			client.set(stringKeyMove,JSON.stringify(data.S_MOVE));

			R_MOVE (io,socket,data.S_MOVE.ID_User,data.S_MOVE.Server_ID);	
			S_MOVE (io,socket,data.S_MOVE,stringUnit);

			var dataMovingAttack = Object.create(data.S_MOVE);
			dataMovingAttack = {
				Server_ID: data.S_MOVE.Server_ID,
				ID: data.S_MOVE.ID,
				ID_Unit: data.S_MOVE.ID_Unit,
				ID_User: data.S_MOVE.ID_User,
				Position_Cell: data.S_MOVE.Position_Cell,
				Next_Cell: data.S_MOVE.Next_Cell,
				End_Cell: data.S_MOVE.End_Cell,
				TimeMoveNextCell: data.S_MOVE.TimeMoveNextCell,
				TimeFinishMove: data.S_MOVE.TimeFinishMove,
				ListMove: data.S_MOVE.ListMove 
			}
			console.log('Moving.js dataMovingAttack');
			console.log(dataMovingAttack);
			checkMovePos (io,dataMovingAttack,stringUnit);

			// moveUnit_Attack.MOVE_ATTACK(io,data.S_MOVE);
		});
	});
}

function clearMoveTimeout (stringData,data) {
	clearMove (stringData,data)
	clearMoveAttack (stringData,data);	
}

function clearMove (stringData,data) {
	if (DictMoveTimeOut[stringData]!=undefined) {
		clearTimeout(DictMoveTimeOut[stringData]);
		delete DictMoveTimeOut[stringData];
	}
	positionRemove.PostionRemove(data);
}
function clearMoveAttack (stringData,data) {
	stringMoveAttack = "Moving_Attack_"+stringData;
	stringHUnit = "s"+data.Server_ID+"_unit";
	stringHAtttack = "s"+data.Server_ID+"_attack";

	if (DictMoveAttack[stringMoveAttack]!=undefined) {
		clearTimeout(DictMoveAttack[stringMoveAttack]);
		delete DictMoveAttack[stringMoveAttack];
	}

	if (data.Attack_Unit_ID!=null) {
		client.hget(stringHAtttack,data.Attack_Unit_ID,function (error,rows) {
			if (rows!=null) {
				var resultAttack = rows.split("/").filter(String);
				if (resultAttack.includes(stringData)) {
					removeValue (stringHAttack,data.Attack_Unit_ID,rows,stringData);
				}
			}
		})
	}	
}

function removeValue (stringHkey,stringKey,rows,ID_Key) {
	var stringReplace = rows.replace(ID_Key+"/","");
	if (stringReplace.length==0) {
		client.hdel(stringHkey,stringKey);
	}else{
		client.hset(stringHkey,stringKey,stringReplace);
	}
}

// exports.RemoveAttackRedis = function removeAttackRedis2 (Server_ID,ID_Defend,ID_Attack) {
// 	stringHAttack = "s"+Server_ID+"_attack";

// 	client.hget(stringHAttack,stringKeyDefend,function (error,rows) {
// 		if (rows!=null) {
// 			var resultAttack = rows.split("/").filter(String);
// 			if (resultAttack.includes(ID_Attack)) {
// 				removeValue (stringHAttack,stringKeyDefend,rows,ID_Attack);
// 			}
// 		}				
// 	});
// }

function checkMovePos (io,data,stringKey) {
	var posCheck = data.Position_Cell;
	var timeNext = 0, timeOut = 0;
	var Position_Cell_X,Position_Cell_Y,Next_Cell_X,Next_Cell_Y;
	

	stringMoveAttack = "Moving_Attack_"+stringKey;
	checkCurrentPos (io,data,stringKey,posCheck);

	if (data.TimeMoveNextCell!=null) {
		Position_Cell_X = data.Position_Cell.toString().split(",")[0];
		Position_Cell_Y = data.Position_Cell.toString().split(",")[1];
		Next_Cell_X = data.Next_Cell.toString().split(",")[0];
		Next_Cell_Y = data.Next_Cell.toString().split(",")[1];
		var caseMove = functions.CaseMove.Straight;	

		if (Position_Cell_X!=Next_Cell_X&&Next_Cell_Y!=Next_Cell_Y) {caseMove = functions.CaseMove.Diagonal;}

		timeNext = functions.ExportTimeDatabase(data.TimeMoveNextCell) - functions.GetTime();

		switch (caseMove) {
			case functions.CaseMove.Straight:
			if (timeNext == functions.TimeMove.Straight) {
				console.log('timeNext == functions.TimeMove.Straight');
				timeOut = functions.TimeMove.Straight*0.5;
			}else{
				console.log('timeNext != functions.TimeMove.Straight');
				timeOut =  timeNext - (functions.TimeMove.Straight*0.5);
			}

			console.log('timeOut');
			console.log(timeOut);

			// if (timeNext>functions.TimeMove.Straight) {
			// 	timeOut = timeNext - (functions.TimeMove.Straight*0.5);
			// }else if (timeNext == functions.TimeMove.Straight) {
			// 	timeOut = functions.TimeMove.Straight*0.5
			// }else if (timeNext < functions.TimeMove.Straight) {
			// 	timeOut =  timeNext - (functions.TimeMove.Straight*0.5)
			// }

			break;

			case functions.CaseMove.Diagonal:
			if (timeNext == functions.TimeMove.Diagonal) {
				console.log('timeNext == functions.TimeMove.Straight');
				timeOut = functions.TimeMove.Diagonal*0.5;
			}else{
				console.log('timeNext != functions.TimeMove.Diagonal');
				timeOut =  timeNext - (functions.TimeMove.Diagonal*0.5);
			}
			break;
		}
		if (timeOut<0) {timeOut=0;}
		console.log('timeOut')
		console.log(timeOut);

		DictMoveAttack[stringMoveAttack]=setTimeout(function (io,data,stringKey) {
			var updateData = data;
			if (data.ListMove.length>0) {
				updateData.Position_Cell = data.Next_Cell;
				updateData.Next_Cell = data.ListMove[0].Next_Cell;
				updateData.TimeMoveNextCell = data.ListMove[0].TimeMoveNextCell;
				updateData.ListMove.shift();
			}else{
				updateData.Position_Cell = data.End_Cell;
				updateData.Next_Cell = null;
				updateData.End_Cell = null;
				updateData.ListMove = null;
				updateData.TimeMoveNextCell = null;
				updateData.TimeFinishMove = null;
				updateData.Status = 6;
			}

			checkMovePos (io,updateData,stringKey);
		}, timeOut,io,data,stringKey)

	}else {
		if (data.End_Cell!=null) {posCheck=data.End_Cell;}	
		checkCurrentPos (io,data,stringKey,posCheck);
	}


}
function checkCurrentPos (io,data,stringKey,pos) {
	stringHPos ="s"+data.Server_ID+"_pos";
	stringHUnit = "s"+data.Server_ID+"_unit";
	var ID_User = stringKey.split("_")[2];
	var arrayUnitInPos = [];
	var tempListUnitInPos = [];
	var listUnitAttack = [];
	var checkBoolFriendData = false, checkBoolGuildData = false;
	var getAttackBool = false;
	var defendingUnit;

	positionCheckPos.GetPosition(stringKey,pos,function (returnPosArray) {
		// returnPosArray;
		new Promise((resolve,reject)=>{
			client.hget(stringHPos,pos,function (error,rows) {
				if (rows!=null) {
					arrayUnitInPos = rows.split("/").filter(String);
					for (var i = 0; i < arrayUnitInPos.length; i++) {
						if (listUnit[i].split("_")[2] != ID_User) {
							tempListUnitInPos.push(arrayUnitInPos[i]);
						}						
					}
				}else{
					attackFunc.ClearIntervalAttack(stringKey)
				}
				resolve();
			})
		}).then(()=>new Promise((resolve,reject)=>{
			
			if (tempListUnitInPos.length>0) {
				tempListUnitInPos.forEach(function (unit) {
					new Promise((resolve,reject)=>{
						friendData.CheckFriendData (ID_User,unit.split("_")[2],function (returnBool) {
							checkBoolFriendData = returnBool;
							resolve();
						});
					}).then(()=>new Promise((resolve,reject)=>{
						guildData.CheckSameGuildID (ID_User,unit.split("_")[2],function (returnBool) {
							checkBoolGuildData = returnBool;
							resolve();
						});
					}).then(()=>new Promise((resolve,reject)=>{
						if (checkBoolFriendData==false&&checkBoolGuildData==false) {
							client.hget(stringHUnit,unit,function (error,rows) {
								if (rows!=null) {
									var result = JSON.parse(rows);
									if (result.Status==6&&result.Attack_Unit_ID==null) {																		
										attackBool = true;
										// listUnitAttack.push(unit)
										attackFunc.SetAttackData(data.Server_ID,stringKey,unit);
										resolve();
									}
								}
							})
						}
					}).then(()=>new Promise((resolve,reject)=>{
						if (attackBool == true) {
							attackFunc.AttackInterval(io,data.Server_ID,stringKey);
							resolve();
						}

					})
					)
					)
					)
				})
				
			}
			resolve();
		}).then(()=>new Promise((resolve,reject)=>{
			if (tempListUnitInPos.length>0&&(data.TimeMoveNextCell==null&&data.Attack_Unit_ID==null)) {

				new Promise((resolve,reject)=>{
					client.hmget(stringHUnit,tempListUnitInPos,function (error,rowsUnit) {
						for (var i = 0; i < rowsUnit.length; i++) {
							var resultUnitAttack = JSON.parse(rowsUnit[i])
							if (returnPosArray.includes(resultUnitAttack.Position_Cell)) {
								getAttackBool= true;
								defendingUnit = tempListUnitInPos[i];
								break;
							}
						}
						resolve();
					})
				}).then(()=> new Promise((resolve,reject)=>{
					if (getAttackBool==true) {
						attackFunc.SetAttackData(data.Server_ID,defendingUnit,stringKey);
						resolve()
					}
				}).then(()=>new Promise((resolve,reject)=>{
					attackFunc.AttackInterval(io,data.Server_ID,defendingUnit);
				}))
				)
			}
		})
		)
		)
		
	});
}

function setTimerUpdateDatabase (io,socket,data,stringKey) {

	var	timeOut  = functions.ExportTimeDatabase(data.TimeMoveNextCell) - functions.GetTime();

	DictMoveTimeOut[stringKey] = setTimeout(function (stringKey) {
		var updateData = data;
		var Position_Cell = data.Position_Cell;

		if (data.ListMove.length>0) {

			updateData.Position_Cell = data.Next_Cell;
			updateData.Next_Cell = data.ListMove[0].Next_Cell;
			updateData.TimeMoveNextCell = data.ListMove[0].TimeMoveNextCell;
			updateData.ListMove.shift();

			updateDatabase (updateData);
			setTimerUpdateDatabase (io,socket,updateData,stringKey);			
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
					updateData.Position_Cell = data.End_Cell;
					updateData.Next_Cell = null;
					updateData.End_Cell = null;
					updateData.ListMove = null;
					updateData.TimeMoveNextCell = null;
					updateData.TimeFinishMove = null;
					updateData.Status = 6;
					
					positionAdd.AddPosition(updateData);
				}
				updateRedisDataPosition (stringKey,updateData,Position_Cell);
			})						
		}

		updateRedisDataPosition (stringKey,updateData,Position_Cell);
	}, timeOut, stringKey);
}

function updateRedisDataPosition (stringKey,updateData,Position_Cell) {
	stringHUnit = "s"+updateData.Server_ID+"_unit";
	// console.log('stringKey '+stringKey)
	// console.log('stringHUnit '+stringHUnit)
	client.hget(stringHUnit,stringKey,function (error,rows){
		if (rows!=null) {
			var result = JSON.parse(rows);
			result.Position_Cell = updateData.Position_Cell;
			result.Next_Cell = updateData.Next_Cell;
			result.End_Cell = updateData.End_Cell;
			result.TimeMoveNextCell = updateData.TimeMoveNextCell;
			result.TimeFinishMove = updateData.TimeFinishMove;
			result.ListMove = updateData.ListMove;
			result.Status = updateData.Status;
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
	currentTime = functions.GetTime();
	data.TimeMoveNextCell = functions.ImportTimeToDatabase(new Date(currentTime + data.TimeMoveNextCell).toISOString());
	data.TimeFinishMove = functions.ImportTimeToDatabase(new Date(currentTime + data.TimeFinishMove).toISOString());
	var ListMove = data.ListMove;
	for (var i = 0; i < ListMove.length; i++) {
		ListMove[i].TimeMoveNextCell = functions.ImportTimeToDatabase(new Date(currentTime + ListMove[i].TimeMoveNextCell).toISOString());		
	}
	
	updateDataBase (data);
	setTimerUpdateDatabase (io,socket,data,stringUnit);
}

function updateDataBase (data) {
	var stringUpdate;
	var stringQuery = "SELECT * FROM `s"+data.Server_ID+"_unit` WHERE `ID`='"+data.ID+"'";
	
	db_position.query(stringQuery,function (error,rows) {
		if (!!error){DetailError = ('Unit_Moving.js: query '+stringQuery); functions.WriteLogError(DetailError,2);}
		// console.log("Attack_Unit_ID_Moving: "+rows[0].Attack_Unit_ID)
		if (rows[0]!=undefined) {
			if (rows[0].Attack_Unit_ID!=null) {
				updateRedisAttack (data.Server_ID,rows[0].Attack_Unit_ID,rows[0]);
				var ID_Defend = Server_ID+"_"+rows[0].ID_Unit+"_"+rows[0].ID_User+"_"+rows[0].ID;
				attackFunc.RemoveAttackRedis(Server_ID,ID_Defend,ID_Attack);
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
					updateRedisData (data,rowsUpdate[0]);
				});
			});	
		}

	});
}
function updateRedisData (data,rowsData) {
	var stringHUnit ="s"+data.Server_ID+"_unit";
	var stringUnit = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;
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