var db_all_user  	= require('./../Util/Database/Db_all_user.js');
var db_server_task 	= require('./../Util/Database/Db_server_task.js');
var functions		= require('./../Util/Functions.js');
var testRegister	= require('./../Login/Register/Register.js');
var index 			= require('./../index.js');

var DetailError,logChangeDetail ;

exports.ConnectSocket = function connectSocket (id) {
	var insertUser = "INSERT INTO `socket_user`(`SocketID`, `Time`) VALUES ("+id+",'"+functions.GetTimeNow()+"')";
	console.log('insertUser: '+insertUser);
	db_server_task.query(insertUser,function (error,result) {
		if (!!error){DetailError = ('TaskServer.js: insertUser ConnectUser'); functions.WriteLogError(DetailError);}
		logChangeDetail =("TaskServer.js: insertUser ConnectUser"); functions.LogChange(logChangeDetail);
	});
}

exports.RemoveConnectSocket = function removeConnectSocket (id) {	
	var removeUser = "DELETE FROM `socket_user` WHERE `SocketID`="+id;
	console.log('removeUser: '+removeUser);
	db_server_task.query(removeUser,function (error,result) {
		if (!!error){DetailError = ('TaskServer.js: removeUser ConnectUser'); functions.WriteLogError(DetailError);}
		logChangeDetail =("TaskServer.js: removeUser ConnectUser"); functions.LogChange(logChangeDetail);
	});
}
if (process.argv.length <2) {

	//console.log(process.argv.length)
	console.log("Vui long chon tham so truyen vao:")
	console.log("0: Current Server")
	console.log('1: Switch Server')
	console.log('2: Test Time')
	console.log('3: Test Insert User')
	console.log('4: Update Server Connect')
	console.log('5: Close Connect')
}
else{
	switch (parseInt(process.argv[2])) {
		case 0:
		var queryString = "SELECT * FROM `task` WHERE `ID`=1"; 

		//console.log(queryString);
		db_server_task.query(queryString,function (error,rows) {
			if (!!error){DetailError = ('TaskServer.js: query task'); functions.WriteLogError(DetailError);}
			console.log(rows);
		});
		break;

		case 1:
		console.log(process.argv[3]);
		if (process.argv[3]==undefined) {
			console.log("Vui long chon tham so thu 3");
		}
		else{
			var updateString ="UPDATE `task` SET `Content` = '"+parseInt(process.argv[3])+"' WHERE `task`.`ID` = 1"; 
			console.log(updateString);
			db_server_task.query(updateString,function (error,result) {
				if (!!error){DetailError = ('TaskServer.js: error update Current server'); functions.WriteLogError(DetailError);}		
			});
		}
		break;

		case 2:
		var timeUpdate = new Date().toISOString();
		var updateString  ="UPDATE `server_list` SET `ProtectedTime` = '"+timeUpdate+"' WHERE `server_list`.`ID` = 1";
		console.log(updateString);
		db_server_task.query(updateString,function (error,result) {
			if (!!error){DetailError = ('TaskServer.js: error update ProtectedTime'); functions.WriteLogError(DetailError);}	
			console.log(result);
		});
		break;

		case 3:

		var data = {
			UserName : "thisUser20",
			Password : "thisPassword30",
			Email : "thisEmail40"
		};
		testRegister.Test(data);
		break;

		case 4:
		var updateServer;
		var selectConnectServer ="SELECT `Content` FROM `task` WHERE `ID`='2'";
		// console.log('selectConnectServer: '+selectConnectServer);
		console.log('Update Server Connect')
		db_server_task.query(selectConnectServer,function (error,rows) {
			if (!!error){console.log('error selectConnectServer');}
			switch (rows[0].Content) {
				case 0:
				updateServer = "UPDATE `task` SET `Content`=1 WHERE `ID`='2'";
				break;
				case 1:
				updateServer = "UPDATE `task` SET `Content`=0 WHERE `ID`='2'";
				break;
			}

			db_server_task.query(updateServer,function (error) {
				if (!!error){DetailError = ('TaskServer.js: error update ProtectedTime'); functions.WriteLogError(DetailError);}
			});
		});
		break;

		case 5 :
		index.IOValue(cb=>{console.log(cb)});
		break;
	}
}

exports.Start =  function start (io) {
	// console.log('here length');
	// if (process.argv.length >2 && parseInt(process.argv[2])===5) {
	// 	io.on('connection', function(socket){
	// 		console.log(io);
	// 	});
	// }
	// io.on('connection', function(socket){
	// 	if (process.argv.length >2 && parseInt(process.argv[2])===5) {
	// 		console.log('here');
	// 		console.log(io);
	// 	}
	// });
}