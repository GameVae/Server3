'use strict';
var db_all_users			= require('./../../Util/Database/Db_all_user.js');
var db_position				= require('./../../Util/Database/Db_position.js');

var functions 				= require('./../../Util/Functions.js');
var DetailError, LogChange;

var redis 				= require("redis"),
client 					= redis.createClient();
client.select(functions.RedisData.TestUnit);

var index 					= require('./../../index.js');

var DictTimeInterval = {};
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
			// console.log("user socket");
			clearTimeout((DictTimeInterval['sendNewPos']);
			delete DictTimeInterval['sendNewPos'];

			checkSocket (io,rowsSocket[0],data);
			// sendToClient (io,rowsSocket[0],data);
		}else{
			console.log("all user offline");
			sendGetNewPos2(io,data)
			// sendGetNewPos2(index.IO,data);		
			// DictTimeInterval['sendNewPos'] = setInterval(function (io,data) {
			// 	console.log(rowsSocket[0])
			// 	sendGetNewPos2(index.IO,data);				
			// }, 1000, index.IO,data)
		}
	});	
}
// { Server_ID: 1,
//   ID: 17,
//   ID_Unit: 16,
//   ID_User: 42,
//   Position_Cell: '26,6,0',
//   Next_Cell: '25,6,0',
//   End_Cell: '25,6,0',
//   TimeMoveNextCell: '2019-04-04T03:32:39.639',
//   TimeFinishMove: '2019-04-04T03:32:39.639',
//   ListMove: [] }

function sendToClient (io,socketID,data) {
	console.log(io,socketID,data)
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
	var stringQuery = "SELECT `Socket`,`ID_User` FROM `user_info` WHERE `Socket`='"+socketID+"'";
	db_all_users.query(stringQuery,function (error,rows) {
		if (!!error){DetailError = ('Move_GetNewPosition.js: checkSocket '+stringQuery); functions.WriteLogError(DetailError,2);}
		
		if (rows.length>0 && data.ID_User!=rows[0].ID_User) {			
			sendToClient (io,rows[0].Socket,data);
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