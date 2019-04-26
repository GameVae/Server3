'use strict';

// var db_all_user		= require('./../Util/Database/Db_all_user.js');

var functions 				= require('./../Util/Functions.js');

var stringHPos,stringHUnit,
stringUnitMoving;

var checkBoolFriendData, checkBoolGuildData, attackBool;
var ID_Defend;

var redis 				= require("redis"),
client 					= redis.createClient();
client.select(functions.RedisData.TestUnit);
var Promise = require('promise');

var dataMoveAttack ={};
// { Server_ID: 1,
//   ID: 51,
//   ID_Unit: 16,
//   ID_User: 42,
//   Position_Cell: '12,4,0',
//   Next_Cell: '13,5,0',
//   End_Cell: '15,9,0',
//   TimeMoveNextCell: 1262,
//   TimeFinishMove: 6310,
//   ListMove:
//    [ { Position_Cell: '13,5,0',
//        Next_Cell: '13,6,0',
//        TimeMoveNextCell: 2524 },
//      { Position_Cell: '13,6,0',
//        Next_Cell: '14,7,0',
//        TimeMoveNextCell: 3786 },
//      { Position_Cell: '14,7,0',
//        Next_Cell: '14,8,0',
//        TimeMoveNextCell: 5048 },
//      { Position_Cell: '14,8,0',
//        Next_Cell: '15,9,0',
//        TimeMoveNextCell: 6310 } ],
//   Attack_Unit_ID: 'NULL' }

exports.MOVE_ATTACK = function move_Attack2 (io,data) {
	move_Attack (io,data)
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
// checkCurrentPosition (null,S_MOVE_data,S_MOVE_data.Position_Cell);
move_Attack (null,S_MOVE_data)
function move_Attack (io,data) {
	stringHPos = "s"+data.Server_ID+"_pos";
	stringHUnit ="s"+data.Server_ID+"_unit";
	stringUnitMoving = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID; 
	// console.log(data);
	dataMoveAttack =  Object.create(data)

	dataMoveAttack={
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
	
	console.log(dataMoveAttack)
	clearMoveTimeout (stringUnitMoving);
	checkCurrentPosition (io,dataMoveAttack,dataMoveAttack.Position_Cell);
	// moveCalc (dataMoveAttack);

}

function checkCurrentPosition (io,data,pos) {
	var unitBool = false;
	console.log(stringUnitMoving)

	new Promise((resolve,reject)=>{
		client.hexists(stringHUnit,stringUnitMoving,function (error,rowBool) {
			if (rowBool==1) {
				unitBool = true;
			}else{
				clearMoveTimeout (stringUnitMoving)
			}
			resolve();
		})
	}).then(()=>new Promise((resolve,reject)=>{

		if (unitBool == true) {			
			client.hexists(stringHPos,pos,function (error,resultPos) {	
				// console.log(resultPos)			
				if (resultPos==1) {
					client.hget(stringHPos,pos,function (error,rowsUnit) {						
						if (rowsUnit!=null) {
							var unitResult = rowsUnit.split("/").filter(String);
							
							for (var i = 0; i < unitResult.length; i++) {
								getAttackData (io,data,unitResult[i]);
							}
						}						
					})
				}
			});	
		}else{
			clearMoveTimeout (stringUnitMoving);
		}
		resolve();
	})
	)
}

function getAttackData (io,data,ID_Player) {

	checkBoolFriendData = false;
	checkBoolGuildData = false;
	attackBool = false;
	ID_Defend;

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
				console.log('ID_Defend: '+ID_Defend);
				attackFunc.AttackInterval(io,data.Server_ID,ID_Defend);
				resolve();
			}			
		}))
		)
		)
	}
}

function clearMoveTimeout (stringData) {
	if (DictTimeMoveAttack[stringData]!=undefined) {
		clearTimeout(DictTimeMoveAttack[stringData]);
		delete DictTimeMoveAttack[stringData];
	}
}