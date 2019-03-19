'use strict';
var db_position				= require('./../../Util/Database/Db_position.js');

var functions 				= require('./../../Util/Functions.js');
var DetailError, logChangeDetail;

var redis 				= require("redis"),
client 					= redis.createClient();
client.select(functions.RedisData.TestUnit);

var S_MOVE_data = { Server_ID: 1,
	ID: 10,
	ID_Unit: 16,
	ID_User: 9,
	Position_Cell: '11,11,0',
	Next_Cell: '11,11,0',
	End_Cell: '11,11,0',
	TimeMoveNextCell: '2019-03-19T01:27:24.473',
	TimeFinishMove: '2019-03-19T01:27:24.473',
	ListMove: [] }
//

exports.SendGetNewPos = function sendGetNewPos(socket,data) {
	sendGetNewPos2(socket,data)
}

// sendGetNewPos2('socket',S_MOVE_data);

function sendGetNewPos2(socket,data) {
	var stringHkey = "s"+data.Server_ID+"_socket";
	client.hkeys(stringHkey,function (error,rowsSocket) {
		if (rowsSocket.length>0) {
			client.hget(stringHkey,rowsSocket[0],function (error,socketIDValue) {
				//console.log(socketIDValue)
				sendToClient (socket,socketIDValue,data);
			});
		}else{
			console.log("all user offline");
		}
	});	
}

function sendToClient (socket,socketID,data) {
	//send cho client qua cong S_MOVE;
	socket.broadcast.to(socketID).emit('R_NEW_POS',{R_NEW_POS:data});
}