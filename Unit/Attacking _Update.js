'use strict';

var attackFunc 		= require('./../Redis/Attack/Attack.js');

var functions 		= require('./../Util/Functions.js');

var stringHAttack;

var Promise 		= require('promise');

var redis 				= require("redis"),
client 					= redis.createClient();
client.select(functions.RedisData.TestUnit);

exports.UpdateAttack = function updateAttack (io,Server_ID) {
	updateAttack2 (io,Server_ID);	
}

function updateAttack2 (io,Server_ID) {
	stringHAttack = "s"+Server_ID+"_attack";
	client.hkeys(stringHAttack,function (error,rows) {
		for (var i = 0; i < rows.length; i++) {
			runAttackInterval (io,Server_ID,rows[i])			
		}
	});
}

function runAttackInterval (io,Server_ID,stringKeyDefend) {
	attackFunc.AttackInterval(io,Server_ID,stringKeyDefend);
}