'use strict';

var position_Check			= require('./../Redis/Position/Position_Check.js');
var positionCheckPos		= require('./../Redis/Position/Position_CheckPos.js');
var db_position 			= require('./../Util/Database/Db_position.js');
var functions 				= require('./../Util/Functions.js');

var Promise 				= require('promise');
var redis 					= require("redis"),
client 						= redis.createClient();
client.select(functions.RedisData.TestUnit);

var stringHUnit,stringHAttack,stringHPos;

checkAttackPosition (null,'1_16_43_564', 300,2,0)

function checkAttackPosition (io,stringUnit,pos) {
	var unitAttack = stringUnit;
	var arrayUnitInPos = [], tempListUnitInPos = [];

	var Server_ID = stringUnit.split("_")[0];
	var ID_User = stringUnit.split("_")[2];

	var getAttackBool = false;
	var defendingUnit;

	stringHUnit = "s"+Server_ID+"_unit"
	stringHAttack = "s"+Server_ID+"_attack";
	stringHPos = "s"+Server_ID+"_pos";

	positionCheckPos.GetPosition(unitAttack,pos,function (returnPosArray) {
		new Promise((resolve,reject)=>{
			client.hget(stringHPos,pos,function (error,rows) {
				if (rows!=null) {
					arrayUnitInPos = rows.split("/").filter(String);
					for (var i = 0; i < arrayUnitInPos.length; i++) {
						if (arrayUnitInPos[i].split("_")[2] != ID_User) {
							tempListUnitInPos.push(arrayUnitInPos[i]);
						}						
					}
					resolve();
				}
			})

		}).then(()=>new Promise((resolve,reject)=>{
			console.log(tempListUnitInPos)
			if (tempListUnitInPos>0) {
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
			}
		}).then(()=>new Promise((resolve,reject)=>{
			if (getAttackBool==true) {
				console.log('defendingUnit')
				console.log(defendingUnit)
				// attackFunc.SetAttackData(Server_ID,defendingUnit,unitAttack);
				// resolve();
			}
		}).then(()=>new Promise((resolve,reject)=>{
			if (getAttackBool==true) {
				// attackFunc.AttackInterval(io,Server_ID,defendingUnit);
				// resolve();
			}
		}))
		)
		)

	})
}
// var functions = require('./Util/Functions.js')
// var DictMoveAttack={};

// var dataTest = { Server_ID: 1,
// 	ID: 551,
// 	ID_Unit: 16,
// 	ID_User: 43,
// 	Position_Cell: '291,0,0',
// 	Next_Cell: '290,0,0',
// 	End_Cell: '287,0,0',
// 	TimeMoveNextCell: '2019-06-17T03:33:38.749',//10:07
// 	TimeFinishMove: '2019-06-17T03:33:42.949',
// 	ListMove: 
// 	[ { Position_Cell: '290,0,0',
// 	Next_Cell: '289,0,0',
// 	TimeMoveNextCell: '2019-06-17T03:33:40.149' },
// 	{ Position_Cell: '289,0,0',
// 	Next_Cell: '288,0,0',
// 	TimeMoveNextCell: '2019-06-17T03:33:41.549' },
// 	{ Position_Cell: '288,0,0',
// 	Next_Cell: '287,0,0',
// 	TimeMoveNextCell: '2019-06-17T03:33:42.949' } ] }
// //
// checkMovePos (dataTest)
// function checkMovePos (data) {
// 	// console.log(data)
// 	var posCheck = data.Position_Cell;
// 	var timeNext = 0, timeOut = 0;
// 	var Position_Cell_X,Position_Cell_Y,Next_Cell_X,Next_Cell_Y;
// 	// var stringKey = "5"
// 	// var stringMoveAttack = "Moving_Attack_5";
// 	checkCurrentPos (posCheck);

// 	if (data.TimeMoveNextCell!=null) {
// 		Position_Cell_X = data.Position_Cell.toString().split(",")[0];
// 		Position_Cell_Y = data.Position_Cell.toString().split(",")[1];
// 		Next_Cell_X = data.Next_Cell.toString().split(",")[0];
// 		Next_Cell_Y = data.Next_Cell.toString().split(",")[1];
// 		var caseMove = functions.CaseMove.Straight;	

// 		if (Position_Cell_X!=Next_Cell_X&&Position_Cell_Y!=Next_Cell_Y) {caseMove = functions.CaseMove.Diagonal;}

// 		timeNext = functions.ExportTimeDatabase(data.TimeMoveNextCell) - functions.GetTime();

// 		switch (caseMove) {
// 			case functions.CaseMove.Straight:
// 			if (timeNext == functions.TimeMove.Straight) {
// 				// console.log('timeNext == functions.TimeMove.Straight');
// 				timeOut = functions.TimeMove.Straight*0.5;
// 			}else{
// 				// console.log('timeNext != functions.TimeMove.Straight');
// 				timeOut =  timeNext - (functions.TimeMove.Straight*0.5);
// 			}
// 			break;

// 			case functions.CaseMove.Diagonal:			
// 			if (timeNext == functions.TimeMove.Diagonal) {
// 				// console.log('timeNext == functions.TimeMove.Diagonal');
// 				timeOut = functions.TimeMove.Diagonal*0.5;
// 			}else{
// 				// console.log('timeNext != functions.TimeMove.Diagonal');
// 				timeOut =  timeNext - (functions.TimeMove.Diagonal*0.5);
// 			}
// 			break;
// 		}
// 		DictMoveAttack['Moving_Attack_5']=setTimeout(function (data) {
// 			var updateData = data;
// 			if (data.ListMove.length>0) {
// 				updateData.Position_Cell = data.Next_Cell;
// 				updateData.Next_Cell = data.ListMove[0].Next_Cell;
// 				updateData.TimeMoveNextCell = data.ListMove[0].TimeMoveNextCell;
// 				updateData.ListMove.shift();
// 			}else{
// 				updateData.Position_Cell = data.End_Cell;
// 				updateData.TimeMoveNextCell=null;
// 			}
// 			checkMovePos (updateData);
// 		},timeOut,data);

// 	}else {
// 		// if (data.End_Cell!=null) {posCheck=data.End_Cell;}	
// 		// checkCurrentPos (posCheck);
// 	}




// }
// function checkCurrentPos (pos) {
// 	console.log(pos)
// }