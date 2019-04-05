'use strict';

// var db_all_user		= require('./../Util/Database/Db_all_user.js');
var db_position				= require('./../Util/Database/Db_position.js');

var functions 				= require('./../Util/Functions.js');

var guildData				= require('./../Redis/Guild/GuildData.js');
var friendData				= require('./../Redis/Friend/FriendData.js');

var attackFunc 				= require('./../Redis/Attack/Attack.js');

var DetailError;
var currentTime;
var stringKeyMove;

var redis 				= require("redis"),
client 					= redis.createClient();
client.select(functions.RedisData.TestUnit);

var Promise = require('promise');

exports.Start = function start (io) {
	io.on('connection', function(socket){
		socket.on('S_MOVE', function (data){			
			S_MOVE (io,socket,data.S_MOVE);			
		});
	});
}

var S_MOVE_data = {"Server_ID":1,"ID":13,"ID_Unit":16,"ID_User":52,"Position_Cell":"11,12,0","Next_Cell":"10,11,0","End_Cell":"10,9,0","TimeMoveNextCell":1262,"TimeFinishMove":3786,"ListMove":[{"CurrentCell":"10,11,0","NextCell":"10,10,0","TimeMoveNextCell":1262}]}
S_MOVE (S_MOVE_data)

function S_MOVE (data) {
	// console.log(data);
	//checkCurrentPosition (data,data.Position_Cell);
	setTimerMoveAttack (data)
}

function setTimerMoveAttack (data) {
	//check theo timemovenextcell/2
	
	if (true) {}
}
function checkCurrentPosition (data,pos) {
	var stringHPos = "s"+data.Server_ID+"_pos";
	var stringHUnit = "s"+data.Server_ID+"_unit";
	// var pos = data.Position_Cell;

	client.hexists(stringHPos,pos,function (error,resultPos) {
		if (resultPos==1) {
			client.hget(stringHPos,pos,function (error,rows) {
				var unitResult = rows.split("/").filter(String);
				for (var i = 0; i < unitResult.length; i++) {
					var Attack_ID = unitResult[i].split("_")[2]
					if (Attack_ID!=data.ID_User) {
						// console.log(Attack_ID,data.ID_User)
						getAttackData (data,unitResult[i]);
					}
					// result[i]
				}
				// console.log(result);
			})
		}
	});
}

function getAttackData (data,ID_Player) {
	// console.log(data,ID_Player)
	var checkBoolFriendData = false;
	var checkBoolGuildData = false;
	var ID_Defend;
	new Promise((resolve,reject)=>{
		friendData.CheckFriendData (data.ID_User,ID_Player.split("_")[2],function (returnBool) {
			checkBoolFriendData =returnBool;
			resolve();
		})
	}).then(()=>new Promise((resolve,reject)=>{
		guildData.CheckSameGuildID (data.ID_User,ID_Player.split("_")[2],function (returnBool) {
			checkBoolGuildData = returnBool;
			resolve();
		})						
	}).then(()=>new Promise((resolve,reject)=>{
		// console.log(checkBoolFriendData,checkBoolGuildData)
		if (checkBoolFriendData==false&&checkBoolGuildData==false) {
			ID_Defend = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;
			// console.log(ID_Player);
			attackFunc.SetAttackData(data.Server_ID,ID_Defend,ID_Player);
			resolve();
		}
	}).then(()=>new Promise((resolve,reject)=>{
		// console.log(ID_Defend);
		// attackFunc.AttackInterval(data.Server_ID,ID_Defend);
	}))
	)
	)
}
// function updateDataBase (data) {
// 	var stringUpdate;
// 	var stringQuery = "SELECT * FROM `s"+data.Server_ID+"_unit` WHERE `ID`='"+data.ID+"'";
// 	db_position.query(stringQuery,function (error,rows) {
// 		if (rows[0].Attack_Unit_ID!=null) {

// 			updateRedisAttack (data.Server_ID,rows[0].Attack_Unit_ID,rows[0])

// 			stringUpdate = "UPDATE `s"+data.Server_ID+"_unit` SET "
// 			+"`Position_Cell`='"+data.Position_Cell+"',"
// 			+"`Next_Cell`='"+data.Next_Cell+"',"
// 			+"`End_Cell`='"+data.End_Cell+"',"
// 			+"`TimeMoveNextCell`='"+data.TimeMoveNextCell+"',"
// 			+"`TimeFinishMove`='"+data.TimeFinishMove+"',"
// 			+"`ListMove`='"+ JSON.stringify(data.ListMove) +"',"
// 			+"`Status`='"+functions.UnitStatus.Move+
// 			+"`Attack_Unit_ID`= NULL"+
// 			" WHERE `ID`='"+data.ID+"'";

// 		}else {
// 			stringUpdate = "UPDATE `s"+data.Server_ID+"_unit` SET "
// 			+"`Position_Cell`='"+data.Position_Cell+"',"
// 			+"`Next_Cell`='"+data.Next_Cell+"',"
// 			+"`End_Cell`='"+data.End_Cell+"',"
// 			+"`TimeMoveNextCell`='"+data.TimeMoveNextCell+"',"
// 			+"`TimeFinishMove`='"+data.TimeFinishMove+"',"
// 			+"`ListMove`='"+ JSON.stringify(data.ListMove) +"',"
// 			+"`Status`='"+functions.UnitStatus.Move+
// 			"' WHERE `ID`='"+data.ID+"'";
// 		}

// 		db_position.query(stringUpdate,function (error,result) {
// 			if (!!error) {console.log(error);}
// 			var stringQuery = "SELECT * FROM `s"+data.Server_ID+"_unit` WHERE `ID`='"+data.ID+"'";
// 			db_position.query(stringQuery,function (error,rowsUpdate) {
// 				updateRedisData (data,rowsUpdate[0]);
// 			});
// 		});

// 	});
// }

// function updateRedisAttack (Server_ID,ID_Defend,dataAttack) {
// 	var dataDefend ={};
// 	var ID_Attack = Server_ID+"_"+dataAttack.ID_Unit+"_"+dataAttack.ID_User+"_"+dataAttack.ID;
// 	new Promise((resolve,reject)=>{
// 		var stringQuery = "SELECT `ID_Unit`,`ID_User` FROM `s"+Server_ID+"_unit` WHERE `ID` ='"+ID_Defend+"'";
// 		db_position.query(stringQuery,function (error,rows) {
// 			dataDefend = rows[0];
// 		});
// 	}).then(()=>new Promise((resolve,reject)=>{
// 		var stringHAttack = "s"+Server_ID+"_attack";
// 		var stringKeyDefend = Server_ID+"_"+dataDefend.ID_Unit+"_"+dataDefend.ID_User+"_"+ID_Defend;
// 		client.hexists(stringHAttack,stringKeyDefend,function (error,result) {
// 			if (result==1) {
// 				client.hget(stringHAttack,stringKeyDefend,function (error,rows) {
// 					var resultAttack = JSON.parse(rows).split("/").filter(String);
// 					if (resultAttack.includes(ID_Attack)) {
// 						removeValue (stringHAttack,stringKeyDefend,rows,ID_Attack);
// 					}
// 				});
// 			}
// 		})
// 	}));
// }

// function removeValue (stringHkey,stringKey,rows,ID_Key) {
// 	var stringReplace = rows.replace(ID_Key+"/","");
// 	client.hset(stringHkey,stringKey,stringReplace);
// 	if (stringReplace.length==0) {
// 		client.hdel(stringHkey,stringKey);
// 	}
// }

// function updateRedisData (data,rowsData) {
// 	var stringHkey ="s"+data.Server_ID+"_unit";
// 	var stringKey = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;
// 	client.hset(stringHkey,stringKey,JSON.stringify(rowsData))
// }


// checkAttackData (S_MOVE_data);
// function checkAttackData (data) {
// 	console.log(data)
// 	// stringHAttack
// 	// client.hexists()
// }
// function updateDataBase (data) {

// 	var stringUpdate = "UPDATE `s"+data.Server_ID+"_unit` SET "
// 	+"`Position_Cell`='"+data.Position_Cell+"',"
// 	+"`Next_Cell`='"+data.Next_Cell+"',"
// 	+"`End_Cell`='"+data.End_Cell+"',"
// 	+"`TimeMoveNextCell`='"+data.TimeMoveNextCell+"',"
// 	+"`TimeFinishMove`='"+data.TimeFinishMove+"',"
// 	+"`ListMove`='"+ JSON.stringify(data.ListMove) +"',"
// 	+"`Status`='"+functions.UnitStatus.Move+
// 	"' WHERE `ID`='"+data.ID+"'";

// 	db_position.query(stringUpdate,function (error,result) {
// 		if (!!error) {console.log(error);}
// 		var stringQuery = "SELECT * FROM `s"+data.Server_ID+"_unit` WHERE `ID`='"+data.ID+"'";
// 		db_position.query(stringQuery,function (error,rows) {
// 			updateRedisData (data,rows[0]);
// 		});
// 	});

// }

