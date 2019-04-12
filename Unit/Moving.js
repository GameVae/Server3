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

// var dataMove =  { S_MOVE:
//    { Server_ID: 1,
//      ID: 16,
//      ID_Unit: 16,
//      ID_User: 42,
//      Position_Cell: '4,4,0',
//      Next_Cell: '5,3,0',
//      End_Cell: '8,3,0',
//      TimeMoveNextCell: 2524,
//      TimeFinishMove: 10924,
//      ListMove: [ [Object], [Object], [Object] ] } }
// //
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
		if (rows[0].Attack_Unit_ID!=null) {
			updateRedisAttack (data.Server_ID,rows[0].Attack_Unit_ID,rows[0]);
		}
		
		// if (rows[0].Attack_Unit_ID!=null) {
		// 	// console.log(data,rows[0].Attack_Unit_ID,rows[0])
		// 	updateRedisAttack (data.Server_ID,rows[0].Attack_Unit_ID,rows[0]);

		// 	stringUpdate = "UPDATE `s"+data.Server_ID+"_unit` SET "
		// 	+"`Position_Cell`='"+data.Position_Cell+"',"
		// 	+"`Next_Cell`='"+data.Next_Cell+"',"
		// 	+"`End_Cell`='"+data.End_Cell+"',"
		// 	+"`TimeMoveNextCell`='"+data.TimeMoveNextCell+"',"
		// 	+"`TimeFinishMove`='"+data.TimeFinishMove+"',"
		// 	+"`ListMove`='"+ JSON.stringify(data.ListMove) +"',"
		// 	+"`Status`='"+functions.UnitStatus.Move+"',"
		// 	+"`Attack_Unit_ID`= NULL"+
		// 	" WHERE `ID`='"+data.ID+"'";

		// }else {
		// 	stringUpdate = "UPDATE `s"+data.Server_ID+"_unit` SET "
		// 	+"`Position_Cell`='"+data.Position_Cell+"',"
		// 	+"`Next_Cell`='"+data.Next_Cell+"',"
		// 	+"`End_Cell`='"+data.End_Cell+"',"
		// 	+"`TimeMoveNextCell`='"+data.TimeMoveNextCell+"',"
		// 	+"`TimeFinishMove`='"+data.TimeFinishMove+"',"
		// 	+"`ListMove`='"+ JSON.stringify(data.ListMove) +"',"
		// 	+"`Status`='"+functions.UnitStatus.Move+
		// 	"' WHERE `ID`='"+data.ID+"'";
		// }

		stringUpdate = "UPDATE `s"+data.Server_ID+"_unit` SET "
		+"`Position_Cell`='"+data.Position_Cell+"',"
		+"`Next_Cell`='"+data.Next_Cell+"',"
		+"`End_Cell`='"+data.End_Cell+"',"
		+"`TimeMoveNextCell`='"+data.TimeMoveNextCell+"',"
		+"`TimeFinishMove`='"+data.TimeFinishMove+"',"
		+"`ListMove`='"+ JSON.stringify(data.ListMove) +"',"
		+"`Status`='"+functions.UnitStatus.Move+
		"' WHERE `ID`='"+data.ID+"'";
		console.log(stringUpdate);

		db_position.query(stringUpdate,function (error,result) {
			if (!!error){DetailError = ('Unit_Moving.js: query '+stringUpdate); functions.WriteLogError(DetailError,2);}
			LogChange='Unit_Moving.js: updateDataBase: '+stringUpdate;functions.LogChange(LogChange,2);
			
			var stringQuery = "SELECT * FROM `s"+data.Server_ID+"_unit` WHERE `ID`='"+data.ID+"'";
			db_position.query(stringQuery,function (error,rowsUpdate) {
				updateRedisData (data,rowsUpdate[0]);
			});
		});

	});
}

// var rowData ={
//   ID: 16,
//   ID_Unit: 16,
//   ID_User: 42,
//   BaseNumber: 1,
//   Level: 2,
//   Quality: 1,
//   Hea_cur: 5.45,
//   Health: 5.45,
//   Attack: 2.3,
//   Defend: 1.15,
//   Position_Cell: '12,8,0',
//   Next_Cell: null,
//   End_Cell: null,
//   TimeMoveNextCell: null,
//   TimeFinishMove: null,
//   ListMove: null,
//   Status: 2,
//   Attack_Base_ID: null,
//   Attack_Unit_ID: 12,
//   AttackedBool: 0 }
// updateRedisAttack (1,12,rowData);

function updateRedisAttack (Server_ID,ID_Defend,dataAttack) {
	var dataDefend ={};
	var ID_Attack = Server_ID+"_"+dataAttack.ID_Unit+"_"+dataAttack.ID_User+"_"+dataAttack.ID;
	// var ID_Attack = dataAttack.Attack_Unit_ID;
	var stringHAttack = "s"+Server_ID+"_attack";
	var stringKeyDefend = ID_Defend;
	// var stringKeyDefend = Server_ID+"_"+dataDefend.ID_Unit+"_"+dataDefend.ID_User+"_"+ID_Defend;

	client.hexists(stringHAttack,stringKeyDefend,function (error,result) {
		if (result==1) {
			client.hget(stringHAttack,stringKeyDefend,function (error,rows) {
				var resultAttack = rows.split("/").filter(String);
				if (resultAttack.includes(ID_Attack)) {
					removeValue (stringHAttack,stringKeyDefend,rows,ID_Attack);
				}
				resolve();
			});
		}
	})

	// new Promise((resolve,reject)=>{
	// 	var stringQuery = "SELECT `ID_Unit`,`ID_User` FROM `s"+Server_ID+"_unit` WHERE `ID` ='"+ID_Defend+"'";
	// 	db_position.query(stringQuery,function (error,rows) {
			
	// 		dataDefend = rows[0];
	// 		resolve();
	// 	});
	// }).then(()=>new Promise((resolve,reject)=>{
		
	// 	var stringHAttack = "s"+Server_ID+"_attack";
	// 	var stringKeyDefend = Server_ID+"_"+dataDefend.ID_Unit+"_"+dataDefend.ID_User+"_"+ID_Defend;
	// 	client.hexists(stringHAttack,stringKeyDefend,function (error,result) {
	// 		if (result==1) {
	// 			client.hget(stringHAttack,stringKeyDefend,function (error,rows) {
	// 				var resultAttack = rows.split("/").filter(String);
	// 				if (resultAttack.includes(ID_Attack)) {
	// 					removeValue (stringHAttack,stringKeyDefend,rows,ID_Attack);
	// 				}
	// 				resolve();
	// 			});
	// 		}
	// 	})
	// }));

}

function removeValue (stringHkey,stringKey,rows,ID_Key) {
	var stringReplace = rows.replace(ID_Key+"/","");

	client.hset(stringHkey,stringKey,stringReplace);
	if (stringReplace.length==0) {
		client.hdel(stringHkey,stringKey);
	}
}

function updateRedisData (data,rowsData) {
	var stringHkey ="s"+data.Server_ID+"_unit";
	var stringKey = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;
	client.hset(stringHkey,stringKey,JSON.stringify(rowsData))
}

var S_MOVE_data = {"Server_ID":1,"ID":13,"ID_Unit":16,"ID_User":52,"Position_Cell":"11,12,0","Next_Cell":"10,11,0","End_Cell":"10,9,0","TimeMoveNextCell":1262,"TimeFinishMove":3786,"ListMove":[{"CurrentCell":"10,11,0","NextCell":"10,10,0","TimeMoveNextCell":1262}]}

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