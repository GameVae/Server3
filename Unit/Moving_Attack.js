'use strict';

var positionAdd 			= require('./../Redis/Position/Position.js');
var positionCheckPos		= require('./../Redis/Position/Position_CheckPos.js');
var positionRemove 			= require('./../Redis/Position/Position_Remove.js');

var guildData				= require('./../Redis/Guild/GuildData.js');
var friendData				= require('./../Redis/Friend/FriendData.js');

var attackFunc    			= require('./../Attack/AttackFunc.js');
// var position_Check			= require('./../Redis/Position/Position_Check.js');


var functions 				= require('./../Util/Functions.js');

var DetailError,LogChange;
var currentTime;
var stringKeyMove;

var redis 				= require("redis"),
client 					= redis.createClient();
client.select(functions.RedisData.TestUnit);

// var stringUnitMoving;
// var DictTimeMoveAttack = {};
var stringHPos, stringHUnit, stringHAttack, stringMoveAttack;
var DictMoveAttack ={};
// var stringTimeout;

var Promise = require('promise');
var data ={
	Server_ID: 1,
	ID: 551,
	ID_Unit: 16,
	ID_User: 43,
	Position_Cell: '288,0,0',
	Next_Cell: '289,0,0',
	End_Cell: '292,0,0',
	TimeMoveNextCell: '2019-06-17T08:31:36.494',
	TimeFinishMove: '2019-06-17T08:31:40.694',
	ListMove: [ [Object], [Object], [Object] ],
	Attack_Unit_ID: 'NULL'
}
exports.Moving_Attack = function moving_Attack2(io,socket,data) {
	// console.log('Moving_Attack.js data');
	// console.log(data);
	var stringUnit = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;
	var dataMoving = Object.create(data);
	dataMoving = {
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
		Attack_Unit_ID: data.Attack_Unit_ID
	}
	checkMovePos (io,data,stringUnit);
}

function checkMovePos (io,data,stringKey) {
	// console.log(data)
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

		if (Position_Cell_X!=Next_Cell_X&&Position_Cell_Y!=Next_Cell_Y) {caseMove = functions.CaseMove.Diagonal;}

		timeNext = functions.ExportTimeDatabase(data.TimeMoveNextCell) - functions.GetTime();

		switch (caseMove) {
			case functions.CaseMove.Straight:
			if (timeNext == functions.TimeMove.Straight) {
				// console.log('timeNext == functions.TimeMove.Straight');
				timeOut = functions.TimeMove.Straight*0.5;
			}else{
				// console.log('timeNext != functions.TimeMove.Straight');
				timeOut =  timeNext - (functions.TimeMove.Straight*0.5);
			}
			break;

			case functions.CaseMove.Diagonal:
			// console.log('functions.CaseMove.Diagonal');
			if (timeNext == functions.TimeMove.Diagonal) {
				// console.log('timeNext == functions.TimeMove.Diagonal');
				timeOut = functions.TimeMove.Diagonal*0.5;
			}else{
				// console.log('timeNext != functions.TimeMove.Diagonal');
				timeOut =  timeNext - (functions.TimeMove.Diagonal*0.5);
			}
			break;
		}
		if (timeOut<0) {console.log('timeOut<0');console.log(timeOut);}
		// console.log('timeOut')
		// console.log(timeOut);
		// clearTimeout(DictMoveAttack[stringMoveAttack])

		DictMoveAttack[stringMoveAttack]=setTimeout(function (io,data,stringKey) {
			var updateData = data;
			
			if (data.ListMove.length>0) {
				updateData.Position_Cell = data.Next_Cell;
				updateData.Next_Cell = data.ListMove[0].Next_Cell;
				updateData.TimeMoveNextCell = data.ListMove[0].TimeMoveNextCell;
				
			}else{
				updateData.TimeMoveNextCell = null
			}
			checkMovePos (io,updateData,stringKey);
		}, timeOut,io,data,stringKey);		
	}
}

exports.CheckCurrentPos = function checkCurrentPos2 (io,data,stringKey,pos) {
	checkCurrentPos (io,data,stringKey,pos);
}

function checkCurrentPos (io,data,stringKey,pos) {
	// var dataNewPos ={
	// 	// Position_Cell: data.Position_Cell,
	// 	// Next_Cell: data.Next_Cell,
	// 	PositionCheck: pos,
	// }
	// console.log('dataNewPos')
	// console.log(dataNewPos)
	// console.log('stringKey')
	// console.log(stringKey)
	// io.emit('R_TESTMOVE',{R_TESTMOVE:dataNewPos});

	var stringHPos ="s"+data.Server_ID+"_pos";
	stringHUnit = "s"+data.Server_ID+"_unit";
	var ID_User = stringKey.split("_")[2];
	var arrayUnitInPos = [];
	var tempListUnitInPos = [];
	var listUnitAttack = [];
	// var listUnit = [];
	var checkBoolFriendData = false, checkBoolGuildData = false;
	var getAttackBool = false;
	var attackBool = false;
	var defendingUnit;

	positionCheckPos.GetPosition(stringKey,pos,function (returnPosArray) {
		// returnPosArray;
		new Promise((resolve,reject)=>{
			client.hget(stringHPos,pos,function (error,rows) {
				if (rows!=null) {
					arrayUnitInPos = rows.split("/").filter(String);
					for (var i = 0; i < arrayUnitInPos.length; i++) {
						if (arrayUnitInPos[i].split("_")[2] != ID_User) {
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


// exports.Start = function start (io) {
// 	io.on('connection', function(socket){
// 		socket.on('S_MOVE', function (data){			
// 			S_MOVE_ATT (io,data.S_MOVE);		
// 		});
// 	});
// }

// function S_MOVE_ATT (io,data) {
// 	// console.log(data)
// 	stringHMoveAttack = "s"+data.Server_ID+"_movingAttack";
// 	stringUnitMoving = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;
// 	// clearMoveTimeout ("Unit_Moving_"+stringUnitMoving);
// 	stringTimeout = "Unit_Moving_"+stringUnitMoving;

// 	// clearMoveTimeout (stringTimeout);
// 	clearAttackUnit (stringUnitMoving);

// 	new Promise((resolve,reject)=>{
// 		clearMoveTimeout (stringTimeout);
// 		resolve();
// 	}).then(()=>new Promise((resolve,reject)=>{
// 		client.hset(stringHMoveAttack,stringUnitMoving,JSON.stringify(data), function (error,rows) {
// 			if (!!error) {console.log(error);}
// 			resolve();
// 		});
// 	}).then(()=>new Promise((resolve,reject)=>{
// 		client.hget(stringHMoveAttack,stringUnitMoving,function (error,rows) {
// 			var result = JSON.parse(rows);
// 			checkTimeMoveAttack(io,result);
// 			resolve();
// 		});
// 	}))
// 	)
// }

// // #begin clearAttackUnit
// function clearAttackUnit (stringUnitMoving) {
// 	stringHUnit = "s"+stringUnitMoving.split("_")[0]+"_unit";
// 	stringHAttack = "s"+stringUnitMoving.split("_")[0]+"_attack";
// 	stringTimeout = "Unit_Moving_"+stringUnitMoving;

// 	client.hget(stringHUnit,stringUnitMoving,function (error,rows){
// 		if (rows!=null) {
// 			var result = JSON.parse(rows);
// 			if (result.Attack_Unit_ID!=null) {				
// 				attackFunc.RemoveRedisData(stringHAttack,result.Attack_Unit_ID,stringUnitMoving);
// 			}
// 		}else{
// 			clearMoveTimeout (stringTimeout);
// 		}
// 	});
// 	attackFunc.ClearIntervalAttack(stringUnitMoving);
// }
// // #end clearAttackUnit
// // #begin checkTimeMoveAttack
// function checkTimeMoveAttack (io,data) {
// 	// console.log(data)
// 	stringHUnit = "s"+data.Server_ID+"_unit";
// 	stringUnitMoving = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;
// 	stringTimeout = "Unit_Moving_"+stringUnitMoving;
// 	stringHMoveAttack = "s"+data.Server_ID+"_movingAttack";

// 	client.hget(stringHUnit,stringUnitMoving,function (error,rows){
// 		if (rows!=null) {
// 			checkCurrentPosition (io,data,data.Position_Cell);
// 			if (data.TimeMoveNextCell!=data.TimeFinishMove&&data.Next_Cell!=data.End_Cell) {
// 				calcMove (io,data,stringUnitMoving);
// 			}
// 			else{				
// 				var timeOutLast = (functions.ExportTimeDatabase(data.TimeMoveNextCell) - functions.GetTime())*0.5;
// 				DictTimeMoveAttack[stringTimeout] = setTimeout(function (io,data) {
// 					// console.log('res checkTimeMoveAttack')
// 					if (data.Attack_Unit_ID==null) {data.Status = functions.UnitStatus.Standby;}//moi them vo
// 					data.TimeMoveNextCell = null;
// 					data.TimeFinishMove = null;
// 					data.Position_Cell = data.End_Cell;
// 					new Promise((resolve,reject)=>{
// 						client.hget(stringHUnit,stringUnitMoving,function (error,rows) {
// 							if (rows!=null) {
// 								var resultUnit = JSON.parse(rows);
// 								resultUnit.Status =data.Status;
// 								resultUnit.TimeMoveNextCell = data.TimeMoveNextCell;
// 								resultUnit.TimeFinishMove = data.TimeFinishMove;
// 								resultUnit.Position_Cell = data.Position_Cell;
// 								client.hset(stringHUnit,stringUnitMoving,JSON.stringify(resultUnit),function (error) {
// 									resolve();
// 								})

// 							}

// 						})
// 					}).then(()=>new Promise((resolve,reject)=>{
// 						checkCurrentPosition (io,data,data.End_Cell);
// 						resolve();
// 					}))					
// 					// checkLastPosAttack (io,data);
// 					// checkAttackData (io,data,stringUnitMoving);
// 				}, timeOutLast,io,data);

// 			}
// 		}else{

// 			clearMoveTimeout(stringTimeout);

// 		}
// 	});
// }
// // #end checkTimeMoveAttack

// // function checkLastPosAttack (io,data) {
// // 	stringHAttack = "s"+data.Server_ID+"_attack";
// // 	stringHUnit = "s"+data.Server_ID+"_unit";
// // 	stringUnitMoving = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;

// // 	var attackingBool = false;
// // 	var getAttackBool = false;
// // 	var defendUnit = {};
// // 	var arrayUnitResult = [];
// // 	var arrayPos=[];

// // 	new Promise((resolve,reject)=>{
// // 		client.hget(stringHUnit,stringUnitMoving,function (error,rows) {
// // 			console.log(stringHUnit,stringUnitMoving,rows)
// // 			if (rows!=null) {
// // 				var result = JSON.parse(rows);
// // 				if (result.Attack_Unit_ID==null) {
// // 					attackingBool = true;
// // 					defendUnit = result;
// // 				}
// // 			}
// // 			resolve();	
// // 		})
// // 	}).then(()=>new Promise((resolve,reject)=>{
// // 		console.log(stringHAttack,stringUnitMoving)
// // 		if (attackingBool == true) {			
// // 			client.hget(stringHAttack,stringUnitMoving,function (error,rows) {
// // 				console.log(stringHAttack,stringUnitMoving,rows)
// // 				if (rows!=null) {
// // 					arrayUnitResult = rows.split("/").filter(String);
// // 					console.log('Moving_Attack.js');
// // 					console.log(arrayUnitResult);
// // 				}
// // 				resolve();
// // 			})
// // 		}		
// // 	}).then(()=>new Promise((resolve,reject)=>{
// // 		if (arrayUnitResult.length>0) {
// // 			position_Check.GetPosition(stringUnitMoving,function (returnPosArray) {
// // 				arrayPos = returnPosArray;	
// // 				console.log('arrayPos: '+arrayPos)			
// // 				resolve();
// // 			})
// // 		}
// // 	}).then(()=>new Promise((resolve,reject)=>{
// // 		if (arrayUnitResult.length>0) {
// // 			client.hmget(stringHUnit,arrayUnitResult,function (error,rowsUnit) {
// // 				for (var i = 0; i < rowsUnit.length; i++) {
// // 					var resultUnit = JSON.parse(rowsUnit[i]);
// // 					if (arrayPos.includes(resultUnit.Position_Cell)) {
// // 						console.log('Moving_Attack.js');
// // 						console.log(arrayUnitResult[i]);
// // 						getAttackBool= true;
// // 						attackFunc.SetAttackData(data.Server_ID,arrayUnitResult[i],stringUnitMoving);
// // 						break;
// // 					}
// // 				}
// // 				resolve();
// // 			})
// // 		}
// // 	}).then(()=>new Promise((resolve,reject)=>{
// // 		if (getAttackBool == true) {
// // 			attackFunc.AttackInterval(io,data.Server_ID,stringUnitMoving);
// // 		}
// // 		resolve();
// // 	}))
// // 	)
// // 	)
// // 	)

// // }
// // #Begin calcMove
// function calcMove (io,data,stringUnitMoving) {
// 	// console.log('stringUnitMoving: '+stringUnitMoving)
// 	var timeOut,timeNextCellAttack;
// 	var timeCheck = calcTimeCheck (data);
// 	var nextCellTime = timeCheck*0.5;

// 	// console.log(data)
// 	var timeMoveObj = Object.create(data);

// 	timeMoveObj = {
// 		Server_ID: data.Server_ID,
// 		ID: data.ID,
// 		ID_Unit: data.ID_Unit,
// 		ID_User: data.ID_User,
// 		Position_Cell: data.Position_Cell,
// 		Next_Cell: data.Next_Cell,
// 		End_Cell: data.End_Cell,
// 		TimeMoveNextCell: data.TimeMoveNextCell,
// 		TimeFinishMove: data.TimeFinishMove,
// 		ListMove: data.ListMove,
// 		Attack_Unit_ID: data.Attack_Unit_ID,
// 	}
// 	// console.log(timeMoveObj)
// 	if (timeMoveObj.TimeMoveNextCell == timeMoveObj.TimeFinishMove||timeMoveObj.Next_Cell == timeMoveObj.End_Cell) {
// 		timeNextCellAttack = (functions.ExportTimeDatabase(timeMoveObj.TimeMoveNextCell) - functions.GetTime())*0.5;	
// 		timeMoveObj.Position_Cell = data.End_Cell;
// 		timeMoveObj.Next_Cell = null;
// 		timeMoveObj.End_Cell = null;
// 		timeMoveObj.TimeMoveNextCell = null;
// 		timeMoveObj.TimeFinishMove = null;
// 		timeMoveObj.ListMove = [];		
// 	}else{
// 		if (timeMoveObj.ListMove.length>0) {
// 			// console.log('timeMoveObj.ListMove.length: '+timeMoveObj.ListMove.length)
// 			timeMoveObj.Position_Cell = data.Next_Cell;
// 			timeMoveObj.Next_Cell = data.ListMove[0].Next_Cell;
// 			// timeMoveObj.End_Cell = data.End_Cell;
// 			timeMoveObj.TimeMoveNextCell = data.ListMove[0].TimeMoveNextCell;		
// 			timeMoveObj.ListMove.shift();	
// 		}else {
// 			timeMoveObj.Position_Cell = data.Next_Cell;
// 			timeMoveObj.Next_Cell = data.End_Cell;
// 			timeMoveObj.TimeMoveNextCell = data.TimeFinishMove;					
// 		}
// 	}

// 	if (timeMoveObj.TimeMoveNextCell!=null&&timeMoveObj.TimeMoveNextCell!=timeMoveObj.TimeFinishMove) {
// 		timeOut = functions.ExportTimeDatabase(timeMoveObj.TimeMoveNextCell) - functions.GetTime();
// 		if (timeOut > timeCheck) {			
// 			timeNextCellAttack = timeOut - nextCellTime;
// 		}else if (timeOut == timeCheck) {
// 			timeNextCellAttack = nextCellTime;
// 		}
// 	}
// 	stringTimeout = "Unit_Moving_"+stringUnitMoving;

// 	DictTimeMoveAttack[stringTimeout] = setTimeout(function (io,timeMoveObj) {
// 		checkTimeMoveAttack (io,timeMoveObj)
// 	}, timeNextCellAttack,io,timeMoveObj);

// }
// function calcTimeCheck (data) {
// 	var timeCheck;
// 	var Position_Cell_X = data.Position_Cell.split(',')[0];
// 	var Position_Cell_Y = data.Position_Cell.split(',')[1];
// 	var Next_Cell_X = data.Next_Cell.split(',')[0];
// 	var Next_Cell_Y = data.Next_Cell.split(',')[1];
// 	var caseReturn =1;
// 	if (Position_Cell_X != Next_Cell_X && Position_Cell_Y != Next_Cell_Y) {caseReturn = 2;}
// 	switch (caseReturn) {
// 		case 1:
// 		timeCheck = functions.TimeMove.Straight;
// 		break;
// 		case 2:
// 		timeCheck = functions.TimeMove.Diagonal;
// 		break;
// 	}
// 	return timeCheck;
// }
// // #End calcMove
// // #begin checkCurrentPosition
// exports.CheckCurrentPosition = function checkCurrentPosition2 (io,data,pos) {
// 	checkCurrentPosition (io,data,pos);
// }

// function checkCurrentPosition4 (io,data,pos) {
// 	// console.log('checkCurrentPosition '+new Date().toISOString()+"_"+pos);
// 	stringHPos = "s"+data.Server_ID+"_pos";
// 	stringHUnit = "s"+data.Server_ID+"_unit";
// 	stringUnitMoving = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;

// 	var defendingUnit;
// 	var unitBool = false;
// 	var posBool = false;
// 	var attackBool = false;
// 	var attackingBool = false;
// 	var getAttackBool = false;
// 	var arrayUnitResult = [];
// 	/*
// 	**Check vị trí tìm mảng unit => lấy list mới, check unit
// 	*/
// 	var listUnitReturn = [];

// 	var listUnit = [];
// 	var stringKeyAttack = [];

// 	var listUnitAttack =[];
// 	var checkBoolGuildData = false, checkBoolFriendData = false;

// 	new Promise((resolve,reject)=>{
// 		client.hget(stringHPos,pos,function(error,rowsUnit){
// 			if (rowsUnit!=null) {
// 				var listUnit = rowsUnit.split("/").filter(String);
// 				for (var i = 0; i < listUnit.length; i++) {
// 					if (listUnit[i].split("_")[2] != data.ID_User) {
// 						listUnitReturn.push(listUnit[i]);
// 					}
// 				}
// 			}else{
// 				attackFunc.ClearIntervalAttack(stringUnitMoving);
// 			}
// 			resolve();
// 		})

// 	}).then(()=>new Promise((resolve,reject)=>{

// 		if (listUnitReturn.length>0) {

// 			listUnitReturn.forEach(function (unit) {

// 				new Promise((resolve,reject)=>{
// 					friendData.CheckFriendData(data.ID_User,unit.split("_")[2],function (returnBool){
// 						checkBoolFriendData = returnBool;
// 						resolve();
// 					});
// 				}).then(()=>new Promise((resolve,reject)=>{
// 					guildData.CheckSameGuildID (data.ID_User,unit.split("_")[2],function (returnBool) {
// 						checkBoolGuildData = returnBool;
// 						resolve();
// 					});
// 				}).then(()=>new Promise((resolve,reject)=>{
// 					if (checkBoolFriendData==false&&checkBoolGuildData==false) {
// 						client.hget(stringHUnit,unit,function (error,rows) {
// 							if (rows!=null) {
// 								var result = JSON.parse(rows);
// 								if (result.Status==6&&result.Attack_Unit_ID==null) {																		
// 									attackBool = true;
// 									listUnitAttack.push(unit)
// 									attackFunc.SetAttackData(data.Server_ID,stringUnitMoving,unit);
// 									resolve();

// 								}
// 							}

// 						})
// 					}
// 				}).then(()=>new Promise((resolve,reject)=>{
// 					if (attackBool==true) {					
// 						attackFunc.AttackInterval(io,data.Server_ID,stringUnitMoving);
// 						resolve();
// 					}
// 				})
// 				)
// 				)
// 				)
// 			})
// 			console.log('listUnitAttack')
// 			console.log(listUnitAttack)
// 		}
// 		resolve()
// 	})	
// 	)
// }
// function checkCurrentPosition5 (io,data,pos) {
// 	// console.log('checkCurrentPosition '+new Date().toISOString()+"_"+pos);
// 	stringHPos = "s"+data.Server_ID+"_pos";
// 	stringHUnit = "s"+data.Server_ID+"_unit";
// 	stringUnitMoving = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;

// 	var getAttackBool = false;
// 	var resultUnitAttack;
// 	// var listUnit=[];
// 	var defendingUnit;
// 	getDataAttack (io,data,pos,function (arrayUnitAttack) {
// 		listUnit = arrayUnitAttack
// 		// console.log('listUnit')
// 		// console.log(listUnit)
// 		if (listUnit.length>0) {
// 			position_Check.GetPosition(stringUnitMoving,function (returnPosArray) {

// 				new Promise((resolve,reject)=>{
// 					client.hmget(stringHUnit,listUnit,function (error,rowsUnit) {
// 						for (var i = 0; i < rowsUnit.length; i++) {
// 							var resultUnitAttack = JSON.parse(rowsUnit[i]);
// 							if (returnPosArray.includes(resultUnitAttack.Position_Cell)) {
// 								defendingUnit = resultUnitAttack[i];																				
// 								break;
// 							}
// 						}
// 						resolve();
// 					})									
// 				}).then(()=>new Promise((resolve,reject)=>{
// 					client.hget(stringHUnit,stringUnitMoving,function (error,rows) {
// 						if (rows!=null) {
// 							var result = JSON.parse(rows)
// 							if (result.Attack_Unit_ID==null) {
// 								getAttackBool= true;
// 								resolve();
// 							}
// 						}
// 					})

// 				}).then(()=>new Promise((resolve,reject)=>{
// 					if (getAttackBool==true) {
// 						attackFunc.SetAttackData(data.Server_ID,defendingUnit,stringUnitMoving);
// 						resolve();
// 					}
// 				}).then(()=>new Promise((resolve,reject)=>{
// 					if (getAttackBool == true) {
// 						attackFunc.AttackInterval(io,data.Server_ID,defendingUnit);
// 					}
// 					resolve();
// 				}))
// 				)
// 				)

// 			})

// 		}
// 	})
// }
// function getDataAttack (io,data,pos,arrayUnitAttack) {
	
// 	var unitBool = false;
// 	var posBool = false;
// 	var attackBool = false;
// 	var attackingBool = false;

// 	var arrayUnitResult = [];
// 	/*
// 	**Check vị trí tìm mảng unit => lấy list mới, check unit
// 	*/
// 	var listUnitReturn = [];

// 	var listUnit = [];
// 	var stringKeyAttack = [];

// 	var listUnitAttack =[];
// 	var checkBoolGuildData = false, checkBoolFriendData = false;

// 	new Promise((resolve,reject)=>{
// 		client.hget(stringHPos,pos,function(error,rowsUnit){
// 			if (rowsUnit!=null) {
// 				var listUnit = rowsUnit.split("/").filter(String);
// 				for (var i = 0; i < listUnit.length; i++) {
// 					if (listUnit[i].split("_")[2] != data.ID_User) {
// 						listUnitReturn.push(listUnit[i]);
// 					}
// 				}
// 			}else{
// 				attackFunc.ClearIntervalAttack(stringUnitMoving);
// 			}
// 			resolve();
// 		})

// 	}).then(()=>new Promise((resolve,reject)=>{

// 		if (listUnitReturn.length>0) {

// 			listUnitReturn.forEach(function (unit) {

// 				new Promise((resolve,reject)=>{
// 					friendData.CheckFriendData(data.ID_User,unit.split("_")[2],function (returnBool){
// 						checkBoolFriendData = returnBool;
// 						resolve();
// 					});
// 				}).then(()=>new Promise((resolve,reject)=>{
// 					guildData.CheckSameGuildID (data.ID_User,unit.split("_")[2],function (returnBool) {
// 						checkBoolGuildData = returnBool;
// 						resolve();
// 					});
// 				}).then(()=>new Promise((resolve,reject)=>{
// 					if (checkBoolFriendData==false&&checkBoolGuildData==false) {
// 						client.hget(stringHUnit,unit,function (error,rows) {
// 							if (rows!=null) {
// 								var result = JSON.parse(rows);
// 								if (result.Status==6&&result.Attack_Unit_ID==null) {																		
// 									attackBool = true;
// 									listUnitAttack.push(unit)
// 									attackFunc.SetAttackData(data.Server_ID,stringUnitMoving,unit);
// 									resolve();

// 								}
// 							}

// 						})
// 					}
// 				}).then(()=>new Promise((resolve,reject)=>{
// 					if (attackBool==true) {					
// 						attackFunc.AttackInterval(io,data.Server_ID,stringUnitMoving);
// 						arrayUnitAttack(listUnitAttack);
// 						resolve();
// 					}
// 				})
// 				)
// 				)
// 				)
// 			})

// 		}
// 		resolve()
// 	})	
// 	)
// }
// function checkCurrentPosition4 (io,data,pos) {
// 	// console.log('checkCurrentPosition '+new Date().toISOString()+"_"+pos);
// 	stringHPos = "s"+data.Server_ID+"_pos";
// 	stringHUnit = "s"+data.Server_ID+"_unit";
// 	stringUnitMoving = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;

// 	var defendingUnit;
// 	var unitBool = false;
// 	var posBool = false;
// 	var attackBool = false;
// 	var attackingBool = false;
// 	var getAttackBool = false;
// 	var arrayUnitResult = [];
// 	/*
// 	**Check vị trí tìm mảng unit => lấy list mới, check unit
// 	*/
// 	var listUnitReturn = [];

// 	var listUnit = [];
// 	var stringKeyAttack = [];

// 	var listUnitAttack =[];
// 	var checkBoolGuildData = false, checkBoolFriendData = false;

// 	new Promise((resolve,reject)=>{
// 		client.hget(stringHPos,pos,function(error,rowsUnit){
// 			if (rowsUnit!=null) {
// 				var listUnit = rowsUnit.split("/").filter(String);
// 				for (var i = 0; i < listUnit.length; i++) {
// 					if (listUnit[i].split("_")[2] != data.ID_User) {
// 						listUnitReturn.push(listUnit[i]);
// 					}
// 				}
// 			}else{
// 				attackFunc.ClearIntervalAttack(stringUnitMoving);
// 			}
// 			resolve();
// 		})

// 	}).then(()=>new Promise((resolve,reject)=>{

// 		if (listUnitReturn.length>0) {

// 			listUnitReturn.forEach(function (unit) {

// 				new Promise((resolve,reject)=>{
// 					friendData.CheckFriendData(data.ID_User,unit.split("_")[2],function (returnBool){
// 						checkBoolFriendData = returnBool;
// 						resolve();
// 					});
// 				}).then(()=>new Promise((resolve,reject)=>{
// 					guildData.CheckSameGuildID (data.ID_User,unit.split("_")[2],function (returnBool) {
// 						checkBoolGuildData = returnBool;
// 						resolve();
// 					});
// 				}).then(()=>new Promise((resolve,reject)=>{
// 					if (checkBoolFriendData==false&&checkBoolGuildData==false) {
// 						client.hget(stringHUnit,unit,function (error,rows) {
// 							if (rows!=null) {
// 								var result = JSON.parse(rows);
// 								if (result.Status==6&&result.Attack_Unit_ID==null) {																		
// 									attackBool = true;
// 									listUnitAttack.push(unit)
// 									attackFunc.SetAttackData(data.Server_ID,stringUnitMoving,unit);
// 									resolve();

// 								}
// 							}

// 						})
// 					}
// 				}).then(()=>new Promise((resolve,reject)=>{
// 					if (attackBool==true) {					
// 						attackFunc.AttackInterval(io,data.Server_ID,stringUnitMoving);
// 						resolve();
// 					}
// 				})
// 				)
// 				)
// 				)
// 			})

// 		}
// 		resolve()
// 	})	
// 	)
// }

// function checkCurrentPosition (io,data,pos) {
// 	// console.log('checkCurrentPosition '+new Date().toISOString()+"_"+pos);
// 	stringHPos = "s"+data.Server_ID+"_pos";
// 	stringHUnit = "s"+data.Server_ID+"_unit";
// 	stringUnitMoving = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;

// 	var defendingUnit;
// 	var unitBool = false;
// 	var posBool = false;
// 	var attackBool = false;
// 	var attackingBool = false;
// 	var getAttackBool = false;
// 	var arrayUnitResult = [];
// 	/*
// 	**Check vị trí tìm mảng unit => lấy list mới, check unit
// 	*/
// 	var listUnit = [];
// 	var stringKeyAttack = [];
// 	var listUnitReturn = [];
// 	var listUnitAttack =[];
// 	var checkBoolGuildData = false, checkBoolFriendData = false;
// 	new Promise((resolve,reject)=>{
// 		client.hget(stringHPos,pos,function(error,rowsUnit){

// 			if (rowsUnit!=null) {
// 				var listUnit = rowsUnit.split("/").filter(String);
// 				for (var i = 0; i < listUnit.length; i++) {
// 					if (listUnit[i].split("_")[2] != data.ID_User) {
// 						listUnitReturn.push(listUnit[i]);
// 					}
// 				}
// 			}else{
// 				attackFunc.ClearIntervalAttack(stringUnitMoving);
// 			}			

// 			resolve();
// 		});
// 	}).then(()=>new Promise((resolve,reject)=>{
// 		if (listUnitReturn.length>0) {
// 			listUnitReturn.forEach(function (unit) {
// 				new Promise((resolve,reject)=>{
// 					friendData.CheckFriendData (data.ID_User,unit.split("_")[2],function (returnBool) {
// 						checkBoolFriendData = returnBool;
// 						resolve();
// 					});
// 				}).then(()=>new Promise((resolve,reject)=>{
// 					guildData.CheckSameGuildID (data.ID_User,unit.split("_")[2],function (returnBool) {
// 						checkBoolGuildData = returnBool;
// 						resolve();
// 					});
// 				}).then(()=>new Promise((resolve,reject)=>{
// 					if (checkBoolFriendData==false&&checkBoolGuildData==false) {
// 						client.hget(stringHUnit,unit,function (error,rows) {
// 							if (rows!=null) {
// 								var result = JSON.parse(rows);
// 								if ((result.Status==6 && result.Attack_Unit_ID == null)||(result.Status==6 && result.Attack_Unit_ID == 'NULL')) {
// 									console.log('Moving_Attack.js')
// 									console.log(result)
// 									attackBool = true;
// 									listUnitAttack.push(unit);
// 									result.Attack_Unit_ID = stringUnitMoving;
// 									result.Status = functions.UnitStatus.Attack_Unit;
// 									client.hset(stringHUnit,unit,JSON.stringify(result),function (error) {
// 										resolve();
// 									});



// 								}
// 							}
// 							// resolve();
// 						})
// 					}
// 				}).then(()=>new Promise((resolve,reject)=>{

// 					var stringValue="";
// 					console.log(listUnitAttack);
// 					if (listUnitAttack.length>1) {
// 						for (var i = 0; i < listUnitAttack.length; i++) {
// 							stringValue += listUnitAttack[i]+"/"	
// 						}
// 					}else {
// 						stringValue = listUnitAttack[0]+"/";

// 					}
// 					// console.log(stringValue);
// 					client.hset(stringHAttack,stringUnitMoving,stringValue);
// 					// for (var i = 0; i < listUnitAttack.length; i++) {
// 					// 	var unitAttack = listUnitAttack[i]
// 					// 	attackFunc.SetAttackData(data.Server_ID,stringUnitMoving,unitAttack)
// 					// }
// 					resolve();
// 				}).then(()=>new Promise((resolve,reject)=>{
// 					if (attackBool==true) {					
// 						attackFunc.AttackInterval(io,data.Server_ID,stringUnitMoving);
// 						resolve();
// 					}
// 				}).then(()=>new Promise((resolve,reject)=>{
// 					// console.log('stringHUnit,stringUnitMoving')
// 					// console.log(stringHUnit,stringUnitMoving)
// 					client.hget(stringHUnit,stringUnitMoving,function (error,rows) {

// 						if (rows!=null) {
// 							var result = JSON.parse(rows);
// 							if (result.Attack_Unit_ID==null&&result.TimeMoveNextCell==null) {
// 								attackingBool = true;
// 								// defendUnit = result;
// 								// console.log('stringHUnit,stringUnitMoving,rows')
// 								// console.log(stringHUnit,stringUnitMoving,rows)
// 							}
// 						}
// 						resolve();	
// 					})


// 				}).then(()=>new Promise((resolve,reject)=>{
// 					if (attackingBool == true) {			
// 						client.hget(stringHAttack,stringUnitMoving,function (error,rows) {
// 							// console.log(stringHAttack,stringUnitMoving,rows)
// 							if (rows!=null) {
// 								arrayUnitResult = rows.split("/").filter(String);
// 								// console.log('Moving_Attack.js');
// 								// console.log(arrayUnitResult);
// 							}
// 							resolve();
// 						})
// 					}
// 				}).then(()=>new Promise((resolve,reject)=>{
// 					if (arrayUnitResult.length>0) {
// 						position_Check.GetPosition(stringUnitMoving,function (returnPosArray) {

// 							// console.log('returnPosArray: '+returnPosArray)

// 							if (arrayUnitResult.length>0) {
// 								new Promise((resolve,reject)=>{
// 									// console.log(stringHUnit,arrayUnitResult)	
// 									client.hmget(stringHUnit,arrayUnitResult,function (error,rowsUnit) {
// 										// console.log(rowsUnit)
// 										for (var i = 0; i < rowsUnit.length; i++) {
// 											var resultUnitAttack = JSON.parse(rowsUnit[i]);
// 											// console.log(returnPosArray)
// 											// console.log(resultUnitAttack.Position_Cell)
// 											if (returnPosArray.includes(resultUnitAttack.Position_Cell)) {
// 												defendingUnit = arrayUnitResult[i];
// 												// console.log(defendingUnit);
// 												getAttackBool= true;												
// 												break;
// 											}
// 										}
// 										resolve();
// 									})									
// 								}).then(()=>new Promise((resolve,reject)=>{
// 									if (getAttackBool == true) {
// 										// console.log(data.Server_ID,defendingUnit,stringUnitMoving)
// 										attackFunc.SetAttackData(data.Server_ID,defendingUnit,stringUnitMoving);
// 									}
// 									resolve();
// 								}).then(()=>new Promise((resolve,reject)=>{
// 									if (getAttackBool == true) {
// 										attackFunc.AttackInterval(io,data.Server_ID,defendingUnit);
// 									}
// 									resolve();
// 								}))
// 								)

// 							}

// 						})
// 					}
// 				})
// 				)
// 				)
// 				)
// 				)
// 				)
// 				)
// )
// });
// }else{
// 	attackFunc.ClearIntervalAttack(stringUnitMoving);
// }

// })
// )

// }

// // function checkCurrentPosition2 (io,data,pos) {
// // 	// console.log('checkCurrentPosition '+new Date().toISOString()+"_"+pos);

// // 	stringHPos = "s"+data.Server_ID+"_pos";
// // 	stringHUnit = "s"+data.Server_ID+"_unit";
// // 	stringUnitMoving = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;

// // 	var unitBool = false;
// // 	var posBool = false;

// // 	/*
// // 	**Check vị trí tìm mảng unit => lấy list mới, check unit
// // 	*/
// // 	var listUnit = [];
// // 	var stringKeyAttack =[];

// // 	new Promise((resolve,reject)=>{
// // 		client.hdel(stringHAttack,stringUnitMoving,function (error) {
// // 			if (!!error) {console.log('Moving_Attack.js: '+error);}
// // 			resolve();
// // 		});

// // 	}).then(()=>new Promise((resolve,reject)=>{
// // 		client.hget(stringHPos,pos,function(error,rowsUnit){
// // 			if (rowsUnit!=null) {
// // 				listUnit = rowsUnit.split("/").filter(String);

// // 				// for (var i = 0; i < stringKeyAttack.length; i++) {
// // 				// 	var Attack_ID = stringKeyAttack[i].split("_")[2];
// // 				// 	if (Attack_ID!=data.ID_User) {
// // 				// 		checkAttackData (io,data,stringKeyAttack[i]);						
// // 				// 	}
// // 				// }			
// // 			}else {
// // 				attackFunc.ClearIntervalAttack(stringUnitMoving);
// // 			}
// // 			resolve();
// // 		})

// // 		// client.hget(stringHPos,pos,function(error,rowsUnit){
// // 		// 	if (rowsUnit!=null) {
// // 		// 		stringKeyAttack = rowsUnit.split("/").filter(String);
// // 		// 		for (var i = 0; i < stringKeyAttack.length; i++) {
// // 		// 			var Attack_ID = stringKeyAttack[i].split("_")[2];
// // 		// 			if (Attack_ID!=data.ID_User) {
// // 		// 				checkAttackData (io,data,stringKeyAttack[i]);						
// // 		// 			}
// // 		// 		}			
// // 		// 	}else {
// // 		// 		attackFunc.ClearIntervalAttack(stringUnitMoving);
// // 		// 	}
// // 		// 	resolve();
// // 		// })
// // 	})
// // 	)

// // }

// // function checkAttackData (io,data,stringKeyAttack) {
// // 	var checkBoolFriendData = false;
// // 	var checkBoolGuildData = false;
// // 	var attackBool = false;
// // 	var defendAliveBool = true;
// // 	var stringKeyDefend = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;
// // 	stringHUnit = "s"+data.Server_ID+"_unit";

// // 	new Promise((resolve,reject)=>{
// // 		friendData.CheckFriendData (data.ID_User,stringKeyAttack.split("_")[2],function (returnBool) {
// // 			checkBoolFriendData = returnBool;
// // 			resolve();
// // 		});
// // 	}).then(()=>new Promise((resolve,reject)=>{
// // 		guildData.CheckSameGuildID (data.ID_User,stringKeyAttack.split("_")[2],function (returnBool) {
// // 			checkBoolGuildData = returnBool;
// // 			resolve();
// // 		});
// // 	}).then(()=>new Promise((resolve,reject)=>{
// // 		if (checkBoolFriendData==false&&checkBoolGuildData==false) {
// // 			client.hget(stringHUnit,stringKeyAttack,function (error,rows) {
// // 				if (rows!=null) {
// // 					var result = JSON.parse(rows);
// // 					if (result.Status==functions.UnitStatus.Standby) {
// // 						attackBool = true;
// // 						attackFunc.SetAttackData(data.Server_ID,stringKeyDefend,stringKeyAttack);						
// // 					}
// // 				}
// // 				resolve();				
// // 			})
// // 		}
// // 	}).then(()=>new Promise((resolve,reject)=>{
// // 		if (attackBool == true) {			
// // 			if ((data.TimeFinishMove == null && data.Attack_Unit_ID=='NULL')||
// // 				(data.TimeFinishMove == null && data.Attack_Unit_ID==null)||
// // 				(data.TimeFinishMove == null && data.Attack_Unit_ID=="NULL")) {			
// // 				new Promise((resolve,reject)=>{
// // 					client.hget(stringHUnit,stringKeyDefend,function (error,rows) {
// // 						if (rows!=null) {
// // 							var result = JSON.parse(rows);
// // 							result.Position_Cell = result.End_Cell;
// // 							client.hset(stringHUnit,stringKeyDefend,JSON.stringify(result));
// // 						}else {
// // 							defendAliveBool = false;
// // 						}
// // 						resolve();
// // 					})
// // 				}).then(()=>new Promise((resolve,reject)=>{
// // 					// console.log(data)
// // 					// console.log('defendAliveBool '+defendAliveBool)
// // 					if (defendAliveBool==true) {
// // 						attackFunc.CheckAttackedUnit(io,data.Server_ID,stringKeyDefend);
// // 					}
// // 					resolve();
// // 				}))				
// // 			}			
// // 			attackFunc.AttackInterval(io,data.Server_ID,stringKeyDefend);
// // 			resolve();
// // 		}			
// // 	}))
// // 	)
// // 	)		
// // }

// // #end checkCurrentPosition
// // #begin ClearMoveTimeout
// exports.ClearMoveTimeout = function clearMoveTimeout2 (stringData) {
// 	stringTimeout = "Unit_Moving_"+stringData;
// 	clearMoveTimeout (stringTimeout);

// }
// function clearMoveTimeout (stringData) {
// 	//stringData ="Unit_Moving_"+...
// 	if (DictTimeMoveAttack[stringData]!=undefined) {
// 		clearTimeout(DictTimeMoveAttack[stringData]);
// 		delete DictTimeMoveAttack[stringData];
// 	}
// }
// // #end ClearMoveTimeout
