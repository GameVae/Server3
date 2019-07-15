'use strict';
var express			= require('express');
var app				= express();
var server			= require('http').createServer(app);
var io 				= require('socket.io').listen(server);


module.exports.IO = io;

var redisFunc 		= require('./Redis.js');

var functions 		= require('./Util/Functions.js');

exports.Test = function test (argument) {
	console.log(argument);
}

var db_server_task 	= require('./Util/Database/Db_server_task.js');

server.listen(process.env.PORT);
io.sockets.setMaxListeners(0);
app.set('port', process.env.PORT);


console.log(functions.GetTimeNow()+": "+app.get('port'));



process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var serverPosition 			= require('./UpdatePosition/UpdateServerPosition.js');
serverPosition.UpdateDatabase(1);

var register 				= require('./Login/Register/Register.js');

var login 					= require('./Login/Login/Login.js');
// login.Start(io);

var taskServer 				= require('./Task/TaskServer.js');
taskServer.ClearAllSocket();
// taskServer.Start(io);

var checkVersion 			= require('./CheckVersion/CheckVersion.js');
// checkVersion.Start(io);

var getRss 					= require('./Map/GetRss.js');
// getRss.UpdateTimeHarvest();
var upgrade 				= require('./Upgrade/Upgrade.js');

var Upgrade_UpdateDatabase	= require('./Upgrade/Upgrade_UpdateDatabase.js');
Upgrade_UpdateDatabase.UpdateDatabase(1);
// upgrade.UpdateDatabase(2);
var training				= require('./TrainingUnit/Training.js')
training.UpdateDatabase(1);
// training.UpdateDatabase(2);
var info 					= require('./Info/GetInfo.js');

var friend 					= require('./Friend/GetFriend.js');
friend.UpdateDatabase();

var guild 					= require('./Guild/GetGuild.js');

var getUnit 				= require('./Login/Login/GetUnit.js');

var sendUnit				= require('./Unit/Deploy.js');

var moving 					= require('./Unit/Moving.js');
// var moving_Attack 			= require('./Unit/Moving_Attack.js')

// var moveUnit_Attack			= require('./Unit/Moving_Attack.js');

var attacking 				= require('./Attack/Attacking.js');
// var attackingUpdate 		= require('./Unit/Attacking _Update.js');

// var attackingUnit			= require('./Unit/Attacking.js');



var moving_Update 			= require('./Unit/Moving_Update.js');
moving_Update.UpdateDataBase(1);

// var updateAttack 			= require('./Redis/Attack/Attack_Update.js');
// updateAttack.UpdateDataBase(1);

var guild_UpdateDatabase 	= require('./Guild/Guild_UpdateDatabase.js');
guild_UpdateDatabase.UpdateDatabase();

if (app.get('port') === process.env.PORT)
{	
	var connectCounter=0;
	checkConnect (connectCounter,io);

	register.Start(io);
	login.Start(io);
	checkVersion.Start(io);
	getRss.Start(io);
	upgrade.Start(io);
	training.Start(io);
	friend.Start(io);
	info.Start(io);
	sendUnit.Start(io);

	moving.Start(io);
	// moveUnit_Attack.Start(io);
	
	attacking.Start(io);
	// attackingUnit.Start(io);
	getUnit.Start(io);

	// attackingUpdate.UpdateAttack (io,1);
}

function checkConnect (connectCounter,io) {
	io.on('connection', function (socket) {
		var selectConnectServer ="SELECT `Content` FROM `task` WHERE `ID`='2'";
		db_server_task.query(selectConnectServer, function (error,rows) {
			if (rows[0].Content==1) {		
				connectCounter++;
				socket.emit('connection',{});
				console.log('connectCounter: '+connectCounter);		
			}	
		});
		socket.on('disconnect', function () {
			connectCounter--;
			taskServer.RemoveConnectSocket(socket.id);
			console.log('connectCounter: '+connectCounter);		
		});
	});
}