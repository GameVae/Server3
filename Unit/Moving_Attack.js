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
var stringHPos, stringHUnit, stringHAttack, stringMoveAttack, stringUnit;
var DictMoveAttack ={};
// var stringTimeout;

var Promise = require('promise');
// var data ={
// 	Server_ID: 1,
// 	ID: 551,
// 	ID_Unit: 16,
// 	ID_User: 43,
// 	Position_Cell: '288,0,0',
// 	Next_Cell: '289,0,0',
// 	End_Cell: '292,0,0',
// 	TimeMoveNextCell: '2019-06-17T08:31:36.494',
// 	TimeFinishMove: '2019-06-17T08:31:40.694',
// 	ListMove: [ [Object], [Object], [Object] ],
// 	Attack_Unit_ID: 'NULL'
// }
exports.Moving_Attack = function moving_Attack(io,socket,data) {
	// console.log('Moving_Attack.js data');
	// console.log(data);
	stringUnit = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;
	functions.ShowLog(functions.ShowLogBool.On,'Moving.js Moving_Attack data,stringUnit',[data,stringUnit]);

	var stringHMovingAttack = "s"+data.Server_ID+"_movingAttack";
	
	clearAttackUnit (stringUnit);
	clearMovingAttack (stringUnit);

	new Promise((resolve,reject)=>{
		functions.ShowLog(functions.ShowLogBool.On,'Moving.js Moving_Attack hset stringHMovingAttack,stringUnit',[stringHMovingAttack,stringUnit]);
		client.hset(stringHMovingAttack,stringUnit,JSON.stringify(data),function (error,result) {
			if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'Moving.js Moving_Attack hset stringHMovingAttack,stringUnit',[stringHMovingAttack,stringUnit]);}
			resolve();
		})
	}).then(()=>{
		return new Promise((resolve,reject)=>{
			functions.ShowLog(functions.ShowLogBool.On,'Moving.js Moving_Attack hget stringHMovingAttack,stringUnit',[stringHMovingAttack,stringUnit]);
			client.hget(stringHMovingAttack,stringUnit,function (error,rows) {
				if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'Moving.js Moving_Attack hget stringHMovingAttack,stringUnit',[stringHMovingAttack,stringUnit]);}
				var result = JSON.parse(rows);
				// console.log(result)
				checkMovePos (io,result,stringUnit);
				resolve();
			})
		})
		
	})	
}

exports.ClearMovingAttack = clearMovingAttack;
function clearMovingAttack (stringUnit) {
	stringMoveAttack = "Moving_Attack_"+stringUnit;
	functions.ShowLog(functions.ShowLogBool.Off,'Moving_Attack.js clearMovingAttack stringUnit,stringMoveAttack',[stringUnit,stringMoveAttack]);
	if (DictMoveAttack[stringMoveAttack]!=null) {
		clearTimeout(DictMoveAttack[stringMoveAttack]);			
		delete DictMoveAttack[stringMoveAttack];
	}

} 
function clearAttackUnit (stringUnit) {
	functions.ShowLog(functions.ShowLogBool.Off,'Moving_Attack.js clearAttackUnit stringUnit',[stringUnit]);
	
	var Server_ID = stringUnit.split("_")[0];
	stringHAttack = "s"+Server_ID+"_attack";
	stringHUnit = "s"+Server_ID+"_unit";
	
	var defendUnit = null;
	new Promise((resolve,reject)=>{
		functions.ShowLog(functions.ShowLogBool.On,'Moving_Attack.js clearAttackUnit stringHUnit,stringUnit',[stringHUnit,stringUnit]);
		client.hget(stringHUnit,stringUnit,function (error,rows) {
			if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'Moving_Attack.js clearAttackUnit stringHUnit stringUnit',[stringHUnit,stringUnit]);}
			if (rows!=null) {
				var result = JSON.parse(rows);
				defendUnit = result.Attack_Unit_ID;
			}
			resolve();
		})
	}).then(()=>{
		if (defendUnit!=null) {
			return new Promise((resolve,reject)=>{
				functions.ShowLog(functions.ShowLogBool.On,'Moving_Attack.js clearAttackUnit stringHAttack,defendUnit',[stringHAttack,defendUnit]);
				client.hget(stringHAttack,defendUnit,function (error,rows) {
					if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'Moving_Attack.js clearAttackUnit stringUnit',[stringUnit]);}
					if (rows!=null) {
						var arrayAttackUnit = rows.split("/").filter(String);
						if (arrayAttackUnit.includes(stringUnit)) {
							removeValue (stringHAttack,defendUnit,rows,stringUnit);
						}
					}
					resolve();
				})
			})
		}
	})	
}

function removeValue (stringHkey,stringKey,rows,ID_Key) {
	var stringReplace = rows.replace(ID_Key+"/","");
	
	functions.ShowLog(functions.ShowLogBool.On,'Moving_Attack.js removeValue stringHkey,stringKey,rows,ID_Key,stringReplace',[stringHkey,stringKey,rows,ID_Key,stringReplace]);
	client.hset(stringHkey,stringKey,stringReplace);
	if (stringReplace.length==0) {
		attackFunc.StopIntervalAttack(stringKey);
	}
}

function checkMovePos (io,data,stringKey) {
	functions.ShowLog(functions.ShowLogBool.On,'Moving_Attack.js checkMovePos data,stringKey',[data,stringKey]);
	var posCheck = data.Position_Cell;
	var timeNext = 0, timeOut = 0;
	var Position_Cell_X,Position_Cell_Y,Next_Cell_X,Next_Cell_Y;
	var Server_ID = data.Server_ID;
	stringMoveAttack = "Moving_Attack_"+stringKey;

	checkCurrentPos (io,data,stringKey,posCheck,Server_ID);
	
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
		if (timeOut<0) {console.log('Moving Attack timeOut<0');console.log(timeOut); return null;}
		// console.log('timeOut')
		// console.log(timeOut);
		// clearTimeout(DictMoveAttack[stringMoveAttack])
		functions.ShowLog(functions.ShowLogBool.On,'Moving_Attack.js checkMovePos timeOut,data,stringKey,stringMoveAttack',[timeOut,data,stringKey,stringMoveAttack]);
		if (data.TimeMoveNextCell!=data.TimeFinishMove) {
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
					updateData.TimeMoveNextCell = null;
					updateData.TimeFinishMove = null;
				}
				checkMovePos (io,updateData,stringKey);
			}, timeOut,io,data,stringKey);
		}
		// DictMoveAttack[stringMoveAttack]=setTimeout(function (io,data,stringKey) {
		// 	var updateData = data;
			
		// 	if (data.ListMove.length>0) {
		// 		updateData.Position_Cell = data.Next_Cell;
		// 		updateData.Next_Cell = data.ListMove[0].Next_Cell;
		// 		updateData.TimeMoveNextCell = data.ListMove[0].TimeMoveNextCell;
		// 		updateData.ListMove.shift();
		// 	}else{
		// 		updateData.Position_Cell = data.End_Cell;
		// 		updateData.Next_Cell = null;
		// 		updateData.TimeMoveNextCell = null;
		// 		updateData.TimeFinishMove = null;
		// 	}
		// 	checkMovePos (io,updateData,stringKey);
		// }, timeOut,io,data,stringKey);

	}
}

exports.CheckCurrentPos = function (io,data,stringKey,pos,Server_ID) {
	checkCurrentPos (io,data,stringKey,pos,Server_ID);
}
function checkCurrentPos (io,data,stringKey,pos,Server_ID) {
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
	functions.ShowLog(functions.ShowLogBool.On,'Moving_Attack.js checkCurrentPos data,stringKey,pos,Server_ID',[data,stringKey,pos,Server_ID]);
	stringHPos ="s"+Server_ID+"_pos";
	stringHUnit = "s"+Server_ID+"_unit";
	stringHAttack = "s"+Server_ID+"_attack";
	// var Server_ID = data.Server_ID;

	var ID_User = stringKey.split("_")[2];
	var arrayUnitInPos = [];
	// var tempListUnitInPos = [];
	var listUnitAttack = [];
	var listIDUnitAttack = [];
	var listCurrentAttack = [];
	// var listUnit = [];
	var checkBoolFriendData = false, checkBoolGuildData = false;
	var getAttackBool = false;

	var defendingUnit;

	new Promise((resolve,reject)=>{
		functions.ShowLog(functions.ShowLogBool.On,'Moving_Attack.js checkCurrentPos hget stringHPos,pos',[stringHPos,pos]);
		client.hget(stringHPos,pos,function(error,rows){
			if (rows!=null) {
				arrayUnitInPos = rows.split("/").filter(String);				
				for (var i = 0; i < arrayUnitInPos.length; i++) {
					if (arrayUnitInPos[i].split("_")[2] != ID_User) {
						listIDUnitAttack.push(arrayUnitInPos[i]);
						// arrayUnitInPos.splice(arrayUnitInPos.indexOf(arrayUnitInPos[i], 1))
					}
				}
			}
			// listIDUnitAttack = arrayUnitInPos;
			functions.ShowLog(functions.ShowLogBool.On,'Moving_Attack.js checkCurrentPos listIDUnitAttack',[listIDUnitAttack]);
			if (listIDUnitAttack.length==0) {
				// attackFunc.ClearInterAttack(stringKey,functions.CaseClearAttack.Full);		
				attackFunc.ClearInterAttackUpdate(io,stringKey);		
				return null;
			}
			resolve();
		})
	}).then(()=>{
		return new Promise((resolve,reject)=>{
			// console.log('listIDUnitAttack')
			// console.log(listIDUnitAttack);
			functions.ShowLog(functions.ShowLogBool.On,'Moving_Attack.js checkCurrentPos friendData.CheckListFriendData listIDUnitAttack,stringKey',[listIDUnitAttack,stringKey]);
			friendData.CheckListFriendData(listIDUnitAttack,stringKey.split("_")[2],function (returnListUnit) {
				// console.log('returnListUnit')
				// console.log(returnListUnit);
				listIDUnitAttack = returnListUnit;
				resolve();
			})
		})
	}).then(()=>{
		return new Promise((resolve,reject)=>{

			functions.ShowLog(functions.ShowLogBool.On,'Moving_Attack.js checkCurrentPos guildData.CheckListGuildData listIDUnitAttack,stringKey',[listIDUnitAttack,stringKey]);
			guildData.CheckListGuildData(listIDUnitAttack,stringKey.split("_")[2],function (returnListUnit) {
				listIDUnitAttack = returnListUnit;
				resolve();
			})
		})
	}).then(()=>{
		return new Promise((resolve,reject)=>{
			
			if (listIDUnitAttack.length==0) {
				functions.ShowLog(functions.ShowLogBool.On,'Moving_Attack.js checkCurrentPos listIDUnitAttack=0 attackFunc.ClearInterAttackUpdate',[stringKey]);
				attackFunc.ClearInterAttackUpdate(io,stringKey);
				return null;
			}else{
				functions.ShowLog(functions.ShowLogBool.On,'Moving_Attack.js checkCurrentPos hmget stringHUnit,listIDUnitAttack',[stringHUnit,listIDUnitAttack]);
				client.hmget(stringHUnit,listIDUnitAttack,function (error,rows) {
					if (rows!=null) {
						for (var i = 0; i < rows.length; i++) {
							if(rows[i]!=null){
								var unitResult = JSON.parse(rows[i]);
								var attackBool = false;
								
								if (unitResult.Status==6&&unitResult.Attack_Unit_ID==null) {
									attackBool = true;	
								}
								if (unitResult.Attack_Unit_ID==stringKey){
									attackBool = true;
								}
								if (unitResult.Status==6&&unitResult.Attack_Unit_ID=='null') {
									attackBool = true;	
								}
								if (attackBool == false) {
									listIDUnitAttack.splice(listIDUnitAttack.indexOf(listIDUnitAttack[i]), 1);
								}
							}else{
								listIDUnitAttack.splice(listIDUnitAttack.indexOf(listIDUnitAttack[i]), 1);
							}
						}
					}else{
						attackFunc.ClearInterAttackUpdate(io,stringKey);
						return null;
					}
					resolve();
				})
			}
		})

	}).then(()=>{
		return new Promise((resolve,reject)=>{
			functions.ShowLog(functions.ShowLogBool.On,'Moving_Attack.js checkCurrentPos hget stringHAttack,stringKey',[stringHAttack,stringKey]);
			client.hget(stringHAttack,stringKey,function (error,rows) {
				if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'Moving_Attack.js checkCurrentPos hget stringHAttack,stringKey',[stringHAttack,stringKey]);}
				if (rows!=null) {
					listCurrentAttack = rows.split("/").filter(String);
				}
				resolve();
			})

		})
		
	}).then(()=>{
		return new Promise((resolve,reject)=>{

			if (listIDUnitAttack.length>0) {
				functions.ShowLog(functions.ShowLogBool.On,'Moving_Attack.js checkCurrentPos hget stringHAttack,stringKey',[stringHAttack,stringKey]);
				attackFunc.SetListAttackData(io,Server_ID,stringKey,listIDUnitAttack,listCurrentAttack);
			}
			if(listIDUnitAttack.length==0&&listCurrentAttack.length==0){
				attackFunc.ClearInterAttackUpdate(io,stringKey);
				return null;
			}
			resolve();
			
		})
	})

}