var db_all_user  		= require('./../Util/Database/Db_all_user.js');
var db_server_task 		= require('./../Util/Database/Db_server_task.js');
var functions			= require('./../Util/Functions.js');
var testRegister		= require('./../Login/Register/Register.js');
//var index 				= require('./../index.js');

var redis 				= require("redis"),
client 					= redis.createClient();
client.select(functions.RedisData.TestUnit);

var DetailError,logChangeDetail ;

// updateTimeOffline ()
function updateTimeOffline () {
	var currentTime = new Date(functions.GetTime()).toISOString();
	var stringUpdate = "UPDATE `task` SET `Time`='"+functions.ImportTimeToDatabase(currentTime)+"' WHERE `Task`='OfflineTime'"

	db_server_task.query(stringUpdate,function (error,result) {
		if (!!error){DetailError = ('TaskServer.js: updateTimeOffline '+stringUpdate); functions.WriteLogError(DetailError,2);}
		logChangeDetail =("TaskServer.js: updateTimeOffline "+stringUpdate); functions.LogChange(logChangeDetail,2);
	})
}


exports.ConnectSocket = function connectSocket (id,ID_User) {
	var currentTime =functions.ImportTimeToDatabase(functions.GetTimeNow());
	// var updateString = "INSERT INTO `user_info`(`Socket`, `TimeLogIn`) VALUES ("+id+",'"+currentTime+"')";
	var updateString = "UPDATE `user_info` SET "+
	"`Socket` ='"+id+
	"', `TimeLogIn`='"+currentTime+
	"', `TimeLogOut`= null WHERE `ID_User`='"+ID_User+"'";
	//console.log(updateString);
	db_all_user.query(updateString,function (error,result) {
		if (!!error){DetailError = ('TaskServer.js: updateString '+updateString); functions.WriteLogError(DetailError,2);}
		logChangeDetail =("TaskServer.js: updateString "+updateString); functions.LogChange(logChangeDetail,2);
	});
}
exports.RedisConnectSocket = function redisConnectSocket (Server_ID,ID_User,idSocket) {
	var stringHkey = "s"+Server_ID+"_socket";
	var stringKey = ID_User;
	client.hset(stringHkey,stringKey,idSocket);

}
// redisConnectSocket (1,5,5555)
// redisConnectSocket (1,45,45555)
// redisConnectSocket (1,52,65555)

// function redisConnectSocket (Server_ID,ID_User,idSocket) {
// 	var stringHkey = "s"+Server_ID+"_socket";
// 	var stringKey = ID_User;
// 	client.hset(stringHkey,stringKey,idSocket);

// }



exports.RemoveConnectSocket = function removeConnectSocket (id) {
	var queryId = "SELECT * FROM `user_info` WHERE `Socket`= '"+id+"'";
	db_all_user.query(queryId,function (error,rows) {
		if (!!error){DetailError = ('TaskServer.js: queryId querySocketId '+queryId); functions.WriteLogError(DetailError,2);}
		if (rows!=undefined) {
			var currentTime =functions.ImportTimeToDatabase(functions.GetTimeNow());
			var removeUser = "UPDATE `user_info` SET `TimeLogOut`='"+currentTime+"', `TimeLogIn`=null, `Socket`=null WHERE `Socket`='"+id+"'";
			db_all_user.query(removeUser,function (error,result) {
				if (!!error){DetailError = ('TaskServer.js: removeUser ConnectUser '+removeUser); functions.WriteLogError(DetailError,2);}
				logChangeDetail =("TaskServer.js: removeUser ConnectUser "+removeUser); functions.LogChange(logChangeDetail,2);
			});	
			//console.log('RemoveConnectSocket');
			if (rows.length>0) {
				redisRemoveSocket (rows[0].Server_ID,rows[0].ID_User);
			}			
		}
	})	
}

function redisRemoveSocket (server_ID,ID_User) {
	var stringHkey = "s"+server_ID+"_socket";
	var stringKey = ID_User;
	client.hexists(stringHkey,stringKey,function (error,resultBool){
		if (resultBool==1) {
			client.hdel(stringHkey,stringKey,function (error,result) {
				if (!!error) {console.log(error)}
			});
		}
	})
}
// var data = {
// 	ID: 42,
// 	ID_User: 42,
// 	UserName: 'ndinhtoan45',
// 	Password: '25d55ad283aa400af464c76d713c07ad',
// 	Email: 'asdc123@gmail.com',
// 	NameInGame: 'ndinhtoan45',
// 	Server_ID: 1,
// 	Diamond: 1000,
// 	ResetVipTime: 6,
// 	TimeLogIn: '2019-03-12T20:15:23.000Z',
// 	TimeLogOut: null,
// 	Socket: 'rqKFnBH7AjkKEptvAAAA',
// 	DateCreate: '2019-01-03T23:36:52.000Z',
// 	Model_Device: null,
// 	Ram_Device: null,
// 	BlockedTime: null,
// 	BlockedForever: 0,
// 	Password_Recover_Key: null,
// 	Password_Recover_Time: null } 
// //
// removeConnectSocket (data.Socket)
// function removeConnectSocket (id) {
// 	var queryId = "SELECT * FROM `user_info` WHERE `Socket`= '"+id+"'";
// 	db_all_user.query(queryId,function (error,rows) {
// 		if (!!error){DetailError = ('TaskServer.js: queryId querySocketId '+queryId); functions.WriteLogError(DetailError,2);}
// 		if (rows!=undefined) {
// 			var currentTime =functions.ImportTimeToDatabase(functions.GetTimeNow());
// 			var removeUser = "UPDATE `user_info` SET `TimeLogOut`='"+currentTime+"', `TimeLogIn`=null, `Socket`=null WHERE `Socket`='"+id+"'";
// 			// db_all_user.query(removeUser,function (error,result) {
// 			// 	if (!!error){DetailError = ('TaskServer.js: removeUser ConnectUser '+removeUser); functions.WriteLogError(DetailError,2);}
// 			// 	logChangeDetail =("TaskServer.js: removeUser ConnectUser "+removeUser); functions.LogChange(logChangeDetail,2);
// 			// });	
// 			console.log('RemoveConnectSocket')
// 			console.log(rows)
// 			//redisRemoveSocket (rows[0].Server_ID,rows[0].ID_User)
// 		}
// 	})

// }

exports.ClearAllSocket = function ClearAllSocket () {
	var updateString = "UPDATE `user_info` SET `TimeLogIn`=null,`TimeLogOut`=null,`Socket`=null";
	//console.log(updateString);
	db_all_user.query(updateString,function (error,result) {
		if (!!error){DetailError = ('TaskServer.js: ClearAllSocket '+updateString); functions.WriteLogError(DetailError,2);}
		logChangeDetail =("TaskServer.js: ClearAllSocket ConnectUser "+updateString); functions.LogChange(logChangeDetail,2);
	});
}


// if (process.argv.length <2) {
// 	//console.log(process.argv.length)
// 	console.log("Vui long chon tham so truyen vao:")
// 	console.log("0: Current Server")
// 	console.log('1: Switch Server')
// 	console.log('2: Test Time')
// 	console.log('3: Test Insert User')
// 	console.log('4: Update Server Connect')
// 	console.log('5: Close Connect')
// }
// else{
// 	switch (parseInt(process.argv[2])) {
// 		case 0:
// 		var queryString = "SELECT * FROM `task` WHERE `ID`=1"; 

// 		//console.log(queryString);
// 		db_server_task.query(queryString,function (error,rows) {
// 			if (!!error){DetailError = ('TaskServer.js: query task'); functions.WriteLogError(DetailError,2);}
// 			console.log(rows);
// 		});
// 		break;

// 		case 1:
// 		console.log(process.argv[3]);
// 		if (process.argv[3]==undefined) {
// 			console.log("Vui long chon tham so thu 3");
// 		}
// 		else{
// 			var updateString ="UPDATE `task` SET `Content` = '"+parseInt(process.argv[3])+"' WHERE `task`.`ID` = 1"; 
// 			console.log(updateString);
// 			db_server_task.query(updateString,function (error,result) {
// 				if (!!error){DetailError = ('TaskServer.js: error update Current server'); functions.WriteLogError(DetailError,2);}		
// 			});
// 		}
// 		break;

// 		case 2:
// 		var timeUpdate = new Date().toISOString();
// 		var updateString  ="UPDATE `server_list` SET `ProtectedTime` = '"+timeUpdate+"' WHERE `server_list`.`ID` = 1";
// 		console.log(updateString);
// 		db_server_task.query(updateString,function (error,result) {
// 			if (!!error){DetailError = ('TaskServer.js: error update ProtectedTime'); functions.WriteLogError(DetailError,2);}	
// 			console.log(result);
// 		});
// 		break;

// 		case 3:

// 		var data = {
// 			UserName : "thisUser20",
// 			Password : "thisPassword30",
// 			Email : "thisEmail40"
// 		};
// 		testRegister.Test(data);
// 		break;

// 		case 4:
// 		var updateServer;
// 		var selectConnectServer ="SELECT `Content` FROM `task` WHERE `ID`='2'";
// 		// console.log('selectConnectServer: '+selectConnectServer);
// 		console.log('Update Server Connect')
// 		db_server_task.query(selectConnectServer,function (error,rows) {
// 			if (!!error){console.log('error selectConnectServer');}
// 			switch (rows[0].Content) {
// 				case 0:
// 				updateServer = "UPDATE `task` SET `Content`=1 WHERE `ID`='2'";
// 				break;
// 				case 1:
// 				updateServer = "UPDATE `task` SET `Content`=0 WHERE `ID`='2'";
// 				break;
// 			}

// 			db_server_task.query(updateServer,function (error) {
// 				if (!!error){DetailError = ('TaskServer.js: error update ProtectedTime'); functions.WriteLogError(DetailError,2);}
// 			});
// 		});
// 		break;

// 		case 5 :
// 		index.IOValue(cb=>{console.log(cb)});
// 		break;
// 	}
// }
