'use strict';

// var positionAdd 			= require('./../Redis/Position/Position.js');
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
var stringHMovingAttack;
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

exports.Start = function start (io) {
	io.on('connection', function(socket){
		socket.on('S_MOVE', function (data){
			var dataMoveAttack  = data.S_MOVE;
			console.log('dataMoveAttack')
			console.log(dataMoveAttack)
			functions.ShowLog(functions.ShowLogBool.On,'Moving_Attack.js Start data',[dataMoveAttack]);
			stringUnit = dataMoveAttack.Server_ID+"_"+dataMoveAttack.ID_Unit+"_"+dataMoveAttack.ID_User+"_"+dataMoveAttack.ID;
			functions.ShowLog(functions.ShowLogBool.On,'Moving_Attack.js Start data',[stringUnit])

			// clearMoveAttackTimeout (stringUnit);	
			stringHMovingAttack = "s"+dataMoveAttack.Server_ID+"_movingAttack";	

			new Promise((resolve,reject)=>{
				functions.ShowLog(functions.ShowLogBool.On,'Moving_Attack.js Start=>attackFunc.ClearAttackUnit stringUnit',[stringUnit]);
				attackFunc.ClearAttackUnit (io,stringUnit);
				resolve();
			}).then(()=>{
				return new Promise((resolve,reject)=>{
					functions.ShowLog(functions.ShowLogBool.On,'Moving_Attack.js Start=>clearMovingAttack stringUnit',[stringUnit]);
					clearMovingAttack (stringUnit);
					resolve();
				})
			}).then(()=>{
				return new Promise((resolve,reject)=>{
					functions.ShowLog(functions.ShowLogBool.On,'Moving_Attack.js start hset stringHMovingAttack,stringUnit',[stringHMovingAttack,stringUnit]);
					client.hset(stringHMovingAttack,stringUnit,JSON.stringify(dataMoveAttack))
					resolve()
				})
			}).then(()=>{
				return new Promise((resolve,reject)=>{
					functions.ShowLog(functions.ShowLogBool.On,'Moving.js Moving_Attack hget stringHMovingAttack,stringUnit',[stringHMovingAttack,stringUnit]);
					client.hget(stringHMovingAttack,stringUnit,function (error,rows) {
						if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'Moving.js Moving_Attack start hget stringHMovingAttack,stringUnit',[stringHMovingAttack,stringUnit]);}
						var result = JSON.parse(rows);
						functions.ShowLog(functions.ShowLogBool.On,'Moving.js Moving_Attack start=>checkMovePos result,stringUnit',[result,stringUnit]);
						checkMovePos (io,result,stringUnit);
						resolve();
					})
				})
			})

		})
	})
	
}

exports.CheckMovePos = function (io,data,stringKey) {
	checkMovePos (io,data,stringKey)
}

function checkMovePos (io,data,stringKey) {
	functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js checkMovePos data,stringKey',[data,stringKey]);
	var posCheck = data.Position_Cell;
	var timeNext = 0, timeOut = 0;
	var Position_Cell_X,Position_Cell_Y,Next_Cell_X,Next_Cell_Y;
	var Server_ID = data.Server_ID;
	stringMoveAttack = "Moving_Attack_"+stringKey;

	functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js checkMovePos=>checkCurrentPos data,stringKey,posCheck,Server_ID',[data,stringKey,posCheck,Server_ID]);
	attackFunc.CheckCurrentPos (io,data,stringKey,posCheck,Server_ID);
	
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
		if (timeOut<0) {console.log('AttackFunc.js checkMovePos Moving Attack timeOut<0');console.log(timeOut);
		clearTimeout(DictMoveAttack[stringMoveAttack]);
		return null;}

		functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js checkMovePos timeOut,data,stringKey,stringMoveAttack',[timeOut,data,stringKey,stringMoveAttack]);
		
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
					updateData.TimeMoveNextCell = data.TimeFinishMove;
					// updateData.TimeFinishMove = null;
					// console.log('updateData.TimeMoveNextCell')
					// console.log(updateData.TimeMoveNextCell)
				}
				checkMovePos (io,updateData,stringKey);
			}, timeOut,io,data,stringKey);
		}else{

			DictMoveAttack[stringMoveAttack]=setTimeout(function (io,data,stringKey) {
				var updateData = data;
				updateData.Position_Cell = data.End_Cell;
				updateData.Next_Cell = null;
				updateData.TimeMoveNextCell = null;
				updateData.TimeFinishMove = null;
				checkMovePos (io,updateData,stringKey);
			}, timeOut,io,data,stringKey)
		}
	}
}

exports.ClearMovingAttack = function (stringUnit) {
	clearMovingAttack (stringUnit)
}

function clearMovingAttack (stringUnit) {

	stringMoveAttack = "Moving_Attack_"+stringUnit;
	functions.ShowLog(functions.ShowLogBool.On,'Moving_Attack.js clearMovingAttack stringUnit,stringMoveAttack',[stringUnit,stringMoveAttack]);
	if (DictMoveAttack[stringMoveAttack]!=null) {
		clearTimeout(DictMoveAttack[stringMoveAttack]);			
		delete DictMoveAttack[stringMoveAttack];
	}

} 

function removeValue (stringHkey,stringKey,rows,ID_Key) {
	var stringReplace = rows.replace(ID_Key+"/","");

	functions.ShowLog(functions.ShowLogBool.On,'Moving_Attack.js removeValue stringHkey,stringKey,rows,ID_Key,stringReplace',[stringHkey,stringKey,rows,ID_Key,stringReplace]);
	client.hset(stringHkey,stringKey,stringReplace);
	if (stringReplace.length==0) {
		attackFunc.StopIntervalAttack(stringKey);
	}
}



