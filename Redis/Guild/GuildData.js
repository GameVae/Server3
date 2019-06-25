'use strict';
var db_all_guild				= require('./../../Util/Database/Db_all_guild.js');
var functions 					= require('./../../Util/Functions.js');

var redis = require("redis"),
client = redis.createClient();
client.select(functions.RedisData.TestUnit)

//getGuildData2 ()
exports.Test = function test (para) {
	console.log(para)
}
exports.GetGuildData = function getGuildData2 () {
	getGuildData ()
}
function getGuildData () {
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
exports.CheckListGuildData = function checkListGuildData2 (List_ID_Unit_User,ID_Player,returnListUnit) {
	var stringHkey = "all_guilds";
	var listIDUnitAttack = [];
	var listIDUser = [];
	// listIDUnitAttack.push(ID_Player);
	var listUnitAttack = [];

	for (var i = 0; i < List_ID_Unit_User.length; i++) {
		var unitId = List_ID_Unit_User[i].split("_")[2];
		listIDUser.push(unitId);
	}

	client.hmget(stringHkey,listIDUser,function (error,rows) {		
		if (rows!=null) {
			for (var i = 0; i < rows.length; i++) {
				if (rows[i]!=null) {
					var result = rows[i].split("/").filter(String);
					if (!result.includes(ID_Player)) {
						listUnitAttack.push(List_ID_Unit_User[i]);
					}
				}else{
					listUnitAttack.push(List_ID_Unit_User[i]);
				}				
			}			
		}else{ 
			listUnitAttack = List_ID_Unit_User;
		}
		returnListUnit(listUnitAttack);
	});
}
