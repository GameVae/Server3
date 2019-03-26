'use strict';

// var db_all_user		= require('./../Util/Database/Db_all_user.js');
var db_position		= require('./../Util/Database/Db_position.js');
var moveUnit 		= require('./../Redis/Move/Move.js');

var functions 		= require('./../Util/Functions.js');

var DetailError;
var currentTime;
var stringKeyMove;
var redis 				= require("redis"),
client 					= redis.createClient();
client.select(functions.RedisData.TestUnit);


exports.Start = function start (io) {
	io.on('connection', function(socket){
		socket.on('S_ATTACK', function (data){
			// console.log('S_UNIT: '+data);
			S_ATTACK (io,data);
		});
	});
}

var dataAttack = {
	Server_ID: 1,
	ID_Unit_Attack: 31,
	ID_Unit_Defend: 16,
	ID_User_Attack: 42,
	ID_User_Defend: 42,
	ID_Attack: 31,
	ID_Defend: 13,
	Position_Cell_Attacker: '4,4,0',

}

var stringHUnit,stringKey,
stringHAttack,stringKeyAttack,stringKeyDefend;

S_ATTACK ('io',dataAttack);

function S_ATTACK (io,data) {
	if (data.ID_User_Attack==data.ID_User_Defend) {
		console.log('here')
	}

	stringHAttack = "s"+data.Server_ID+"_attack";
	stringKeyAttack = data.Server_ID+"_"+data.ID_Unit_Attack+"_"+data.ID_User_Attack+"_"+data.ID_Attack;
	stringKeyDefend = data.Server_ID+"_"+data.ID_Unit_Defend+"_"+data.ID_User_Defend+"_"+data.ID_Defend;
	checkAttackList (stringKeyAttack,stringKeyDefend);

}

function checkAttackList (stringKeyAttack,stringKeyDefend) {
	// console.log(stringHAttack,stringKeyDefend)	
	client.hexists(stringHAttack,stringKeyDefend,function (error,rows) {
		if (rows==1) {
			client.hget(stringHAttack,stringKeyDefend,function (error,rowsValue) {
				var result = rowsValue.split("/");
				if (!result.includes(stringKeyAttack)) {
					addValue (stringHAttack,stringKeyDefend,rowsValue,stringKeyAttack);
				}				
			});
		}else{
			addValue (stringHAttack,stringKeyDefend,"",stringKeyAttack);
		}
	});
}

function addValue (stringHkey,stringKey,data,ID_Key) {
	client.hset(stringHkey,stringKey,data+ID_Key+"/");
}