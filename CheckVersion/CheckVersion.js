'use strict';
//var cron 			= require('node-cron');
var db_server_task  	= require('./../Util/Database/Db_server_task.js');
var version;
var clientVersion,DetailError;
var fs = require('fs');

exports.Start = function start (io) {
	io.on('connection', function(socket){
		console.log("S_CHECK_VERSION here");
		S_CHECK_VERSION (socket,app);
	});
}

function S_CHECK_VERSION(socket) {
	socket.on('S_CHECK_VERSION', function (data){
		var queryStringUpdate = "SELECT `Content` FROM `task` WHERE `ID`='3'"
		db_server_task.query(queryStringUpdate,function (error,rows) {
			if (!!error){DetailError = ('CheckVersion.js: Error query S_CHECK_VERSION');functions.WriteLogError(DetailError);}
			version = rows[0].Content;
			if (data.Version!=version) {			
				R_CHECK_VERSION(socket);
			}
		});	
	});
}

// socket.on("sendpath",filepath){
//     fs.readFile(filepath,function(error, filedata){
//         if(error) throw error;
//         else socket.emit("sendfile", filedata.toString() );
//     });
// });
function R_CHECK_VERSION(socket) {
	console.log('R_CHECK_VERSION:');
	//var filePath = "./FileDownload/File.txt";
	var filePath = "./FileDownload/Infantry.xlsx";
	fs.readFile(filePath,(error,data) =>{
		if (!!error){DetailError = ('CheckVersion.js: Error send R_CHECK_VERSION');functions.WriteLogError(DetailError);}
		socket.emit("R_CHECK_VERSION",{Data:data.toString()});
	});
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