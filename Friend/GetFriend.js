'use strict';

var db_friend		= require('./../Util/Database/Db_all_friend.js');
var db_all_user		= require('./../Util/Database/Db_all_user.js');

var friendData 		= require('./../Redis/Friend/FriendData.js');

var functions 		= require('./../Util/Functions.js');

var DetailError, LogChange;

var dataFriend ={
	ID_User: 	43,
	ID_Player: 42, 
}

var Promise = require('promise')
var timeAccept 		= 24*60*60*1000;// 24h
var timeUnfriend 	= 30*60*1000;// 30 phut
// var timeUnfriend 	= 0.5*60*1000;// 30 phut
// var timeUnfriend 	= 0;// 30 phut
var timeOut;
var DictTimeOut={};
var DictRemoveAddFriend = {};
var DictTimeOutAddFriend = {};
var DictTimeOutUnFriend = {};
var tableQuery,queryTableString;

//S_ADD_FRIEND (data)

var redis = require('redis');
var client = redis.createClient();
client.select(functions.RedisData.TestUnit);

exports.Start = function start (io) {
	io.on('connection', function(socket){
		socket.on('S_ADD_FRIEND', function (data){
			functions.ShowLog(functions.ShowLogBool.Clear,'GetFriend.js Start=>S_ADD_FRIEND data.S_ADD_FRIEND',[data.S_ADD_FRIEND]);	
			S_ADD_FRIEND (io,data.S_ADD_FRIEND);
		});
		socket.on('S_ACCEPT_FRIEND',function (data) {
			functions.ShowLog(functions.ShowLogBool.Clear,'GetFriend.js Start=>S_ACCEPT_FRIEND data.S_ACCEPT_FRIEND',[data.S_ACCEPT_FRIEND]);	
			S_ACCEPT_FRIEND(io,data.S_ACCEPT_FRIEND);
		});
		socket.on('S_REJECT_FRIEND',function (data) {
			functions.ShowLog(functions.ShowLogBool.Clear,'GetFriend.js Start=>S_REJECT_FRIEND data.S_REJECT_FRIEND',[data.S_REJECT_FRIEND]);	
			S_REJECT_FRIEND(io,data.S_REJECT_FRIEND);
		});

		socket.on('S_UNFRIEND',function (data) {		
			functions.ShowLog(functions.ShowLogBool.Clear,'GetFriend.js Start=>S_UNFRIEND data.S_UNFRIEND',[data.S_UNFRIEND]);				
			S_UNFRIEND(io,data.S_UNFRIEND);
		});

	});
}


// var stringHSocket;
// S_ADD_FRIEND (null,dataFriend)
// getFriendInfo (null,42);
function S_ADD_FRIEND (io,data) {
	timeOut = functions.GetTime()+timeAccept;
	
	var stringInsert = "INSERT INTO `"+data.ID_User+"` (`ID_Player`, `RequestBool`,`AcceptTime`) VALUES ("+
	"'"+data.ID_Player+"',"
	+"'1',"+
	"'"+functions.ImportTimeToDatabase(new Date(timeOut).toISOString())+"');"+
	"INSERT INTO `"+data.ID_Player+"` (`ID_Player`, `RequestBool`,`AcceptTime`) VALUES ("+
	"'"+data.ID_User+"',"
	+"'0',"+
	"'"+functions.ImportTimeToDatabase(new Date(timeOut).toISOString())+"');";


	db_friend.query(stringInsert, function (error,result) {
		if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'GetFriend.js S_ADD_FRIEND stringInsert',[stringInsert]);}
	});
	setTimeoutAddFriend (data,timeOut);

	var socketPlayer = "SELECT `Socket` FROM `user_info` WHERE `ID_User`="+data.ID_Player;
	db_all_user.query(socketPlayer,function (error,rows) {
		if (!!error){DetailError = ('GetFriend.js: socketPlayer ' + socketPlayer);functions.WriteLogError(DetailError,2);}
		if (rows!=undefined) {
			if (rows[0].Socket!=null) {
				io.to(rows[0].Socket).emit('R_ADD_FRIEND',{R_ADD_FRIEND: data.ID_User});
				
			}
		}
	});	
}
function S_REJECT_FRIEND (io,data) {
	removeAddFriend (data.ID_User,data.ID_Player);
	removeAddFriendWaitTime (data);
	var socketPlayer = "SELECT `Socket` FROM `user_info` WHERE `ID_User`="+data.ID_Player;
	db_all_user.query(socketPlayer,function (error,rows) {
		if (!!error){DetailError = ('GetFriend.js: socketPlayer S_REJECT_FRIEND' + socketPlayer);functions.WriteLogError(DetailError,2);}
		if (rows!=undefined) {
			if (rows[0].Socket!=null) {
				io.to(rows[0].Socket).emit('R_REJECT_FRIEND',{R_REJECT_FRIEND: data.ID_Player});
				
			}
		}
	});	
}

function setTimeoutAddFriend (data,timeOut) {
	var stringAddFriend= data.ID_User+"_"+data.ID_Player;
	DictRemoveAddFriend[stringAddFriend]=setTimeout(function (data) {
		var stringQuery = "SELECT * FROM `"+data.ID_User+"` WHERE `ID_Player`='"+data.ID_Player+"'";
		db_friend.query(stringQuery, function (error,rows) {
			if (!!error){DetailError = ('GetFriend.js: setTimeoutAddFriend');functions.WriteLogError(DetailError,2);}
			if (rows[0]!=undefined) {
				if (rows[0].AcceptTime!=undefined) {
					var databaseTime = new Date(functions.ExportTimeDatabase(rows[0].AcceptTime)).getTime();
					var currentTime = functions.GetTime();
					if (databaseTime<=currentTime) {
						console.log(data);
						removeAddFriend (data.ID_User,data.ID_Player);
						delete DictRemoveAddFriend[stringAddFriend];
					}else{
						var timeNext = currentTime - databaseTime;
						setTimeoutAddFriend (data,timeNext);
					}
				}
			}
		});
	}, timeOut, data);
}

function removeAddFriend (ID_User,ID_Player) {
	var stringQuery = "DELETE FROM `"+ID_User+"` WHERE `ID_Player`='"+ID_Player+"';"+
	"DELETE FROM `"+ID_Player+"` WHERE `ID_Player`='"+ID_User+"'";
	// console.log(stringQuery)
	db_friend.query(stringQuery,function (error,result) {
		if (!!error){DetailError = ('GetFriend.js: removeAddFriend '+ID_User);functions.WriteLogError(DetailError,2);}
		LogChange='GetFriend.js: removeAddFriend: '+ID_User;functions.LogChange(LogChange,1);
	});
}

function S_ACCEPT_FRIEND(io,data){
	var stringQuery = "UPDATE `"+data.ID_User+"` SET `RequestBool`='0', `AcceptTime`=null,`RemoveTime`=null ;"+
	"UPDATE `"+data.ID_Player+"` SET `RequestBool`='0',`AcceptTime`=null,`RemoveTime`=null;";
	db_friend.query(stringQuery,function (error,result) {
		if (!!error){DetailError = ('GetFriend.js: S_ACCEPT_FRIEND '+data.ID_User);functions.WriteLogError(DetailError,2);}
		LogChange='GetFriend.js: removeAddFriend: '+data.ID_User;functions.LogChange(LogChange,1);			
	});

	var playerID = "SELECT `Socket` FROM `user_info` WHERE `ID_User` = '"+data.ID_Player+"' OR `ID_User` ='"+data.ID_User+"'";
	db_all_user.query(playerID,function (error,rows) {
		if (!!error){DetailError = ('GetFriend.js: query Socket R_ACCEPT_FRIEND '+data.playerID);functions.WriteLogError(DetailError,2);}
		if (rows!=undefined) {
			if (rows[0].Socket!=null) {io.to(rows[0].Socket).emit('R_ACCEPT_FRIEND',{R_ACCEPT_FRIEND:data.ID_User});}
			if (rows[1].Socket!=null) {io.to(rows[1].Socket).emit('R_ACCEPT_FRIEND',{R_ACCEPT_FRIEND:data.Player});}
			
		}
	});

	removeAddFriendWaitTime (data);
	//add Redis Data
	friendData.SetFriendData(data.ID_User);
	friendData.SetFriendData(data.ID_Player);

	removeTimeoutUnfriend (data)
}

function removeAddFriendWaitTime (data) {
	var stringAddFriend1= data.ID_User+"_"+data.ID_Player;
	var stringAddFriend2= data.ID_Player+"_"+data.ID_User;
	if (DictTimeOutAddFriend[stringAddFriend1]!=undefined) {
		clearTimeout(DictTimeOutAddFriend[stringAddFriend1]);
		delete DictTimeOutAddFriend[stringAddFriend1];
	}
	if (DictTimeOut[stringAddFriend2]!=undefined) {
		clearTimeout(DictTimeOutAddFriend[stringAddFriend2]);
		delete DictTimeOutAddFriend[stringAddFriend2];
	}
}

function removeTimeoutUnfriend (data) {
	var stringUnfriend1 = data.ID_User+"_"+data.ID_Player;
	var stringUnfriend2 = data.ID_Player+"_"+data.ID_User;

	if (DictTimeOutUnFriend[stringUnfriend1]!=null) {clearTimeout(DictTimeOutUnFriend[stringUnfriend1]);}
	if (DictTimeOutUnFriend[stringUnfriend2]!=null) {clearTimeout(DictTimeOutUnFriend[stringUnfriend2]);}
}

function S_UNFRIEND (io,data) {
	timeOut = functions.GetTime()+timeUnfriend;
	var timeUnfriendData = functions.ImportTimeToDatabase(new Date(timeOut).toISOString());

	functions.ShowLog(functions.ShowLogBool.Clear,'GetFriend.js S_UNFRIEND timeOut,timeUnfriendData',[timeOut,timeUnfriendData]);

	var stringQuery ="UPDATE `"+data.ID_User+"` SET `RemoveTime`='"+timeUnfriendData+"' WHERE `ID_Player`='"+data.ID_Player+"';"+
	"UPDATE `"+data.ID_Player+"` SET `RemoveTime`='"+timeUnfriendData+"' WHERE `ID_Player`='"+data.ID_User+"'";

	functions.ShowLog(functions.ShowLogBool.Clear,'GetFriend.js S_UNFRIEND stringQuery',[stringQuery]);

	db_friend.query(stringQuery,function (error,result) {
		if (!!error){
			functions.ShowLog(functions.ShowLogBool.Error,'GetFriend.js S_UNFRIEND stringQuery',[stringQuery]);
		}
		
		var playerID = "SELECT `Socket` FROM `user_info` WHERE `ID_User` = '"+data.ID_Player+"' OR `ID_User` = '"+data.ID_User+"'";
		
		db_all_user.query(playerID,function (error,rows) {
			if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'GetFriend.js S_UNFRIEND stringQuery',[stringQuery]);}
			if (rows[0].Socket!=null) {io.to(rows[0].Socket).emit('R_UNFRIEND',{R_UNFRIEND:data.ID_User});}
			if (rows[1].Socket!=null) {io.to(rows[1].Socket).emit('R_UNFRIEND',{R_UNFRIEND:data.ID_Player});}
		});
	});
	
	var stringUnfriend1 = data.ID_User+"_"+data.ID_Player;
	var stringUnfriend2 = data.ID_Player+"_"+data.ID_User;

	functions.ShowLog(functions.ShowLogBool.Clear,'GetFriend.js S_UNFRIEND=>deleteUnfriendData stringUnfriend1,stringUnfriend2,data.ID_User,data.ID_Player,timeUnfriend',[stringUnfriend1,stringUnfriend2,data.ID_User,data.ID_Player,timeUnfriend]);
	deleteUnfriendData (io,stringUnfriend1,data.ID_User,data.ID_Player,timeUnfriend);
	deleteUnfriendData (io,stringUnfriend2,data.ID_Player,data.ID_User,timeUnfriend);
}

function deleteUnfriendData (io,stringUnfriend,ID_User,ID_Player,timeOutUnfriend) {
	functions.ShowLog(functions.ShowLogBool.Clear,'GetFriend.js deleteUnfriendData stringUnfriend,ID_User,ID_Player,timeOutUnfriend',[stringUnfriend,ID_User,ID_Player,timeOutUnfriend]);
	if (timeOutUnfriend<=0) {timeOutUnfriend=0;}
	
	DictTimeOutUnFriend[stringUnfriend]= setTimeout(function (io,stringUnfriend,ID_User,ID_Player) {


		var unfriend = "SELECT * FROM `"+ID_User+"` WHERE `ID_Player`= '"+ID_Player+"'";
		db_friend.query(unfriend, function (error,rows) {
			if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'GetFriend.js deleteUnfriendData unfriend 230',[unfriend]);}			
			if (rows[0].RemoveTime!=null) {
				functions.ShowLog(functions.ShowLogBool.Clear,'GetFriend.js deleteUnfriendData=>removeValueFriend ID_User,ID_Player',[ID_User,ID_Player]);
				removeValueFriend (ID_User,ID_Player);

				var currentTime = functions.GetTime();
				var databaseTime = new Date(functions.ExportTimeDatabase(rows[0].RemoveTime)).getTime();
				if (databaseTime<=currentTime) {
					var deleteString = "DELETE FROM `"+ID_User+"` WHERE `ID_Player`= '"+ID_Player+"'";
					db_friend.query(deleteString,function (error,result) {
						if (!!error){DetailError = ('GetFriend.js: deleteUnfriendData '+ID_User+"_"+ID_Player);functions.WriteLogError(DetailError,2);}
						LogChange='GetFriend.js: deleteUnfriendData: '+ID_User+"_"+ID_Player;functions.LogChange(LogChange,1);
					});

					var socketPlayer = "SELECT `Socket` FROM `user_info` WHERE `ID_User`='"+ID_User+"'";
					db_all_user.query(socketPlayer,function (error,rows) {
						if (!!error){DetailError = ('GetFriend.js: socketPlayer ' + socketPlayer);functions.WriteLogError(DetailError,2);}
						if (rows!=undefined) {
							if (rows[0].Socket!=null) {
								io.to(rows[0].Socket).emit('R_UNFRIEND',{R_UNFRIEND: ID_Player});
							}
						}
					});	
					delete DictTimeOutUnFriend[stringUnfriend];

				}else{
					var nextTimeOut = databaseTime-currentTime;
					if (nextTimeOut<0) {
						nextTimeOut = 0;
					}
					deleteUnfriendData (io,stringUnfriend,ID_User,ID_Player,nextTimeOut);
				}
			}else{
				var deleteString = "DELETE FROM `"+ID_User+"` WHERE `ID_Player`= '"+ID_Player+"'";
				db_friend.query(deleteString,function (error,result) {
					if (!!error){DetailError = ('GetFriend.js: deleteUnfriendData '+ID_User+"_"+ID_Player);functions.WriteLogError(DetailError,2);}
					LogChange='GetFriend.js: deleteUnfriendData: '+ID_User+"_"+ID_Player;functions.LogChange(LogChange,1);
				});
			}
		});

	}, timeOutUnfriend, io,stringUnfriend,ID_User,ID_Player);
}

function removeValueFriend (stringKey,ID_Key) {
	var stringHkey = "all_friends"
	functions.ShowLog(functions.ShowLogBool.Clear,'GetFriend.js removeValueFriend stringHkey,stringKey,ID_Key',[stringHkey,stringKey,ID_Key]);
	client.hget(stringHkey,stringKey,function (error,rows) {
		if (rows!=null) {
			var result = rows.split("/").filter(String);
			if (result.includes(ID_Key.toString())) {
				var stringReplace = rows.replace(ID_Key+"/","");
				client.hset(stringHkey,stringKey,stringReplace);
				if (stringReplace.length==0) {
					client.hdel(stringHkey,stringKey);
				}
			}
		}

	});

}
exports.GetFriendInfo = function getFriendInfo2 (socket,ID_User) {
	getFriendInfo (socket,ID_User);
}

function getFriendInfo (socket,ID_User) {
	var stringQuery = "SELECT * FROM `"+ID_User+"`";
	db_friend.query(stringQuery,function (error,rows) {
		if (!!error){DetailError = ('GetFriend.js: GetFriendInfo '+ID_User);functions.WriteLogError(DetailError,2);}
		if (rows[0]!=undefined) {
			var currentTime = functions.GetTime();
			if (rows[0].AcceptTime!=null) {
				rows[0].AcceptTime = (functions.ExportTimeDatabase(rows[0].AcceptTime) - currentTime)*0.001;
			}
			if (rows[0].RemoveTime!=null) {
				rows[0].RemoveTime = (functions.ExportTimeDatabase(rows[0].RemoveTime) - currentTime)*0.001;
			}
			// console.log(rows)
			socket.emit('R_FRIEND_INFO',{R_FRIEND_INFO:rows});
		}else {
			socket.emit('R_FRIEND_INFO',{R_FRIEND_INFO:[]});
		}


	});
}
exports.UpdateDatabase = function () {
	updateDatabase ();
}
// updateDatabase ();
function updateDatabase () {
	var queryString = "SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'all_friends' AND TABLE_NAME <> 'friends'";
	db_friend.query(queryString,function (error,rows) {
		if (rows!=undefined) {
			for (var i = 0; i < rows.length; i++) {
				tableQuery=rows[i].TABLE_NAME;
				queryTableString = "SELECT * FROM `"+tableQuery+"`";
				// console.log('tableQuery: '+tableQuery)
				queryTableUpdate (queryTableString,tableQuery);				
			}
		}
	});
}

function queryTableUpdate (queryTableString,tableQuery) {
	db_friend.query(queryTableString,function (error,rows) {
		if (rows!=undefined) {
			for (var i = 0; i < rows.length; i++) {
				
				var rowData = rows[i];
				rowData.ID_User = tableQuery;

				if (rows[i].AcceptTime !=null) {				
					updateAcceptTime(rowData);
				}

				if (rows[i].RemoveTime !=null) {
					updateRemoveTime (rowData);
				}
			}
		}
	});
}

function updateAcceptTime (rowdata,tableQuery) {
	var currentTime = functions.GetTime();
	var databaseTime = new Date(functions.ExportTimeDatabase(rowdata.AcceptTime)).getTime();
	// console.log('tableQuery: '+tableQuery)
	if (currentTime<=databaseTime) {
		removeAddFriend (rowdata.ID_User,rowdata.ID_Player);
	}else{
		timeOut = databaseTime-currentTime;
		setTimeoutAddFriend (data,timeOut);
	}
}

function updateRemoveTime (rowdata) {
	var currentTime = functions.GetTime();
	var databaseTime = new Date(functions.ExportTimeDatabase(rowdata.RemoveTime)).getTime();

	if (currentTime<=databaseTime) {
		removeAddFriend (rowdata.ID_User,rowdata.ID_Player);
	}else{
		timeOut = databaseTime-currentTime;
		var stringUnfriend1 = rowdata.ID_User+"_"+rowdata.ID_Player;
		var stringUnfriend2 = rowdata.ID_Player+"_"+rowdata.ID_User;
		deleteUnfriendData (null,stringUnfriend1,rowdata.ID_User,rowdata.ID_Player,timeOut);
		deleteUnfriendData (null,stringUnfriend2,rowdata.ID_Player,rowdata.ID_User,timeOut);		
	}

}