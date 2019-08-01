'use strict';
var attackFunc 		= require('./attackFunc.js');
// var db_all_user		= require('./../Util/Database/Db_all_user.js');
var db_position		= require('./../Util/Database/Db_position.js');
// var moveUnit 		= require('./../Redis/Move/Move.js');


var friendData 		= require('./../Redis/Friend/FriendData.js');
var guildData 		= require('./../Redis/Guild/GuildData.js');

var positionAdd		= require('./../Redis/Position/Position.js');
var positionCheck	= require('./../Redis/Position/Position_Check.js');

var functions 		= require('./../Util/Functions.js');

var DetailError;
var currentTime;

var stringKeyMove;
var stringHUnit,stringKey,
stringHAttack, stringKeyAttack,stringKeyDefend;

var Server_ID;

var Promise 		= require('promise');

var redis 				= require("redis"),
client 					= redis.createClient();
client.select(functions.RedisData.TestUnit);

var dataAttack = 
{ Server_ID: '1',
ID_Attack: '54',
ID_Unit_Attack: '16',
ID_User_Attack: '42',
ID_Defend: '43',
ID_Unit_Defend: '16',
ID_User_Defend: '9',
Position_Cell_Attacker: '12,5,0' }

//
exports.Start = function start (io) {
	io.on('connection', function(socket){
		socket.on('S_ATTACK', function (data){
			// console.log('S_UNIT: '+data);
			S_ATTACK (io,data);
			updateRedis (data);
			updateDatabase (data);
		});
	});
}
// #begin: S_ATTACK
// S_ATTACK (null,dataAttack)
function S_ATTACK (io,data) {
	// console.log(data);
	Server_ID = data.Server_ID;

	stringHAttack = "s"+Server_ID+"_attack";
	stringKeyAttack = Server_ID+"_"+data.ID_Unit_Attack+"_"+data.ID_User_Attack+"_"+data.ID_Attack;
	stringKeyDefend = Server_ID+"_"+data.ID_Unit_Defend+"_"+data.ID_User_Defend+"_"+data.ID_Defend;
	stringHUnit = "s"+Server_ID+"_unit";

	functions.ShowLog(functions.ShowLogBool.On,'Attacking.js S_ATTACK=>attackFunc.setAttackData Server_ID,stringKeyDefend,stringKeyAttack',[Server_ID,stringKeyDefend,stringKeyAttack]);
	attackFunc.SetAttackData(io,Server_ID,stringKeyDefend,stringKeyAttack);
	// new Promise((resolve,reject)=>{
	// 	attackFunc.SetAttackData(io,Server_ID,stringKeyDefend,stringKeyAttack);
	// 	resolve();
	// }).then(()=>new Promise((resolve,reject)=>{
	// 	attackFunc.AttackInterval(io,Server_ID,stringKeyDefend);
	// 	// checkUnitDefend (io,stringKeyAttack,stringKeyDefend,data.Position_Cell_Attacker);
	// 	resolve();
	// })
	// )
	// if (data.ID_User_Attack!=data.ID_User_Defend) {
	// 	stringHAttack = "s"+data.Server_ID+"_attack";
	// 	stringKeyAttack = data.Server_ID+"_"+data.ID_Unit_Attack+"_"+data.ID_User_Attack+"_"+data.ID_Attack;
	// 	stringKeyDefend = data.Server_ID+"_"+data.ID_Unit_Defend+"_"+data.ID_User_Defend+"_"+data.ID_Defend;
	// 	var checkBoolFriendData = false;
	// 	var checkBoolGuildData = false;
	// 	new Promise((resolve,reject)=>{
	// 		friendData.CheckFriendData (data.ID_Attack,data.ID_Defend,function (returnBool) {
	// 			checkBoolFriendData =returnBool;
	// 			resolve();
	// 		})
	// 	}).then(()=>new Promise((resolve,reject)=>{
	// 		guildData.CheckSameGuildID (data.ID_User_Attack,data.ID_User_Defend,function (returnBool) {
	// 			checkBoolGuildData = returnBool;
	// 			resolve();
	// 		})						
	// 	}).then(()=>new Promise((resolve,reject)=>{
	// 		// console.log(checkBoolFriendData,checkBoolGuildData)
	// 		if (checkBoolFriendData==false&&checkBoolGuildData==false) {
	// 		//var ID_Defend = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;
	// 		attackFunc.SetAttackData(data.Server_ID,stringKeyDefend,stringKeyAttack);
	// 		resolve();
	// 	}
	// }).then(()=>{

	// 	attackFunc.AttackInterval(io,data.Server_ID,stringKeyDefend)
	// 	// console.log(stringKeyAttack,stringKeyDefend,data.Position_Cell_Attacker)
	// 	checkUnitDefend (io,stringKeyAttack,stringKeyDefend,data.Position_Cell_Attacker);
	// })
	// ))
	// }else{
	// 	console.log('same user')
	// }
}
// #end: S_ATTACK

exports.CheckUnitDefend = function checkUnitDefend2(io,stringKeyAttack,stringKeyDefend,Position_Cell_Attacker) {
	checkUnitDefend (io,stringKeyAttack,stringKeyDefend,Position_Cell_Attacker)
}
function checkUnitDefend (io,stringKeyAttack,stringKeyDefend,Position_Cell_Attacker) {
	//Server_ID = stringKeyDefend.split("_")[0]
	// console.log(stringHUnit,stringKeyAttack,stringKeyDefend)
	// cần check range

	client.hget(stringHUnit,stringKeyDefend,function (error,rows) {
		var result = JSON.parse(rows);
		// console.log(result)
		if (result.Status==functions.UnitStatus.Standby||
			result.Status==functions.UnitStatus.Attack_Unit&&result.Attack_Unit_ID==stringKeyAttack) {
			counterUnitDefend(io,stringKeyAttack,stringKeyDefend,Position_Cell_Attacker);
	}
})
}

exports.Test = function (ar) {
	console.log(ar);
}

function updateRedis (data) {
	// var stringHPos = "s"+data.Server_ID+"_pos";
	positionAdd.AddPosition (data);
}

function updateDatabase (data) {
	var Attack_Unit_ID = data.Server_ID+"_"+data.ID_Unit_Defend+"_"+data.ID_User_Defend+"_"+data.ID_Defend;
	var stringUpdate = "UPDATE `s"+data.Server_ID+"_unit` SET "
	+"`Status`='"+functions.UnitStatus.Attack_Unit
	+"',`Attack_Unit_ID`='"+Attack_Unit_ID
	+"' WHERE `ID`='"+data.ID_Attack+"'";
	db_position.query(stringUpdate,function (error,result) {
		if (!!error) {console.log(error);}
	})
	var stringUpdateDefend = "UPDATE `s"+data.Server_ID+"_unit` SET "
	+"`AttackedBool`='1'"
	+" WHERE `ID`='"+data.ID_Defend+"'";
	// console.log(data);
	db_position.query(stringUpdateDefend,function (error,result) {
		if (!!error) {console.log(error);}
	})
}


//1_16_42_16 1_16_9_12 13,11,0
// checkUnitDefend (null,'1_16_42_18','1_16_9_12','12,9,0');

function counterUnitDefend(io,stringKeyAttack,stringKeyDefend,Position_Cell_Attacker){
	var posDefend=[];
	var attackBool =false;
	// console.log(stringKeyAttack,stringKeyDefend,Position_Cell_Attacker)
	new Promise((resolve,reject)=>{
		client.hget(stringHUnit,stringKeyDefend,function (error,rows) {
			var result = JSON.parse(rows);
			positionCheck.GetPosition(stringKeyDefend,function (returnPosArray) {
				posDefend = returnPosArray;
				resolve();
			})
		});
	}).then(()=>new Promise((resolve,reject)=>{
		// console.log(posDefend,Position_Cell_Attacker)
		if (posDefend.includes(Position_Cell_Attacker)) {
			attackBool = true;
			updateDefendData (stringKeyDefend,stringKeyAttack);
			attackFunc.SetAttackData(Server_ID,stringKeyAttack,stringKeyDefend);
		}
		resolve();
	}).then(()=>new Promise((resolve,reject)=>{
		// console.log(attackBool)
		if (attackBool == true) {
			// console.log(stringKeyAttack)
			attackFunc.AttackInterval(io,Server_ID,stringKeyAttack);
		}	
		resolve();
	}))
	)
}

function updateDefendData (stringKeyDefend,stringKeyAttack) {
	client.hget(stringHUnit,stringKeyDefend,function (error,rows) {
		var result = JSON.parse(rows)
		result.Attack_Unit_ID = stringKeyAttack;
		result.Status = functions.UnitStatus.Attack_Unit;
		client.hset(stringHUnit,stringKeyDefend,JSON.stringify(result))
	})
	var ID_Defend = stringKeyDefend.split('_')[3]
	var stringUpdate = "UPDATE `s"+Server_ID+"_unit` SET `Attack_Unit_ID` ='"+stringKeyAttack+"', `Status`='"+functions.UnitStatus.Attack_Unit+"', `AttackedBool`='1' WHERE `ID`='"+ID_Defend+"'"
	db_position.query(stringUpdate,function (error,result) {
		if (!!error) {console.log(error)}
	});
}