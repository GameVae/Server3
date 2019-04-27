'use strict';

// var db_all_user		= require('./../Util/Database/Db_all_user.js');
var db_position				= require('./../Util/Database/Db_position.js');

var functions 				= require('./../Util/Functions.js');

var guildData				= require('./../Redis/Guild/GuildData.js');
var friendData				= require('./../Redis/Friend/FriendData.js');

var attackFunc 				= require('./../Redis/Attack/Attack.js');

var DetailError,LogChange;
var currentTime;
var stringKeyMove;

var redis 				= require("redis"),
client 					= redis.createClient();
client.select(functions.RedisData.TestUnit);

var Promise = require('promise');

var stringUnitMoving;
var DictTimeMoveAttack = {};
var stringHPos, stringHUnit;

// exports.Test = function test (param) {
// 	console.log(param)
// }

exports.ClearMoveTimeout = function clearMoveTimeout2 (stringData) {
	clearMoveTimeout (stringData)
}

function clearMoveTimeout (stringData) {
	if (DictTimeMoveAttack[stringData]!=undefined) {
		clearTimeout(DictTimeMoveAttack[stringData]);
		delete DictTimeMoveAttack[stringData];
	}
}

exports.S_MOVE_ATT = function S_MOVE_ATT (io,data) {
	 
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

//
// S_MOVE_ATT (S_MOVE_data)

function S_MOVE_ATT (io,data) {
	// console.log('S_MOVE_ATT')
	// console.log(data)
	var stringData = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;
	clearMoveTimeout (stringData);
	
	var dataMove =  Object.create(data)
	dataMove={
		Server_ID:data.Server_ID,
		ID:data.ID,
		ID_Unit:data.ID_Unit,
		ID_User:data.ID_User,
		Position_Cell:data.Position_Cell,
		Next_Cell:data.Next_Cell,
		End_Cell:data.End_Cell,
		TimeMoveNextCell:data.TimeMoveNextCell,
		TimeFinishMove:data.TimeFinishMove,
		ListMove:data.ListMove,
		Attack_Unit_ID:data.Attack_Unit_ID,
	}
	// console.log(dataMove);
	// // console.log(data);
	// checkCurrentPosition (io,dataMove,dataMove.Position_Cell);

	// stringUnitMoving = dataMove.Server_ID+"_"+dataMove.ID_Unit+"_"+dataMove.ID_User+"_"+dataMove.ID;
	// clearMoveTimeout2 (stringUnitMoving);

	checkTimeMoveAttack (io,dataMove,stringData);
}

function checkTimeMoveAttack (io,data,stringUnitMoving) {
	//check theo timemovenextcell/2
	// console.log(data)

	var timeMove = 0;
	var stringPos = data.Position_Cell;
	// stringUnitMoving = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;

	if (data.TimeMoveNextCell!=null) {
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

		if (data.TimeMoveNextCell>timeCheck) {
			// timeMove = data.TimeMoveNextCell - timeCheck;
			timeMove = data.TimeMoveNextCell + 100;
			stringPos = data.Next_Cell;
		}else{
			timeMove = data.TimeMoveNextCell;
			checkCurrentPosition (io,data,data.Position_Cell);
		}
		// console.log(timeMove)
		// console.log(stringUnitMoving)

		DictTimeMoveAttack[stringUnitMoving] = setTimeout(function (data,stringPos) {
			//lay thong tin data?
			stringHUnit = "s"+data.Server_ID+"_unit";
			client.hexists(stringHUnit,stringUnitMoving,function (error,rowBool) {
				if (rowBool==1) {
					client.hget(stringHUnit,stringUnitMoving,function (error,rows) {
						// var resultData = JSON.parse(rows)
						var resultData = convertTimeMove (JSON.parse(rows));
						checkTimeMoveAttack (io,resultData);
						checkCurrentPosition (io,resultData,stringPos);
					});
				}else{
					clearTimeout(DictTimeMoveAttack[stringUnitMoving]);
					delete DictTimeMoveAttack[stringUnitMoving];
				}
			})
			
		}, timeMove,data,stringPos);
	}else{
		checkCurrentPosition (io,data,stringPos);
		clearMoveTimeout2 (stringPos);
	}	
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

	if (ListMove!=null) {
		for (var i = 0; i < ListMove.length; i++) {
			ListMove[i].TimeMoveNextCell = functions.ExportTimeDatabase(ListMove[i].TimeMoveNextCell) - currentTime;
		}
	}
	// console.log(returnData)
	return returnData;
}



// var dataS = {
// 	Server_ID: 1,
// 	ID: 51,
// 	ID_Unit: 16,
// 	ID_User: 42,
// 	Position_Cell: '11,8,0',
// 	Next_Cell: '12,7,0',
// 	End_Cell: '13,4,0',
// 	TimeMoveNextCell: '2019-04-25T01:22:19.983',
// 	TimeFinishMove: '2019-04-25T01:22:23.769',
// 	ListMove:
// 	[ { Position_Cell: '12,7,0',
// 	Next_Cell: '12,6,0',
// 	TimeMoveNextCell: '2019-04-25T01:22:21.245' },
// 	{ Position_Cell: '12,6,0',
// 	Next_Cell: '13,5,0',
// 	TimeMoveNextCell: '2019-04-25T01:22:22.507' },
// 	{ Position_Cell: '13,5,0',
// 	Next_Cell: '13,4,0',
// 	TimeMoveNextCell: '2019-04-25T01:22:23.769' } ],
// 	Attack_Unit_ID: 'NULL'
// }
// var posT = '11,8,0';

// checkCurrentPosition (dataS,posT)
function checkCurrentPosition (io,data,pos) {
	// check unit co ton tai khong
	// console.log(data,pos);

	stringHPos = "s"+data.Server_ID+"_pos";
	stringHUnit ="s"+data.Server_ID+"_unit";
	stringUnitMoving = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;
	// var stringHUnit = "s"+data.Server_ID+"_unit";
	// var pos = data.Position_Cell;
	var unitBool = false;
	new Promise((resolve,reject)=>{
		client.hexists(stringHUnit,stringUnitMoving,function (error,rowBool) {
			if (rowBool==1) {
				unitBool = true;
			}
			resolve();
		})
	}).then(()=>new Promise((resolve,reject)=>{
		
		if (unitBool == true) {			
			client.hexists(stringHPos,pos,function (error,resultPos) {
				
				if (resultPos==1) {
					client.hget(stringHPos,pos,function (error,rowsUnit) {
						console.log(rowsUnit)
						if (rowsUnit!=null) {
							var unitResult = rowsUnit.split("/").filter(String);

							for (var i = 0; i < unitResult.length; i++) {
								var Attack_ID = unitResult[i].split("_")[2]
								if (Attack_ID!=data.ID_User) {
									getAttackData (io,data,unitResult[i]);
								}
							}
						}						
						
					})
				}

			});	
		}else{
			clearMoveTimeout2 (stringUnitMoving);
		}
		resolve();
	})
	)
	

}
// getAttackData (S_MOVE_data,ID_Player)
function getAttackData (io,data,ID_Player) {
	// console.log(data,ID_Player)
	var checkBoolFriendData = false;
	var checkBoolGuildData = false;
	var attackBool = false;
	var ID_Defend;

	if (data.ID_User!=ID_Player.split("_")[2]) {

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
			console.log(checkBoolFriendData,checkBoolGuildData)
			if (checkBoolFriendData==false&&checkBoolGuildData==false) {
				ID_Defend = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;
				// console.log(ID_Player);
				stringHUnit = "s"+data.Server_ID+"_unit";
				client.hget(stringHUnit,ID_Player,function (error,rows) {
					var result = JSON.parse(rows);
					if (rows.Status==functions.UnitStatus.Standby) {
						attackBool = true;
						attackFunc.SetAttackData(data.Server_ID,ID_Defend,ID_Player);
						resolve();
					}
				})				
			}
		}).then(()=>new Promise((resolve,reject)=>{
			if (attackBool == true) {
				console.log('ID_Defend:'+ID_Defend)
				attackFunc.AttackInterval(io,data.Server_ID,ID_Defend);
				resolve();
			}			
		}))
		)
		)
	}
	
}