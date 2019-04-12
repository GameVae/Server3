'use strict';
var db_all_guild				= require('./../../Util/Database/Db_all_guild.js');
var functions 					= require('./../../Util/Functions.js');

var redis = require("redis"),
client = redis.createClient();
client.select(functions.RedisData.TestUnit)

//getGuildData2 ()
exports.GetGuildData = function getGuildData () {
	getGuildData2 ()
}
function getGuildData2 () {
	var queryStringTable = "SELECT `TABLE_NAME` FROM information_schema.tables WHERE `TABLE_SCHEMA`='all_guilds' AND `TABLE_NAME`<>'guild' AND `TABLE_NAME`<>'guild_info'"
	db_all_guild.query(queryStringTable,function (error,rows) {
		if (!!error) {console.log(error);}
		//console.log(rows)
		for (var i = 0; i < rows.length; i++) {
			setDataGuild (rows[i].TABLE_NAME);
		}
	})
}
function setDataGuild (TABLE_NAME) {
	var stringHkey = "all_guilds";
	var stringQuery = "SELECT * FROM `"+TABLE_NAME+"`";
	db_all_guild.query(stringQuery,function (error,rows) {
		for (var i = 0; i < rows.length; i++) {
			addValueGuild (stringHkey,rows[i].ID_User,TABLE_NAME);
		}		
	})
}

function addValueGuild (stringHkey,stringID_User,ID_Guild) {
	client.hset(stringHkey,stringID_User,ID_Guild);
}

exports.CheckSameGuildID = function checkSameGuildID (ID_User1,ID_User2,returnBool) {
	var checkBool = false;
	var stringHkey = "all_guilds";
	// console.log(ID_User1,ID_User2)
	client.hmget(stringHkey,ID_User1,ID_User2, function (error,rows) {
		// console.log(rows)
		if (rows[0]==rows[1]&&rows[0]!=null) {checkBool = true;}
		// var boolCheck = rows.every((val,i,arr)=> val===rows[0])
		returnBool(checkBool);
	})
}

exports.AddValueGuild = function addValueGuild (stringID_User,ID_Guild) {
	var stringHkey = "all_guilds";
	client.hset(stringHkey,stringID_User,ID_Guild);
}

exports.RemoveValueGuild = function removeValueGuild (stringID_User) {
	var stringHkey = "all_guilds";
	client.hdel(stringHkey,stringID_User);
}

// function checkSameGuildID (ID_User1,ID_User2,returnBool) {
// 	var checkBool = false;
// 	var stringHkey = "all_guilds";
// 	// console.log(ID_User1,ID_User2)
// 	client.hmget(stringHkey,ID_User1,ID_User2, function (error,rows) {
	
// 		if (rows[0]==rows[1]&&rows[0]!=null) {checkBool = true;}
// 		// var boolCheck = rows.every((val,i,arr)=> val===rows[0])
// 		returnBool(checkBool);
// 	})
// }