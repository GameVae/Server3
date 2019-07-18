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
			functions.ShowLog(functions.ShowLogBool.On,'Moving_Attack.js Start data',[dataMoveAttack]);
			stringUnit = dataMoveAttack.Server_ID+"_"+dataMoveAttack.ID_Unit+"_"+dataMoveAttack.ID_User+"_"+dataMoveAttack.ID;
			functions.ShowLog(functions.ShowLogBool.On,'Moving_Attack.js Start data',[stringUnit])

			// clearMoveAttackTimeout (stringUnit);	
			stringHMovingAttack = "s"+dataMoveAttack.Server_ID+"_movingAttack";	

			new Promise((resolve,reject)=>{
				functions.ShowLog(functions.ShowLogBool.On,'Moving_Attack.js Start=>clearAttackUnit stringUnit',[stringUnit]);
				clearAttackUnit (stringUnit);
				resolve();
			}).then(()=>{
				new Promise((resolve,reject)=>{
					functions.ShowLog(functions.ShowLogBool.On,'Moving_Attack.js Start=>clearMovingAttack stringUnit',[stringUnit]);
					clearMovingAttack (stringUnit);
					resolve();
				})
			}).then(()=>{
				new Promise((resolve,reject)=>{
					functions.ShowLog(functions.ShowLogBool.On,'Moving_Attack.js start hset stringHMovingAttack,stringUnit',[stringHMovingAttack,stringUnit]);
					client.hset(stringHMovingAttack,stringUnit,JSON.stringify(dataMoveAttack))
					resolve()
				})
			}).then(()=>{
				new Promise((resolve,reject)=>{
					functions.ShowLog(functions.ShowLogBool.On,'Moving.js Moving_Attack hget stringHMovingAttack,stringUnit',[stringHMovingAttack,stringUnit]);
					client.hget(stringHMovingAttack,stringUnit,function (error,rows) {
						if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'Moving.js Moving_Attack start hget stringHMovingAttack,stringUnit',[stringHMovingAttack,stringUnit]);}
						var result = JSON.parse(rows);
						functions.ShowLog(functions.ShowLogBool.On,'Moving.js Moving_Attack start=>checkMovePos result,stringUnit',[result,stringUnit]);
						attackFunc.CheckMovePos (io,result,stringUnit);
						resolve();
					})
				})
			})

		})
	})
}
// exports.Moving_Attack = function moving_Attack(io,socket,data) {
// 	// console.log('Moving_Attack.js data');
// 	// console.log(data);
// 	stringUnit = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;
// 	functions.ShowLog(functions.ShowLogBool.On,'Moving_Attack.js start data,stringUnit',[data,stringUnit]);

// 	var stringHMovingAttack = "s"+data.Server_ID+"_movingAttack";
// 	functions.ShowLog(functions.ShowLogBool.On,'Moving_Attack.js start=>clearAttackUnit stringUnit',[stringUnit]);
// 	clearAttackUnit (stringUnit);
// 	functions.ShowLog(functions.ShowLogBool.On,'Moving_Attack.js start=>clearMovingAttack hset stringUnit',[stringUnit]);
// 	clearMovingAttack (stringUnit);

// 	new Promise((resolve,reject)=>{
// 		functions.ShowLog(functions.ShowLogBool.On,'Moving_Attack.js start hset stringHMovingAttack,stringUnit',[stringHMovingAttack,stringUnit]);
// 		client.hset(stringHMovingAttack,stringUnit,JSON.stringify(data),function (error,result) {
// 			if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'Moving.js Moving_Attack hset stringHMovingAttack,stringUnit',[stringHMovingAttack,stringUnit]);}
// 			resolve();
// 		})
// 	}).then(()=>{
// 		new Promise((resolve,reject)=>{
// 			functions.ShowLog(functions.ShowLogBool.On,'Moving_Attack.js start hget stringHMovingAttack,stringUnit',[stringHMovingAttack,stringUnit]);
// 			client.hget(stringHMovingAttack,stringUnit,function (error,rows) {
// 				if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'Moving.js Moving_Attack hget stringHMovingAttack,stringUnit',[stringHMovingAttack,stringUnit]);}
// 				var result = JSON.parse(rows);
// 				functions.ShowLog(functions.ShowLogBool.On,'Moving_Attack.js start=>checkMovePos result,stringUnit',[result,stringUnit]);
// 				checkMovePos (io,result,stringUnit);
// 				resolve();
// 			})
// 		})

// 	})	
// }

exports.ClearMovingAttack = clearMovingAttack;
function clearMovingAttack (stringUnit) {
	stringMoveAttack = "Moving_Attack_"+stringUnit;
	functions.ShowLog(functions.ShowLogBool.Off,'Moving_Attack.js clearMovingAttack stringUnit,stringMoveAttack,DictMoveAttack[stringMoveAttack]',[stringUnit,stringMoveAttack,DictMoveAttack[stringMoveAttack]]);
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
		functions.ShowLog(functions.ShowLogBool.On,'Moving_Attack.js clearAttackUnit hget stringHUnit,stringUnit',[stringHUnit,stringUnit]);
		client.hget(stringHUnit,stringUnit,function (error,rows) {
			if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'Moving_Attack.js clearAttackUnit stringHUnit stringUnit',[stringHUnit,stringUnit]);}
			if (rows!=null) {
				var result = JSON.parse(rows);
				defendUnit = result.Attack_Unit_ID;
			}
			resolve();
		})
	}).then(()=>{
		
		return new Promise((resolve,reject)=>{
			if (defendUnit!=null) {
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
			}else{
				resolve();
			}
		})
		
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



