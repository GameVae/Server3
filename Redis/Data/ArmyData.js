'use strict';
var Redis 					= require("./../../Redis.js")

var db_training				= require('./../../Util/Database/Db_training.js');

var functions 				= require('./../../Util/Functions.js');

// var redis = require("redis"),
// client = redis.createClient();

// testRedis ();
// function testRedis () {
//     client.select(1)
//     getLevel_Data (client)
// }

exports.SetLevelData = function setLevelData (clientRedis,databaseRedis) {
	clientRedis.select(databaseRedis)
	setLevel_Data (clientRedis);
}

//getLevel_Data ();
function setLevel_Data (clientRedis) {
	var queryStringTable = "SELECT `TABLE_NAME` FROM information_schema.tables WHERE `TABLE_SCHEMA`='training_database'"
	db_training.query(queryStringTable,function (error,rows) {
		
		for (var i = 0; i < rows.length; i++) {

			setDataBase (clientRedis,rows[i].TABLE_NAME);
		}
	});
}

function setDataBase (clientRedis,TABLE_NAME) {
	var queryString = "SELECT * FROM "+TABLE_NAME;
	db_training.query(queryString,function (error,rows) {
		clientRedis.set(TABLE_NAME,JSON.stringify(rows));

		//console.log (result);
		// var jso = JSON.parse(result)
		// console.log(jso.length);
	});
}

exports.GetLevelData = function getLevelData (clientRedis,databaseRedis) {
	clientRedis.select(databaseRedis)
	getLevel_Data (clientRedis);
}

//getLevel_Data ();
function getLevel_Data (clientRedis) {

	clientRedis.get('solider', function (error,rows) {
		var result = JSON.parse(rows)
		console.log(result[0]);
	});
}

exports.SetHLvData = function setHLvData (clientRedis,databaseRedis) {
	clientRedis.select(databaseRedis)
	setHLevel_Data (clientRedis);
}

function setHLevel_Data (clientRedis) {
	var queryStringTable = "SELECT `TABLE_NAME` FROM information_schema.tables WHERE `TABLE_SCHEMA`='training_database'"
	db_training.query(queryStringTable,function (error,rows) {		
		for (var i = 0; i < rows.length; i++) {
			setHDataBase (clientRedis,rows[i].TABLE_NAME);
		}
	});
}

function setHDataBase (clientRedis,TABLE_NAME) {
	var queryString = "SELECT * FROM "+TABLE_NAME;
	db_training.query(queryString,function (error,rows) {

		clientRedis.hset("unitTable",TABLE_NAME,JSON.stringify(rows));
		
	});
}
