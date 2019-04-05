'use strict';

var db_server_task  	= require('./../Util/Database/Db_server_task.js');

var version, DetailError;
var dataPath = "file://DESKTOP-FHHKHH7/FileDownload/DB.sqlite";

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
			if (!!error){DetailError = ('CheckVersion.js: Error query S_CHECK_VERSION');functions.WriteLogError(DetailError,1);}
			version = rows[0].Content;
			if (data.Version!=version) {			
				R_CHECK_VERSION(socket,version);
			}else{
				var dataSend={Data: "",Version:version}
				socket.emit("R_CHECK_VERSION",dataSend);
			}
		});	
	});
}

function R_CHECK_VERSION(socket,version) {
	var dataSend={Data: dataPath,Version:version}
	socket.emit("R_CHECK_VERSION",dataSend);
}