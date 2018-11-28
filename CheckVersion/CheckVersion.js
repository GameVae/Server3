'use strict';
//var cron 			= require('node-cron');
var db_server_task  	= require('./../Util/Database/Db_server_task.js');
var version = 2;
var clientVersion,DetailError;


exports.Start = function start (io) {
	io.on('connection', function(socket){
		console.log("S_CHECK_VERSION here");
		S_CHECK_VERSION (socket);
	});
}

function S_CHECK_VERSION(socket) {
	socket.on('S_CHECK_VERSION', function (data){
		// if (data.Version!=version) {			
		// 	R_CHECK_VERSION(socket);
		// }
		var stringQuery = "SELECT `Content` FROM `task` WHERE `ID`=3";
		db_server_task.query(stringQuery, function (error,rows) {
			if (!!error){DetailError = ('CheckVersion.js: Error query getDataRss');functions.WriteLogError(DetailError);}
			if (rows[0].Content!=data.Version) {			
				R_CHECK_VERSION(socket,{
					Data:data
				});
			}
			
		});

	});
}

function R_CHECK_VERSION(socket,data) {
	socket.emit('R_CHECK_VERSION',{
		Version : version
	});
}
// cron.schedule('*/1 * * * * *',function(){
// 	console.log("here");
// });