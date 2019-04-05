'use strict';

// var db_all_user		= require('./../Util/Database/Db_all_user.js');
var db_position		= require('./../Util/Database/Db_position.js');
var moveUnit 		= require('./../Redis/Move/Move.js');

var attackFunc 		= require('./../Redis/Attack/Attack.js');
var friendData 		= require('./../Redis/Friend/FriendData.js');
var guildData 		= require('./../Redis/Guild/GuildData.js');

var positionAdd		= require('./../Redis/Position/Position.js');

var functions 		= require('./../Util/Functions.js');

var DetailError;
var currentTime;

var stringKeyMove;
var stringHUnit,stringKey,
stringHAttack, stringKeyAttack,stringKeyDefend;

var Promise 		= require('promise');

var redis 				= require("redis"),
client 					= redis.createClient();
client.select(functions.RedisData.TestUnit);


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

var dataAttack = {
	Server_ID: 1,

	ID_Attack: 11,
	ID_Unit_Attack: 16,
	ID_User_Attack: 9,

	ID_Defend: 25,
	ID_Unit_Defend: 16,	
	ID_User_Defend: 42,	

	Position_Cell_Attacker: '4,4,0',
}

function updateRedis (data) {
	// var stringHPos = "s"+data.Server_ID+"_pos";
	positionAdd.AddPosition (data);
}

// S_ATTACK ('io',dataAttack);
// updateDatabase (dataAttack)
function updateDatabase (data) {
	var stringUpdate = "UPDATE `s"+data.Server_ID+"_unit` SET "
	+"`Status`='"+functions.UnitStatus.Attack_Unit
	+"',`Attack_Unit_ID`='"+data.ID_Defend
	+"' WHERE `ID`='"+data.ID_Attack+"'";
	db_position.query(stringUpdate,function (error,result) {
		if (!!error) {console.log(error);}
	})
	var stringUpdateDefend = "UPDATE `s"+data.Server_ID+"_unit` SET "
	+"`Status`='"+functions.UnitStatus.Attacked
	+"',`AttackedBool`='1'"
	+" WHERE `ID`='"+data.ID_Defend+"'";
	db_position.query(stringUpdateDefend,function (error,result) {
		if (!!error) {console.log(error);}
	})
}

function S_ATTACK (io,data) {
	if (data.ID_User_Attack!=data.ID_User_Defend) {
		stringHAttack = "s"+data.Server_ID+"_attack";
		stringKeyAttack = data.Server_ID+"_"+data.ID_Unit_Attack+"_"+data.ID_User_Attack+"_"+data.ID_Attack;
		stringKeyDefend = data.Server_ID+"_"+data.ID_Unit_Defend+"_"+data.ID_User_Defend+"_"+data.ID_Defend;
		var checkBoolFriendData = false;
		var checkBoolGuildData = false;
		new Promise((resolve,reject)=>{
			friendData.CheckFriendData (data.ID_Attack,data.ID_Defend,function (returnBool) {
				checkBoolFriendData =returnBool;
				resolve();
			})
		}).then(()=>new Promise((resolve,reject)=>{
			guildData.CheckSameGuildID (data.ID_User_Attack,data.ID_User_Defend,function (returnBool) {
				checkBoolGuildData = returnBool;
				resolve();
			})						
		}).then(()=>new Promise((resolve,reject)=>{
			// console.log(checkBoolFriendData,checkBoolGuildData)
			if (checkBoolFriendData==false&&checkBoolGuildData==false) {
			//var ID_Defend = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;
			attackFunc.SetAttackData(data.Server_ID,stringKeyDefend,stringKeyAttack);
			resolve();
		}
	}).then(()=>{
		// (Server_ID,ID_User_Defend)
		attackFunc.AttackInterval(data.Server_ID,stringKeyDefend)
		//attackInterval (data.ID_User_Defend)
	})
	))
	}else{
		console.log('same user')
	}
}
