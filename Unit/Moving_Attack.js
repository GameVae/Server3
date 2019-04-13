'use strict';

// var db_all_user		= require('./../Util/Database/Db_all_user.js');
var db_position				= require('./../Util/Database/Db_position.js');

var functions 				= require('./../Util/Functions.js');

var guildData				= require('./../Redis/Guild/GuildData.js');
var friendData				= require('./../Redis/Friend/FriendData.js');

var attackFunc 				= require('./../Redis/Attack/Attack.js');

var DetailError,LogChange;
var currentTime;
var stringKeyMove;

var redis 				= require("redis"),
client 					= redis.createClient();
client.select(functions.RedisData.TestUnit);

var Promise = require('promise');

var stringUnitMoving;
var DictTimeMoveAttack ={};



exports.Start = function start (io) {
	io.on('connection', function(socket){
		socket.on('S_MOVE', function (data){			
			// S_MOVE (io,socket,data.S_MOVE);		
			S_MOVE_ATT (data.S_MOVE);		
		});
	});
}

var S_MOVE_data = { Server_ID: 1,
	ID: 21,
	ID_Unit: 16,
	ID_User: 43,
	Position_Cell: '296,0,0',
	Next_Cell: '297,1,0',
	End_Cell: '304,3,0',
	TimeMoveNextCell: '2019-04-05T06:58:02.166',
	TimeFinishMove: '2019-04-05T06:58:24.014',
	ListMove:
	[ { Position_Cell: '297,1,0',
	Next_Cell: '297,2,0',
	TimeMoveNextCell: '2019-04-05T06:58:04.690' },
	{ Position_Cell: '297,2,0',
	Next_Cell: '298,3,0',
	TimeMoveNextCell: '2019-04-05T06:58:07.214' },
	{ Position_Cell: '298,3,0',
	Next_Cell: '299,3,0',
	TimeMoveNextCell: '2019-04-05T06:58:10.014' },
	{ Position_Cell: '299,3,0',
	Next_Cell: '300,3,0',
	TimeMoveNextCell: '2019-04-05T06:58:12.814' },
	{ Position_Cell: '300,3,0',
	Next_Cell: '301,3,0',
	TimeMoveNextCell: '2019-04-05T06:58:15.614' },
	{ Position_Cell: '301,3,0',
	Next_Cell: '302,3,0',
	TimeMoveNextCell: '2019-04-05T06:58:18.414' },
	{ Position_Cell: '302,3,0',
	Next_Cell: '303,3,0',
	TimeMoveNextCell: '2019-04-05T06:58:21.214' },
	{ Position_Cell: '303,3,0',
	Next_Cell: '304,3,0',
	TimeMoveNextCell: '2019-04-05T06:58:24.014' } ] }
//
// S_MOVE (S_MOVE_data)

function S_MOVE_ATT (data) {
	// console.log(data);
	//checkCurrentPosition (data,data.Position_Cell);

	// stringUnitMoving = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;
	// clearMoveTimeout (stringUnitMoving);
	checkTimeMoveAttack (data)

}

function checkTimeMoveAttack (data) {
	//check theo timemovenextcell/2
	// console.log(data)

	var timeMove = 0;
	var stringPos = data.Position_Cell;
	stringUnitMoving = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;

	if (data.TimeMoveNextCell!=null) {
		data.TimeMoveNextCell = functions.ExportTimeDatabase(data.TimeMoveNextCell) - functions.GetTime();
		var Position_Cell_X = data.Position_Cell.split(',')[0];
		var Position_Cell_Y = data.Position_Cell.split(',')[1];
		var Next_Cell_X = data.Next_Cell.split(',')[0];
		var Next_Cell_Y = data.Next_Cell.split(',')[1];
		var caseReturn = 1;
		var timeCheck = 0;

		if (Position_Cell_X!=Next_Cell_X&&Position_Cell_Y!=Next_Cell_Y) {caseReturn = 2};
		switch (caseReturn) {
			case 1:
			timeCheck = functions.TimeMove.Straight*0.5;
			break;
			case 2:
			timeCheck = functions.TimeMove.Diagonal*0.5;
			break;
		}
		if (data.TimeMoveNextCell>timeCheck) {
			timeMove = data.TimeMoveNextCell - timeCheck;
			// timeMove = data.TimeMoveNextCell + 100;
			stringPos = data.Next_Cell;
		}else{
			timeMove = data.TimeMoveNextCell
			checkCurrentPosition (data,data.Position_Cell);
		}
		console.log(timeMove)
		DictTimeMoveAttack[stringUnitMoving] = setTimeout(function (data,stringPos) {
			//lay thong tin data?
			var stringHUnit = "s"+data.Server_ID+"_unit";
			client.hget(stringHUnit,stringUnitMoving,function (error,rows) {
				// var resultData = JSON.parse(rows)
				var resultData = convertTimeMove (JSON.parse(rows))

				checkTimeMoveAttack (resultData)
				checkCurrentPosition (resultData,stringPos);
			});
		}, timeMove,data,stringPos);
	}else{
		checkCurrentPosition (data,stringPos);
		clearMoveTimeout (stringPos);
	}	
}
// convertTimeMove (S_MOVE_data)
function convertTimeMove (data) {
	var returnData=data;
	currentTime = functions.GetTime();
	if (returnData.TimeMoveNextCell!=null) {
		returnData.TimeMoveNextCell = functions.ExportTimeDatabase(returnData.TimeMoveNextCell) - currentTime;
	}
	if (returnData.TimeFinishMove!=null) {
		returnData.TimeFinishMove = functions.ExportTimeDatabase(returnData.TimeFinishMove) - currentTime;
	}
	var ListMove = returnData.ListMove;

	if (ListMove!=null) {
		for (var i = 0; i < ListMove.length; i++) {
			ListMove[i].TimeMoveNextCell = functions.ExportTimeDatabase(ListMove[i].TimeMoveNextCell) - currentTime;
		}
	}

	// console.log(returnData)

	return returnData;
}
function clearMoveTimeout (stringData) {
	clearTimeout(DictTimeMoveAttack[stringData]);
	delete DictTimeMoveAttack[stringData];
}

// function setTimeInterval (data) {
// 	DictTimeMoveAttack[stringKey] = setTimeout(function (data,stringPos) {
// 		checkCurrentPosition (data,stringPos);
// 	}, timeMove,data,stringPos)

// }
// function checkPostionAttackUnit (data,stringPos) {
// 	//attackFunc
// 	var stringHPos = "s"+data.Server_ID+"_pos";
// 	client.hexists(stringHPos,stringPos,function (error,rows) {
// 		var ID_Defend = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;
// 		if (rows==1) {
// 			client.hget(stringHkey,stringPos,function (error,rowsPos){
// 				if (!!error){DetailError = ('Move_Attack.js: checkPostionAttackUnit: '+stringPos); functions.WriteLogError(DetailError,2);}	
// 				var unitResult = rowsPos.split("/").filter(String);
// 				for (var i = 0; i < unitResult.length; i++) {
// 					if (unitResult[i].split("_")[2]!=data.ID_User) {
// 						getAttackData (data,unitResult[i]);
// 					}			
// 				}
// 			});
// 		}		
// 	});
// }

function checkCurrentPosition (data,pos) {
	var stringHPos = "s"+data.Server_ID+"_pos";
	// var stringHUnit = "s"+data.Server_ID+"_unit";
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
	if (data.ID_User!=ID_Player.split("_")[2]) {
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
			attackFunc.AttackInterval(data.Server_ID,ID_Defend);
		}))
		)
		)
	}
	
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