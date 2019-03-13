'use strict';

// var db_all_user		= require('./../Util/Database/Db_all_user.js');
var db_position		= require('./../Util/Database/Db_position.js');
var moving_R_Move  	= require('./Moving_R_Move.js');
// var moveRedis 		= require('./../Redis/Move/Move.js');

var functions 		= require('./../Util/Functions.js');

var DetailError;
var currentTime;

var redis 				= require("redis"),
client 					= redis.createClient();
client.select(functions.RedisData.TestUnit);
var dataClient ={}

exports.Start = function start (io) {
	io.on('connection', function(socket){
		socket.on('S_MOVE', function (data){
			dataClient = data.S_MOVE;
			//R_MOVE (io,socket,dataClient);
			moving_R_Move.R_MOVE(io,socket,dataClient);
			S_MOVE (socket,data.S_MOVE);

		});
	});
}
function R_MOVE (io,socket,dataMove) {
	socket.broadcast.emit('R_MOVE',{R_MOVE:dataMove});
// socket.emit('R_MOVE',{R_MOVE:dataMove})
	// io.sockets.emit('R_MOVE',{R_MOVE:dataMove});

	//sendSocketRedis (io,dataMove)
	//var stringKey = dataMove.ID_User;
	// sendSocketRedis (io,dataMove.Server_ID,dataMove)

	// sendSocketRedis (socket,dataMove)
}

function sendSocketRedis (socket,dataMove) {
	var stringHkey = "s"+dataMove.Server_ID+"_socket";
	client.hkeys(stringHkey,function (error,rows) {
		var indexUser = rows.indexOf(dataMove.ID_User)
		rows.splice(indexUser, 1);
		client.hmget(stringHkey,rows,function (error,socketIDValue) {
			console.log(socketIDValue.length)
			for (var i = 0; i < socketIDValue.length; i++) {
				//socket.broadcast.to(socketIDValue[i]).emit('R_MOVE',{R_MOVE:dataMove});
				sendToClient (socket,socketIDValue[i],dataMove)
			}
		});		
	})
}
// var data = [ '42', '43' ]
// test (data)
// function test (rows) {
// 	var stringHkey = "s1_socket";
// 	client.hmget(stringHkey,rows,function (error,socketIDValue) {
// 		console.log(socketIDValue)
// 		for (var i = 0; i < socketIDValue.length; i++) {
// 			//sendToClient (io,socketIDValue[i],dataMove)
// 		}
// 	});		
// }
function sendToClient (socket,socketID,dataMove) {
	// io.to(socketID).emit('R_MOVE',{R_MOVE:dataMove});
	// io.in(socketID).emit('R_MOVE',{R_MOVE:dataMove});
	socket.broadcast.to(socketID).emit('R_MOVE',{R_MOVE:dataMove});
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
	console.log(data);
	//moveRedis.MoveCalc (data)	
	updateDataBase (data);
}

function updateDataBase (data) {
	var stringUpdate = "UPDATE `s"+data.Server_ID+"_unit` SET "
	+"`Next_Cell`='"+data.Next_Cell+"',"
	+"`End_Cell`='"+data.End_Cell+"',"
	+"`TimeMoveNextCell`='"+data.TimeMoveNextCell+"',"
	+"`TimeFinishMove`='"+data.TimeFinishMove+"',"
	+"`ListMove`='"+ JSON.stringify(data.ListMove) +"',"
	+"`Status`='"+functions.UnitStatus.Move+
	"' WHERE `ID`='"+data.ID+"'";
	//console.log(stringUpdate);
	db_position.query(stringUpdate,function (error,result) {
		if (!!error) {console.log(error);}
	})
}