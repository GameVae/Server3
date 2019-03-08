'use strict';
var db_all_friend				= require('./../../Util/Database/Db_all_friend.js');
var db_all_guild				= require('./../../Util/Database/Db_all_guild.js');
var functions 					= require('./../../Util/Functions.js');

var redis = require("redis"),
client = redis.createClient();
client.select(functions.RedisData.TestUnit)

exports.GetFriendData = function getFriendData () {
	var stringHkey = "all_friends";
	var queryStringFriend = "SELECT * FROM `"+TABLE_NAME+"`";
	// console.log(queryString)
	db_all_friend.query(queryStringFriend, function (error,rows) {
		// console.log(rows)
		for (var i = 0; i < rows.length; i++) {		
			checkValue (stringHkey,TABLE_NAME,rows[i].ID_Player)
		}	
	});
}
// getFriendData ()
function getFriendData () {
	var queryStringTable = "SELECT `TABLE_NAME` FROM information_schema.tables WHERE `TABLE_SCHEMA`='all_friends' AND `TABLE_NAME`<>'friends'"
	db_all_friend.query(queryStringTable,function (error,rows) {
		if (!!error) {console.log(error);}
		for (var i = 0; i < rows.length; i++) {
			setDataBase (rows[i].TABLE_NAME);
		}
	})

}

function setDataBase (TABLE_NAME) {
	var stringHkey = "all_friends";
	var queryStringFriend = "SELECT * FROM `"+TABLE_NAME+"`";
	// console.log(queryString)
	db_all_friend.query(queryStringFriend, function (error,rows) {
		// console.log(rows)
		for (var i = 0; i < rows.length; i++) {		
			checkValue (stringHkey,TABLE_NAME,rows[i].ID_Player)
		}	
	});
}

function checkValue (stringHkey,stringKey,ID_Key) {
	client.hexists(stringHkey,stringKey,function (error,resultBool) {
		if (resultBool==1) {
			client.hget(stringHkey,stringKey,function (error,rows) {
				var result = rows.split("/");
				if (!result.includes(ID_Key)) {
					addValue (stringHkey,stringKey,rows,ID_Key);
				}
			});
		}else{
			addValue (stringHkey,stringKey,"",ID_Key);
		}
	});
}

function addValue (stringHkey,stringKey,data,ID_Key) {
	client.hset(stringHkey,stringKey,data+ID_Key+"/");
}