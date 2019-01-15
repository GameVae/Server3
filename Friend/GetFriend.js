'use strict';

var db_friend		= require('./../Util/Database/Db_all_friend.js');
var db_all_user		= require('./../Util/Database/Db_all_user.js');
var functions 		= require('./../Util/Functions.js');

var DetailError, LogChange;

// var data ={
// 	ID_User: 	9,
// 	ID_Player: 10, 
// }
var timeAccept 		= 24*60*60*60*1000;
var timeUnfriend 	= 8*60*60*60*1000;
var timeOut;
var DictTimeOut={};
var DictRemoveAddFriend={};
var tableQuery,queryTableString;

//S_ADD_FRIEND (data)

exports.Start = function start (io) {
	io.on('connection', function(socket){
		socket.on('S_ADD_FRIEND', function (data){
			S_ADD_FRIEND (socket,data);
		});
		socket.on('S_ACCEPT_FRIEND',function (data) {
			S_ACCEPT_FRIEND(socket,data);
		});
		socket.on('S_UNFRIEND',function (socket,data) {
			S_UNFRIEND(socket,data);
		});

	});
}

function S_ADD_FRIEND (socket,data) {
	timeOut = functions.GetTime()+timeAccept;
	var stringQuery = "INSERT INTO `"+data.ID_User+"` (`ID_Player`, `AcceptTime`) VALUES ("+
	"'"+data.ID_Player+"',"+
	"'"+functions.ImportTimeToDatabase(new Date(timeOut).toISOString())+"');"+
	"INSERT INTO `"+data.ID_Player+"` (`ID_Player`, `AcceptTime`) VALUES ("+
	"'"+data.ID_User+"',"+
	"'"+functions.ImportTimeToDatabase(new Date(timeOut).toISOString())+"');";
	
	db_friend.query(stringQuery, function (error,result) {
		if (!!error){DetailError = ('GetFriend.js: stringQuery ' + stringQuery);functions.WriteLogError(DetailError,1);}
		setTimeoutAddFriend (data,timeOut);
		var socketPlayer = "SELECT `Socket` FROM `user_info` WHERE `ID_User`="+data.ID_Player;
		db_all_user.query(socketPlayer,function (error,rows) {
			if (!!error){DetailError = ('GetFriend.js: socketPlayer ' + socketPlayer);functions.WriteLogError(DetailError,1);}
			if (rows!=undefined) {
				if (rows[0].Socket!=null) {
					socket.socket(rows[0].Socket).emit('R_ADD_FRIEND',{R_ADD_FRIEND: 	data.ID_User});
				}
			}
		});		
	});
}

function setTimeoutAddFriend (data,timeOut) {
	var stringAddFriend= data.ID_User+"_"+data.ID_Player;
	DictRemoveAddFriend[stringAddFriend]=setTimeout(function (data) {
		var stringQuery = "SELECT * FROM `"+data.ID_User+"` WHERE `ID_Player`="+data.ID_Player;
		db_friend.query(stringQuery, function (error,rows) {
			if (!!error){DetailError = ('GetFriend.js: setTimeoutAddFriend');functions.WriteLogError(DetailError,1);}
			if (rows!=undefined) {
				if (rows[0].AcceptTime!=null) {
					var databaseTime = new Date(functions.ExportTimeDatabase(rows[0].AcceptTime)).getTime();
					var currentTime = functions.getTime();
					if (databaseTime<=currentTime) {
						removeAddFriend (ID_User,ID_Player);
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
	var stringQuery = "DELETE FROM `"+ID_User+"` WHERE `ID_Player`="+ID_Player+";"+
	"DELETE FROM `"+ID_Player+"` WHERE `ID_Player`="+ID_User;
	db_friend.query(stringQuery,function (error,result) {
		if (!!error){DetailError = ('GetFriend.js: removeAddFriend '+ID_User);functions.WriteLogError(DetailError,1);}
		LogChange='GetFriend.js: removeAddFriend: '+ID_User;functions.LogChange(LogChange,1);
	});
}

function S_ACCEPT_FRIEND(socket,data){
	var stringQuery = "UPDATE `"+data.ID_User+"` SET `AcceptTime`=null,`RemoveTime`=null ;"+
	"UPDATE `"+data.ID_Player+"` SET `AcceptTime`=null,`RemoveTime`=null;";
	db_friend.query(stringQuery,function (error,result) {
		if (!!error){DetailError = ('GetFriend.js: S_ACCEPT_FRIEND '+data.ID_User);functions.WriteLogError(DetailError,1);}
		LogChange='GetFriend.js: removeAddFriend: '+data.ID_User;functions.LogChange(LogChange,1);

		var playerID = "SELECT `Socket` FROM `user_info` WHERE `ID_User` = "+data.ID_Player;
		db_all_user.query(playerID,function (error,rows) {
			if (!!error){DetailError = ('GetFriend.js: query Socket R_ACCEPT_FRIEND '+data.playerID);functions.WriteLogError(DetailError,1);}
			if (rows!=undefined) {
				if (rows[0].Socket!=null) {
					socket.socket(rows[0].Socket).emit('R_ACCEPT_FRIEND',{R_ACCEPT_FRIEND:data.ID_User});
				}
			}
		});		
	});
}

function S_UNFRIEND (socket,data) {
	timeOut = functions.GetTime()+timeUnfriend;
	var timeUnfriendData = functions.ImportTimeToDatabase(new Date(timeOut).toISOString());
	var stringQuery ="UPDATE `"+data.ID_User+"` SET `RemoveTime`="+timeUnfriendData+";"+
	"UPDATE `"+data.ID_Player+"` SET `RemoveTime`="+timeUnfriendData+";";
	db_friend.query(stringQuery,function (error,result) {
		if (!!error){DetailError = ('GetFriend.js: S_UNFRIEND '+data.ID_User+"_"+data.ID_Player);functions.WriteLogError(DetailError,1);}
		LogChange='GetFriend.js: S_UNFRIEND: '+data.ID_User+"_"+data.ID_Player;functions.LogChange(LogChange,1);

		var stringUnfriend1 = data.ID_User+"_"+data.ID_Player;
		var stringUnfriend2 = data.ID_Player+"_"+data.ID_User;
		deleteUnfriendData (stringUnfriend1,data.ID_User,data.ID_Player,timeOut);
		deleteUnfriendData (stringUnfriend2,data.ID_Player,data.ID_User,timeOut);

		var playerID = "SELECT `Socket` FROM `user_info` WHERE `ID_User` = "+data.ID_Player;
		db_all_user.query(playerID,function (error,rows) {
			if (!!error){DetailError = ('GetFriend.js: playerID '+playerID);functions.WriteLogError(DetailError,1);}
			if (rows!=undefined) {
				if (rows[0].Socket!=null) {
					socket.socket(rows[0].Socket).emit('R_UNFRIEND',{R_UNFRIEND:data.ID_User});
				}
			}
		});		
	});
}

function deleteUnfriendData (stringUnfriend,ID_User,ID_Player,timeOut) {
	DictTimeOut[stringUnfriend]= setTimeout(function (ID_User,ID_Player) {
		var unfriend = "SELECT * FROM `"+ID_User+"` WHERE `ID_Player`= "+ID_Player;
		db_friend.query(unfriend, function (error,rows) {
			if (rows!=undefined) {
				if (rows[0].RemoveTime!=null) {
					var currentTime = functions.getTime();
					var databaseTime = new Date(functions.ExportTimeDatabase(rows[0].RemoveTime)).getTime();
					if (databaseTime<=currentTime) {
						var deleteString = "DELETE FROM `"+ID_User+"` WHERE `ID_Player`= "+ID_Player;
						db_friend.query(deleteString,function (error,result) {
							if (!!error){DetailError = ('GetFriend.js: deleteUnfriendData '+ID_User+"_"+ID_Player);functions.WriteLogError(DetailError,1);}
							LogChange='GetFriend.js: deleteUnfriendData: '+ID_User+"_"+ID_Player;functions.LogChange(LogChange,1);
						});
						delete DictTimeOut[stringUnfriend];
					}else{
						var nextTimeOut = databaseTime-currentTime;
						deleteUnfriendData (stringUnfriend,ID_User,ID_Player,nextTimeOut);
					}
				}
			}
		});
	}, timeOut, ID_User,ID_Player);
}

exports.GetFriendInfo = function getFriendInfo (socket,ID_User) {
	var stringQuery = "SELECT * FROM `"+ID_User+"`";
	db_friend.query(stringQuery,function (error,rows) {
		if (!!error){DetailError = ('GetFriend.js: GetFriendInfo '+ID_User);functions.WriteLogError(DetailError,1);}
		socket.emit('R_FRIEND_INFO',{R_FRIEND_INFO:rows});
	});
}



exports.UpdateDatabase = function updateDatabase () {
	var queryString = "SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'all_friends' AND TABLE_NAME <> 'friends'";
	db_friend.query(queryString,function (error,rows) {
		if (rows!=undefined) {
			for (var i = 0; i < rows.length; i++) {
				tableQuery=rows[i].TABLE_NAME;
				queryTableString = "SELECT * FROM `"+tableQuery+"`";
				queryTableUpdate (queryTableString);				
			}
		}
	});
}

function queryTableUpdate (queryTableString) {
	db_friend.query(queryTableString,function (error,rows) {
		if (rows!=undefined) {
			for (var i = 0; i < rows.length; i++) {
				if (rows[i].AcceptTime!=null) {
					updateAcceptTime(rows[i]);
				}

				if (rows[i].RemoveTime !=null) {
					updateRemoveTime (rows[i]);
				}
			}
		}
	});
}

function updateAcceptTime (rowdata) {
	var currentTime = functions.getTime();
	var databaseTime = new Date(functions.ExportTimeDatabase(rowdata.AcceptTime)).getTime();

	if (currentTime<=databaseTime) {
		removeAddFriend (rowdata.ID_User,rowdata.ID_Player);
	}else{
		timeOut = databaseTime-currentTime;
		setTimeoutAddFriend (data,timeOut);
	}
}

function updateRemoveTime (rowdata) {
	var currentTime = functions.getTime();
	var databaseTime = new Date(functions.ExportTimeDatabase(rowdata.RemoveTime)).getTime();

	if (currentTime<=databaseTime) {
		removeAddFriend (rowdata.ID_User,rowdata.ID_Player)
	}else{

		timeOut = databaseTime-currentTime;
		var stringUnfriend1 = rowdata.ID_User+"_"+rowdata.ID_Player;
		var stringUnfriend2 = rowdata.ID_Player+"_"+rowdata.ID_User;
		deleteUnfriendData (stringUnfriend1,rowdata.ID_User,rowdata.ID_Player,timeOut);
		deleteUnfriendData (stringUnfriend2,rowdata.ID_Player,rowdata.ID_User,timeOut);
		
	}

}