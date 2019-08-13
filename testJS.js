'use strict';
// var db_friend =  require('./Util/Database/Db_all_friend.js');

// // test ()
// // function test () {

// // }
// // var unitT = '1_21_42_959'
// // var returnPosArraya = ['300,5,0','300,5,0','299,5,0','299,4,0','299,6,0','300,6,0','300,4,0','301,5,0','298,5,0','298,4,0','298,6,0','299,3,0','299,7,0','300,3,0','300,7,0','301,7,0','301,3,0','301,4,0','301,6,0','302,5,0']

// var redis = require("redis"),
// client = redis.createClient();
// client.select(2)
// // removeValueFriend ("44",'43')
// test (43,12)
// function test (ID_User,GuildID) {
// 	var stringHGuild = "all_guilds";

// 	client.hset(stringHGuild,ID_User,GuildID.toString());
// }

var db_all_user			= require('./Util/Database/Db_all_user.js');
var db_all_guild		= require('./Util/Database/Db_all_guild.js');
var Promise = require('promise')
test ()
function test () {
	// var stringQuery = "SELECT * FROM `13` INNER JOIN `guild_info` WHERE `Guild_ID`='13'"
	// db_all_guild.query(stringQuery,function (error,rows) {
	// 	if (!!error) {console.log(error);}
	// 	console.log(rows)
	// })
	// var stringQuery = "SELECT * FROM `all_guilds`.`13`"
	// db_all_guild.query(stringQuery,function (error,rows) {
	// 	if (!!error) {console.log(error);}
	// 	console.log(rows)
	// })

	var dataSend = [];
	new Promise((resolve,reject)=>{
		var stringQueryGuildInfo = "SELECT * FROM `guild_info` WHERE `Guild_ID`='13'"
		db_all_guild.query(stringQueryGuildInfo,function (error,rows) {
			if (rows[0]!=null) {dataSend.push(rows[0]);}
			else{
				dataSend.push(null);
			}
			resolve();
		})
	}).then(()=>{
		return new Promise((resolve,reject)=>{
			var stringQueryGuildMember = "SELECT * FROM `13`"
			db_all_guild.query(stringQueryGuildMember,function (error,rows) {
				if (rows[0]!=null) {dataSend.push(rows[0]);}
				else{
					dataSend.push(null);
				}
				resolve();
			})
		})
	}).then(()=>{
		console.log(dataSend)
		// socket.emit("S_GET_GUILD_INFO",{S_GET_GUILD_INFO:dataSend})
	})
}


// var stringT = 2;
// var DictTimeOutUnFriend={};
// var Promise = require('promise')

// test (unitT,returnPosArraya)
// function test (unit,returnPosArray) {
// 	var ID_User = 42
// 	var tempListUnitInPos=[];
// 	var arrayUnit,arrayUnitInPos = [];
// 	client.hmget("s1_pos",returnPosArray,function (error,rows){
// 		if (rows!=null) {
// 			// console.log('rows')
// 			// console.log(rows.length)
// 			for (var i = 0; i < rows.length; i++) {
// 				arrayUnit = rows[i].split("/").filter(String);
// 				if (arrayUnit.length>1) {
// 					for (var j = 0; j < arrayUnit.length; j++) {
// 						if (arrayUnit[j].split("_")[2]!=ID_User) {
// 							tempListUnitInPos.push(arrayUnit[j])
// 						}						
// 					}
// 				}else {
// 					if (arrayUnit[0].split("_")[2]!=ID_User) {
// 							tempListUnitInPos.push(arrayUnit[0])
// 						}

// 				}		

// 			}
// 			console.log(tempListUnitInPos)
// 		}	
// 	})

// }
// [ '1_16_43_952', '1_16_43_952', '1_16_43_952', '1_16_43_952' ]