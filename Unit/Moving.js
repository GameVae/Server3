'use strict';

// var db_all_user		= require('./../Util/Database/Db_all_user.js');
var db_position		= require('./../Util/Database/Db_position.js');
var moveUnit 		= require('./../Redis/Move/Move.js');


var functions 		= require('./../Util/Functions.js');

var DetailError,LogChange;
var currentTime;
var stringKeyMove;

var redis 				= require("redis"),
client 					= redis.createClient();
client.select(functions.RedisData.TestUnit);

var Promise = require('promise');

var moveUnit_Attack = require('./Moving_Attack.js');

// console.log(dataMove.S_MOVE.Server_ID)

exports.Start = function start (io) {
	io.on('connection', function(socket){
		socket.on('S_MOVE', function (data){
			// socket.broadcast.emit('R_MOVE',{R_MOVE:data});			
			stringKeyMove = "s"+data.S_MOVE.Server_ID+"_move";
			// console.log(stringKeyMove,data)
			client.set(stringKeyMove,JSON.stringify(data.S_MOVE));		
			R_MOVE (io,socket,data.S_MOVE.ID_User,data.S_MOVE.Server_ID);	
			S_MOVE (io,socket,data.S_MOVE);

			// moveUnit_Attack.MOVE_ATTACK(io,data.S_MOVE);
		});
	});
}



function R_MOVE (io,socket,ID_User,Server_ID) {
	var stringHSocket = "s"+Server_ID+"_socket";
	client.hgetall(stringHSocket,function (error,rows) {
		if (rows!=undefined) {
			var result = rows;
			// delete result[ID_User];
			if (Object.values(result).length>0) {
				for (var i = 0; i < Object.values(result).length; i++) {						
					sendToClient (io,Object.values(result)[i])
				}
			}
		}		
	});
}

function sendToClient (io,socketID) {
	client.get(stringKeyMove,function (error,rowData) {
		io.to(socketID).emit('R_MOVE',{R_MOVE:JSON.parse(rowData)});
	})
}

function S_MOVE (io,socket,data) {
	// console.log(functions.GetTime());
	// console.log(data);
	currentTime = functions.GetTime();
	data.TimeMoveNextCell = functions.ImportTimeToDatabase(new Date(currentTime + data.TimeMoveNextCell).toISOString());
	data.TimeFinishMove = functions.ImportTimeToDatabase(new Date(currentTime + data.TimeFinishMove).toISOString());
	var ListMove = data.ListMove;
	for (var i = 0; i < ListMove.length; i++) {
		ListMove[i].TimeMoveNextCell = functions.ImportTimeToDatabase(new Date(currentTime + ListMove[i].TimeMoveNextCell).toISOString());
		// ListMove[i].TimeMoveNextCell = calc;
		//console.log(ListMove[i].TimeMoveNextCell)
	}
	// console.log(data);
	moveUnit.MoveCalc (io,socket,data);
	updateDataBase (data);
}

function updateDataBase (data) {
	var stringUpdate;
	var stringQuery = "SELECT * FROM `s"+data.Server_ID+"_unit` WHERE `ID`='"+data.ID+"'";
	db_position.query(stringQuery,function (error,rows) {
		if (!!error){DetailError = ('Unit_Moving.js: query '+stringQuery); functions.WriteLogError(DetailError,2);}
		// console.log("Attack_Unit_ID_Moving: "+rows[0].Attack_Unit_ID)
		if (rows[0]!=undefined) {
			if (rows[0].Attack_Unit_ID!=null) {
				updateRedisAttack (data.Server_ID,rows[0].Attack_Unit_ID,rows[0]);
			}
			if (data.Attack_Unit_ID=="NULL") {
				stringUpdate = "UPDATE `s"+data.Server_ID+"_unit` SET "
				+"`Position_Cell`='"+data.Position_Cell+"',"
				+"`Next_Cell`='"+data.Next_Cell+"',"
				+"`End_Cell`='"+data.End_Cell+"',"
				+"`TimeMoveNextCell`='"+data.TimeMoveNextCell+"',"
				+"`TimeFinishMove`='"+data.TimeFinishMove+"',"
				+"`ListMove`='"+ JSON.stringify(data.ListMove) +"',"
				+"`Attack_Unit_ID`= NULL,"
				+"`Status`='"+functions.UnitStatus.Move+
				"' WHERE `ID`='"+data.ID+"'";
			}else{
				stringUpdate = "UPDATE `s"+data.Server_ID+"_unit` SET "
				+"`Position_Cell`='"+data.Position_Cell+"',"
				+"`Next_Cell`='"+data.Next_Cell+"',"
				+"`End_Cell`='"+data.End_Cell+"',"
				+"`TimeMoveNextCell`='"+data.TimeMoveNextCell+"',"
				+"`TimeFinishMove`='"+data.TimeFinishMove+"',"
				+"`ListMove`='"+ JSON.stringify(data.ListMove) +"',"
				+"`Attack_Unit_ID`='"+ data.Attack_Unit_ID +"',"
				+"`Status`='"+functions.UnitStatus.Move+
				"' WHERE `ID`='"+data.ID+"'";
			}
			

			db_position.query(stringUpdate,function (error,result) {
				if (!!error){DetailError = ('Unit_Moving.js: query '+stringUpdate); functions.WriteLogError(DetailError,2);}
				LogChange='Unit_Moving.js: updateDataBase: '+stringUpdate;functions.LogChange(LogChange,2);
				
				var stringQuery = "SELECT * FROM `s"+data.Server_ID+"_unit` WHERE `ID`='"+data.ID+"'";
				db_position.query(stringQuery,function (error,rowsUpdate) {
					updateRedisData (data,rowsUpdate[0]);
				});
			});	
		}


	});
}
function updateRedisData (data,rowsData) {
	var stringHkey ="s"+data.Server_ID+"_unit";
	var stringKey = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;
	client.hset(stringHkey,stringKey,JSON.stringify(rowsData))
	// client.hexists(stringHkey,stringKey,function (error,rowBool) {
	// 	if (rowBool==1) {
	// 		client.hset(stringHkey,stringKey,JSON.stringify(rowsData))
	// 	}
	// })
	
}

function updateRedisAttack (Server_ID,ID_Defend,dataAttack) {
	var dataDefend ={};
	var ID_Attack = Server_ID+"_"+dataAttack.ID_Unit+"_"+dataAttack.ID_User+"_"+dataAttack.ID;
	// var ID_Attack = dataAttack.Attack_Unit_ID;
	var stringHAttack = "s"+Server_ID+"_attack";
	var stringKeyDefend = ID_Defend;
	// var stringKeyDefend = Server_ID+"_"+dataDefend.ID_Unit+"_"+dataDefend.ID_User+"_"+ID_Defend;
	client.hget(stringHAttack,stringKeyDefend,function (error,rows) {
		if (rows!=null) {
			var resultAttack = rows.split("/").filter(String);
			if (resultAttack.includes(ID_Attack)) {
				removeValue (stringHAttack,stringKeyDefend,rows,ID_Attack);
			}
		}				
	});
}

function removeValue (stringHkey,stringKey,rows,ID_Key) {
	var stringReplace = rows.replace(ID_Key+"/","");

	client.hset(stringHkey,stringKey,stringReplace);
	if (stringReplace.length==0) {
		client.hdel(stringHkey,stringKey);
	}
}


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