'use strict';
var db_s1_base_info			= require('./../../Util/Database/Db_s1_base_info.js');
var db_s1_base_defend		= require('./../../Util/Database/Db_s1_base_defend.js');

var db_s2_base_info			= require('./../../Util/Database/Db_s2_base_info.js');
var db_s2_base_defend		= require('./../../Util/Database/Db_s2_base_defend.js');

var db_training				= require('./../../Util/Database/Db_training.js');
var db_position				= require('./../../Util/Database/Db_position.js');
var db_all_user				= require('./../../Util/Database/Db_all_user.js');

var functions 				= require('./../../Util/Functions.js');
var Promise 				= require('promise');

exports.GetUnitData = function getUnitData (clientRedis,serverInt) {
	getUnitInfo (clientRedis,serverInt);
}

//getUnitInfo ('clientRedis',1);
function getUnitInfo (clientRedis,serverInt) {
	//deleteHashKey (clientRedis,serverInt);
	var stringQuery = "SELECT * FROM `s"+serverInt+"_unit`"
	var stringHUnit = "s"+serverInt+"_unit"
	db_position.query(stringQuery,function (error,rows) {
		// console.log(rows.length);
		for (var i = 0; i < rows.length; i++) {
			var stringKey = serverInt+"_"+rows[i].ID_Unit+"_"+rows[i].ID_User+"_"+rows[i].ID;
			//console.log(stringKey);
			//clientRedis.set(stringKey,JSON.stringify(rows[i]))
			updateRedisData (clientRedis,stringHUnit,stringKey,rows[i])
			
		}	
	});

	// db_position.query(stringUnit,function (error,rows) {
	// 	for (var i = 0; i < rows.length; i++) {
	// 		var stringKey = serverInt+"_"+rows[i].ID_Unit+"_"+rows[i].ID_User+"_"+rows[i].ID;
	// 		//console.log(stringKey);
	// 		//clientRedis.set(stringKey,JSON.stringify(rows[i]))
	// 		clientRedis.hset("s"+serverInt+"_unit",stringKey,JSON.stringify(rows[i]))
	// 	}	
	// });

}
function updateRedisData (clientRedis,stringHkey,stringKey,data) {
	clientRedis.hset(stringHkey,stringKey,JSON.stringify(data))
}
function deleteHashKey (clientRedis,server_ID) {
	var stringHkey = "s"+server_ID+"_unit";
	clientRedis.del(stringHkey);
}
/*
Update Redis: parse String to Json => Update value => parse to Json 
*/
exports.UpdateData = function updateData (clientRedis) {
	var keyUpdate = "1_16_9";
	clientRedis.get(keyUpdate,function (error,rows) {
		var result = JSON.parse(rows);
		result.Quality = 12;
		console.log(result.Quality)
		clientRedis.set(keyUpdate,JSON.stringify(result));
	})	
}

exports.GetUnitValue = function getUnitValue (clientRedis,data) {	
	
	var stringHkey = "s"+data.Server_ID+"_unit";
	var stringKey = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;
	console.log(stringKey)
	clientRedis.hget(stringHkey,stringKey, function (error,rows) {
		var result = JSON.parse(rows);
		console.log(result.Quality);
	});
}

exports.GetAvgUnit = function getAvgUnit (clientRedis) {
	var list_ID_User = ["1_16_9_2","1_16_9_4","1_16_9_6"];
	var stringHkey = "s1_unit";
	var stringKeyB = "1_16_9_3";
	
	var dataB ={};
	var Attack = 0;
	new Promise((resolve,reject)=>{
		clientRedis.hget(stringHkey,stringKeyB,function (error,rows) {
			var result = JSON.parse(rows);
			dataB.Quality = result.Quality;
			dataB.Attack = result.Attack;
			dataB.Defend = result.Defend;
			dataB.Hea_cur = result.Hea_cur;
			resolve();
		});
	}).then(()=>new Promise((resolve,reject)=>{
		clientRedis.hmget(stringHkey,list_ID_User,function (error,rows) {
			for (var i = 0; i < rows.length; i++) {
				var result = JSON.parse(rows[i]);
				Attack = Attack + (result.Attack * (result.Quality/dataB.Quality));
				resolve();
			}
		});
	}).then(()=>{
		console.log(parseFloat(Attack).toFixed(2));
	}));
}