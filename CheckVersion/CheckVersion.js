'use strict';
//var cron 			= require('node-cron');

var db_server_task  	= require('./../Util/Database/Db_server_task.js');
var version;
var clientVersion,DetailError;


exports.Start = function start (io) {
	io.on('connection', function(socket){	
		S_CHECK_VERSION (socket);
	});
}

function S_CHECK_VERSION(socket) {
	socket.on('S_CHECK_VERSION', function (data){
		console.log("S_CHECK_VERSION here");
		var queryStringUpdate = "SELECT `Content` FROM `task` WHERE `ID`='3'"
		db_server_task.query(queryStringUpdate,function (error,rows) {
			if (!!error){DetailError = ('CheckVersion.js: Error query S_CHECK_VERSION');functions.WriteLogError(DetailError);}
			version = rows[0].Content;
			console.log("Version: "+data.Version)
			if (data.Version!=version) {			
				R_CHECK_VERSION(socket,version);
			}
		});	
	});
}

function R_CHECK_VERSION(socket,version) {
	console.log('R_CHECK_VERSION:');
	var dataPath = "file://DESKTOP-FHHKHH7/FileDownload/DB.sqlite";
	var dataSend={Data: dataPath,Version:version}
	socket.emit("R_CHECK_VERSION",dataSend);
}
// cron.schedule('*/1 * * * * *',function(){
// 	console.log("here");
// });

// var fs = require("fs");
// test()
// function test () {
// 	fs.readFile("./../FileDownload/File.txt",(err,data) =>{
// 		console.log(data);
// 		//socket.emit("R_CHECK_VERSION",data);
// 	});
// }