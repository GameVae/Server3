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
	stringUnit = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;
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
	var stringHMovingAttack = "s"+data.Server_ID+"_movingAttack";
	clearMovingAttack (stringUnit);
	new Promise((resolve,reject)=>{
		client.hset(stringHMovingAttack,stringUnit,JSON.stringify(dataMoving),function (error,result) {
			resolve();
		})
	}).then(()=>{
		return new Promise((resolve,reject)=>{
			client.hget(stringHMovingAttack,stringUnit,function (error,rows) {
				var result = JSON.parse(rows);
				// console.log(result)
				checkMovePos (io,result,stringUnit);
				resolve();
			})
		})
		
	})	


}
function clearMovingAttack (stringUnit) {
	stringMoveAttack = "Moving_Attack_"+stringUnit;
	if (DictMoveAttack[stringMoveAttack]!=null) {
		clearTimeout(DictMoveAttack[stringMoveAttack]);			
		delete DictMoveAttack[stringMoveAttack];
	}

} 
function checkMovePos (io,data,stringKey) {
	// console.log(data)
	// attackFunc.ClearIntervalAttack(stringKey);
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
		if (timeOut<0) {console.log('timeOut<0');console.log(timeOut); return null;}
		// console.log('timeOut')
		// console.log(timeOut);
		// clearTimeout(DictMoveAttack[stringMoveAttack])

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

	stringHPos ="s"+data.Server_ID+"_pos";
	stringHUnit = "s"+data.Server_ID+"_unit";
	stringHAttack = "s"+data.Server_ID+"_attack";
	var Server_ID = data.Server_ID;

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
			if (listIDUnitAttack.length==0) {
				attackFunc.ClearInterAttack(stringKey,functions.CaseClearAttack.Full);				
				return null;
			}
			resolve();
		})
	}).then(()=>{
		return new Promise((resolve,reject)=>{
			// console.log('listIDUnitAttack')
			// console.log(listIDUnitAttack);
			friendData.CheckListFriendData(listIDUnitAttack,stringKey.split("_")[2],function (returnListUnit) {
				// console.log('returnListUnit')
				// console.log(returnListUnit);
				listIDUnitAttack = returnListUnit;
				resolve();
			})
		})
	}).then(()=>{
		return new Promise((resolve,reject)=>{
			guildData.CheckListGuildData(listIDUnitAttack,stringKey.split("_")[2],function (returnListUnit) {
				listIDUnitAttack = returnListUnit;
				resolve();
			})
		})
	}).then(()=>{
		return new Promise((resolve,reject)=>{

			client.hmget(stringHUnit,listIDUnitAttack,function (error,rows) {
				if (rows!=null) {
					for (var i = 0; i < rows.length; i++) {
						if(rows[i]!=null){
							var unitResult = JSON.parse(rows[i]);
							var attackBool = false;
							// console.log('Moving_Attack.js listIDUnitAttack unitResult');
							// console.log(unitResult)
							if (unitResult.Status==6&&unitResult.Attack_Unit_ID==null) {
								attackBool = true;	
							}
							if (unitResult.Attack_Unit_ID==stringKey){
								attackBool = true;
							}
							if (unitResult.Status==6&&unitResult.Attack_Unit_ID=='null') {
								attackBool = true;	
							}
							// console.log('attackBool')
							// console.log(attackBool)

							if (attackBool == false) {
								listIDUnitAttack.splice(listIDUnitAttack.indexOf(listIDUnitAttack[i]), 1);
							}
						}else{
							listIDUnitAttack.splice(listIDUnitAttack.indexOf(listIDUnitAttack[i]), 1);
						}
					}
				}else{
					attackFunc.ClearInterAttack(stringKey,functions.CaseClearAttack.Full)
					// console.log('Moving_Attack.js not found unit')
					return null;
				}

				if (listIDUnitAttack.length==0) {
					attackFunc.ClearInterAttack(stringKey,functions.CaseClearAttack.Full)
					return null;
				}
				// console.log('Moving_Attack.js listIDUnitAttack');
				// console.log(listIDUnitAttack);
				resolve();
			})			
		})
	}).then(()=>{
		return new Promise((resolve,reject)=>{
			client.hget(stringHAttack,stringKey,function (error,rows) {
				if (rows!=null) {
					listCurrentAttack = rows.split("/").filter(String);
				}
				resolve();
			})

		})
		
	}).then(()=>{
		return new Promise((resolve,reject)=>{
			console.log('Moving_Attack.js stringKey listIDUnitAttack pos');
			console.log(stringKey,listIDUnitAttack,pos);
			if (listIDUnitAttack.length>0) {
				attackFunc.SetListAttackData(io,Server_ID,stringKey,listIDUnitAttack,listCurrentAttack);
			}
			resolve();
			
		})
	})

}