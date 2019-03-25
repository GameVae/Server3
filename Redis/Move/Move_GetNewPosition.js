'use strict';
var db_all_users			= require('./../../Util/Database/Db_all_user.js');
var db_position				= require('./../../Util/Database/Db_position.js');

var functions 				= require('./../../Util/Functions.js');
var DetailError, logChangeDetail;

var redis 				= require("redis"),
client 					= redis.createClient();
client.select(functions.RedisData.TestUnit);

// var data = { Server_ID: 1,
// 	ID: 10,
// 	ID_Unit: 16,
// 	ID_User: 9,
// 	Position_Cell: '11,11,0',
// 	Next_Cell: '11,11,0',
// 	End_Cell: '11,11,0',
// 	TimeMoveNextCell: '2019-03-19T01:27:24.473',
// 	TimeFinishMove: '2019-03-19T01:27:24.473',
// 	ListMove: [] }
//

exports.SendGetNewPos = function sendGetNewPos(io,data) {
	sendGetNewPos2(io,data);
}

// sendGetNewPos2('socket',S_MOVE_data);

function sendGetNewPos2(io,data) {
	// console.log(sendGetNewPos2)
	// console.log(io,data)
	var stringHkey = "s"+data.Server_ID+"_socket";
	client.hvals(stringHkey,function (error,rowsSocket) {
		if (rowsSocket.length>0) {
			checkSocket (io,rowsSocket[0],data);
			// sendToClient (io,rowsSocket[0],data);
		}else{
			console.log("all user offline");
		}
	});	
}

function sendToClient (io,socketID,data) {
	// console.log(io,socketID,data)
	//send cho client qua cong S_MOVE;
	// io.to(socketID).emit('R_DEPLOY',{R_DEPLOY:dataDeploy});
	var dataSend = {
		Server_ID : data.Server_ID,
		ID : data.ID
	}
	io.to(socketID).emit('R_NEW_POS',{R_NEW_POS:dataSend});
	// socket.broadcast.to(socketID).emit('R_NEW_POS',{R_NEW_POS:data.ID});
}

function checkSocket (io,socketID,data) {
	var stringQuery = "SELECT `Socket` FROM `user_info` WHERE `Socket`='"+socketID+"'";
	db_all_users.query(stringQuery,function (error,rows) {
		if (rows.length>0) {			
			sendToClient (io,rowsSocket[0],data);
		}else{
			redisRemoveSocket (io,data);
		}
	});
}

function redisRemoveSocket (io,data) {
	var stringHkey = "s"+data.Server_ID+"_socket";
	var stringKey = data.ID_User;
	client.hexists(stringHkey,stringKey,function (error,resultBool){
		if (resultBool==1) {
			client.hdel(stringHkey,stringKey,function (error,result) {
				if (!!error) {console.log(error);}
				sendGetNewPos2(io,data);
			});
		}
	})
}