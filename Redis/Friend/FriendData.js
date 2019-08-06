'use strict';
var db_all_friend				= require('./../../Util/Database/Db_all_friend.js');
var functions 					= require('./../../Util/Functions.js');

var redis = require("redis"),
client = redis.createClient();
client.select(functions.RedisData.TestUnit);

exports.GetFriendData = function () {
	// var stringHkey = "all_friends";
	// var queryStringFriend = "SELECT * FROM `"+TABLE_NAME+"`";
	// // console.log(queryString)
	// db_all_friend.query(queryStringFriend, function (error,rows) {
	// 	// console.log(rows)
	// 	for (var i = 0; i < rows.length; i++) {		
	// 		checkValue (stringHkey,TABLE_NAME,rows[i].ID_Player)
	// 	}	
	// });
	var queryStringTable = "SELECT `TABLE_NAME` FROM information_schema.tables WHERE `TABLE_SCHEMA`='all_friends' AND `TABLE_NAME`<>'friends'"
	db_all_friend.query(queryStringTable,function (error,rows) {
		if (!!error) {console.log(error);}
		for (var i = 0; i < rows.length; i++) {
			setDataBase (rows[i].TABLE_NAME);
		}
	})
}
// getFriendData ()
// function getFriendData () {
// 	var queryStringTable = "SELECT `TABLE_NAME` FROM information_schema.tables WHERE `TABLE_SCHEMA`='all_friends' AND `TABLE_NAME`<>'friends'"
// 	db_all_friend.query(queryStringTable,function (error,rows) {
// 		if (!!error) {console.log(error);}
// 		for (var i = 0; i < rows.length; i++) {
// 			setDataBase (rows[i].TABLE_NAME);
// 		}
// 	})
// }
exports.SetFriendData = function (TABLE_NAME) {
	setDataBase (TABLE_NAME);
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
	client.hget(stringHkey,stringKey,function (error,rows) {
		if (rows!=null) {
			var result = rows.split("/").filter(String);
			if (!result.includes(ID_Key)) {
				addValue (stringHkey,stringKey,rows,ID_Key);
			}
		}else{
			addValue (stringHkey,stringKey,"",ID_Key);
			
		}
	})
}

function addValue (stringHkey,stringKey,data,ID_Key) {
	client.hset(stringHkey,stringKey,data+ID_Key+"/");
}

exports.CheckValueFriend = function checkValueFriend (stringKey,ID_Key) {
	var stringHkey = "all_friends"
	checkValue(stringHkey,stringKey,ID_Key)
}

exports.RemoveValueFriend = function removeValueFriend (stringKey,ID_Key) {
	var stringHkey = "all_friends";
	removeValue (stringHkey,stringKey,ID_Key);
}

function removeValue (stringHkey,stringKey,ID_Key) {
	functions.ShowLog(functions.ShowLogBool.Check,'FriendData.js removeValue stringHkey,stringKey,ID_Key',[stringHkey,stringKey,ID_Key]);
	client.hget(stringHkey,stringKey,function (error,rows) {
		var result = rows.split("/").filter(String);
		if (result.includes(ID_Key)) {
			var stringReplace = rows.replace(ID_Key+"/","");
			client.hset(stringHkey,stringKey,stringReplace);
			if (stringReplace.length==0) {
				client.hdel(stringHkey,stringKey);
			}
		}
	});
}

exports.CheckFriendData = function checkFriendData2 (ID_User,ID_Player,returnBool) {
	checkFriendData (ID_User,ID_Player,returnBool)	
}

function checkFriendData (ID_User,ID_Player,returnBool) {
	var checkBool = false;
	var stringHkey = "all_friends";
	client.hget(stringHkey,ID_User,function (error,rows) {
		if (rows!=null) {
			var result = rows.split("/").filter(String);
			if (result.includes(ID_Player)) {checkBool = true;}
		}
		returnBool(checkBool);
	});
	// client.hexists(stringHkey,ID_User,function (error,resultBool) {
	// 	if (resultBool==1) {
	// 		client.hget(stringHkey,ID_User,function (error,rows) {
	// 			var result = rows.split("/");
	// 			if (result.includes(ID_Player)) {checkBool = true;}
	// 			returnBool(checkBool);
	// 		});
	// 	}else{
	// 		returnBool(checkBool);
	// 	}
	// }); 
}
exports.CheckListFriendData = function (List_ID_User,ID_Player,returnListUnit) {
	var stringHkey = "all_friends";
	var listBoolFriend = [];
	var listIDUnitAttack = [];
	var listUnitAttack = [];
	// console.log('FriendData.js checkListFriendData')
	// console.log(List_ID_User,ID_Player)

	for (var i = 0; i < List_ID_User.length; i++) {
		var unitId = List_ID_User[i].split("_")[2];
		listIDUnitAttack.push(unitId);
	}

	client.hmget(stringHkey,listIDUnitAttack,function (error,rows) {			
		if (rows!=null) {
			for (var i = 0; i < rows.length; i++) {
				if (rows[i]!=null) {
					var result = rows[i].split("/").filter(String);
					if (!result.includes(ID_Player)) {
						listUnitAttack.push(List_ID_User[i]);
					}
				}else{
					listUnitAttack.push(List_ID_User[i]);
				}				
			}			
		}
		if (rows==null){
			listUnitAttack = List_ID_User;
		}
		// console.log('listUnitAttack')
		// console.log(listUnitAttack)
		returnListUnit(listUnitAttack);
	});
}


// exports.CheckListFriendData = function checkListFriendData2 (List_ID_User,ID_Player,returnListUnit) {
// 	checkListFriendData (List_ID_User,ID_Player,function (returnList) {
// 		console.log('FriendData.js returnList')
// 		console.log(returnList)
// 		returnListUnit(returnList);
// 	})
// }
// // var list_ID_User = [12,3]
// function checkListFriendData (List_ID_Unit_User,ID_Player,returnListUnit) {
// 	// var checkBool = false;
// 	var stringHkey = "all_friends";
// 	var listBoolFriend = [];
// 	var listIDUnitAttack = [];
// 	var listUnitAttack = [];
// 	console.log('FriendData.js checkListFriendData')
// 	console.log(List_ID_Unit_User,ID_Player)

// 	for (var i = 0; i < List_ID_Unit_User.length; i++) {
// 		var unitId = List_ID_Unit_User.split("_")[2];
// 		listIDUnitAttack.push(unitId);
// 	}

// 	client.hmget(stringHkey,listIDUnitAttack,function (error,rows) {		
// 		console.log('rows')
// 		console.log(rows)
// 		if (rows!=null) {
// 			for (var i = 0; i < rows.length; i++) {
// 				if (rows[i]!=null) {
// 					var result = rows[i].split("/").filter(String);
// 					if (!result.includes(ID_Player)) {
// 						listUnitAttack.push(List_ID_Unit_User[i]);
// 					}
// 				}else{
// 					listUnitAttack.push(List_ID_Unit_User[i]);
// 				}				
// 			}			
// 		}else{
// 			listUnitAttack = List_ID_Unit_User;
// 		}
// 		if (rows==undefined){
// 			listUnitAttack = List_ID_Unit_User;
// 		}
// 		console.log('listUnitAttack')
// 		console.log(listUnitAttack)
// 		returnListUnit(listUnitAttack);
// 	});

// }