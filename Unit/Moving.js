'use strict';

// var db_all_user		= require('./../Util/Database/Db_all_user.js');
var db_position		= require('./../Util/Database/Db_position.js');
var moveUnit 		= require('./../Redis/Move/Move.js');

var functions 		= require('./../Util/Functions.js');

var DetailError;
var currentTime;
var stringKeyMove;
var redis 				= require("redis"),
client 					= redis.createClient();
client.select(functions.RedisData.TestUnit);

exports.Start = function start (io) {
	io.on('connection', function(socket){
		socket.on('S_MOVE', function (data){
			// socket.broadcast.emit('R_MOVE',{R_MOVE:data});
			stringKeyMove = "s"+data.Server_ID+"_move";
			client.set(stringKeyMove,JSON.stringify(data.S_MOVE));
			// moveUnit.ClearMoveTimeout(stringData)		
			R_MOVE (socket,data.S_MOVE.ID_User,data.S_MOVE.Server_ID);	
			S_MOVE (socket,data.S_MOVE);
			
		});
	});
}

function R_MOVE (socket,ID_User,Server_ID) {
	var stringHSocket = "s"+Server_ID+"_socket";
	client.hgetall(stringHSocket,function (error,rows) {
		var result = rows;
		delete result[ID_User]
		if (Object.values(result).length>0) {
			for (var i = 0; i < Object.values(result).length; i++) {	
				sendToClient (socket,Object.values(result)[i])
			}
		}
	})
}
function sendToClient (socket,socketID) {
	client.get(stringKeyMove,function (error,rowData) {
		socket.broadcast.to(socketID).emit('R_MOVE',{R_MOVE:JSON.parse(rowData)});
	})
}

// var S_MOVE_data = {"Server_ID":1,"ID":13,"ID_Unit":16,"ID_User":42,"Position_Cell":"11,12,0","Next_Cell":"10,11,0","End_Cell":"10,9,0","TimeMoveNextCell":1262,"TimeFinishMove":3786,"ListMove":[{"CurrentCell":"10,11,0","NextCell":"10,10,0","TimeMoveNextCell":"1262"},{"CurrentCell":"10,10,0","NextCell":"10,9,0","TimeMoveNextCell":"2324"}]}
var S_MOVE_data = {"Server_ID":1,"ID":13,"ID_Unit":16,"ID_User":52,"Position_Cell":"11,12,0","Next_Cell":"10,11,0","End_Cell":"10,9,0","TimeMoveNextCell":1262,"TimeFinishMove":3786,"ListMove":[{"CurrentCell":"10,11,0","NextCell":"10,10,0","TimeMoveNextCell":1262}]}
// var S_MOVE_data = {"Server_ID":1,"ID":13,"ID_Unit":16,"ID_User":42,"Position_Cell":"7,7,0","Next_Cell":"10,12,0","End_Cell":"10,12,0","TimeMoveNextCell":1400,"TimeFinishMove":1400,"ListMove":[]}

// S_MOVE ('socket',S_MOVE_data)

function S_MOVE (socket,data) {
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
	moveUnit.MoveCalc (socket,data);
	updateDataBase (data);
}

function updateDataBase (data) {
	var stringUpdate = "UPDATE `s"+data.Server_ID+"_unit` SET "
	+"`Position_Cell`='"+data.Position_Cell+"',"
	+"`Next_Cell`='"+data.Next_Cell+"',"
	+"`End_Cell`='"+data.End_Cell+"',"
	+"`TimeMoveNextCell`='"+data.TimeMoveNextCell+"',"
	+"`TimeFinishMove`='"+data.TimeFinishMove+"',"
	+"`ListMove`='"+ JSON.stringify(data.ListMove) +"',"
	+"`Status`='"+functions.UnitStatus.Move+
	"' WHERE `ID`='"+data.ID+"'";

	db_position.query(stringUpdate,function (error,result) {
		if (!!error) {console.log(error);}
		var stringQuery = "SELECT * FROM `s1_unit` WHERE `ID`='"+data.ID+"'";
		db_position.query(stringQuery,function (error,rows) {
			updateRedisData (data,rows);
		});
	});

}

function updateRedisData (data,rowsData) {
	var stringHkey ="s1_unit";
	var stringKey = data.Server_ID+"_"+data.ID_Unit+"_"+data.ID_User+"_"+data.ID;
	client.hset(stringHkey,stringKey,JSON.stringify(rowsData))
}