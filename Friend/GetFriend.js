'use strict';

var db_friend		= require('./../Util/Database/Db_all_friend.js');
var db_all_user		= require('./../Util/Database/Db_all_user.js');
var functions 		= require('./../Util/Functions.js');

var DetailError, LogChange;

var Dict

var data ={
	ID_User: 	9,
	ID_Player: 10, 
}
var timeAccept 		= 24*60*60*60*1000;
var timeUnfriend 	= 8*60*60*60*1000;
var timeOut;
var DictTimeOut={};

//S_ADD_FRIEND (data)
function S_ADD_FRIEND (data) {
	timeOut = functions.GetTime()+timeAccept;
	var stringQuery = "INSERT INTO `"+data.ID_User+"` (`ID_Player`, `AcceptTime`) VALUES ("+
	"'"+data.ID_Player+"',"+
	"'"+functions.ImportTimeToDatabase(new Date(timeOut).toISOString())+"');"+
	"INSERT INTO `"+data.ID_Player+"` (`ID_Player`, `AcceptTime`) VALUES ("+
	"'"+data.ID_User+"',"+
	"'"+functions.ImportTimeToDatabase(new Date(timeOut).toISOString())+"');";
	
	db_friend.query(stringQuery, function (error,result) {
		console.log(error);
		setTimeoutAddFriend (data,timeOut);
	});
}

function setTimeoutAddFriend (data,timeOut) {
	setTimeout(function (data) {
		var stringQuery = "SELECT * FROM `9` WHERE `ID_Player`="+data.ID_Player;
		//console.log(stringQuery);
		db_friend.query(stringQuery, function (error,rows) {
			if (rows!=undefined) {
				if (rows[0].AcceptTime!=null) {
					var databaseTime = new Date(functions.ExportTimeDatabase(rows[0].AcceptTime)).getTime();
					var currentTime = functions.getTime();
					if (databaseTime<=currentTime) {
						removeAddFriend (data);
					}
				}
			}
		});
	}, timeOut, data);
}

function removeAddFriend (data) {
	var stringQuery = "DELETE FROM `"+data.ID_User+"` WHERE `ID_Player`="+data.ID_Player+
	";DELETE FROM `"+data.ID_Player+"` WHERE `ID_Player`="+data.ID_User;
	db_friend.query(stringQuery,function (error,result) {
		console.log(error);
	});
}

function S_ACCEPT_FRIEND(socket,data){
	var stringQuery = "UPDATE `"+data.ID_User+"` SET `AcceptTime`=null,`RemoveTime`=null ;"+
	"UPDATE `"+data.ID_Player+"` SET `AcceptTime`=null,`RemoveTime`=null;";
	db_friend.query(stringQuery,function (error,result) {
		console.log(error);
		var playerID = "SELECT `Socket` FROM `user_info` WHERE `ID_User` = "+data.ID_Player;
		db_all_user.query(playerID,function (error,rows) {
			if (rows!=undefined) {
				socket.socket(rows[0].Socket).emit('R_ACCEPT_FRIEND',{R_ACCEPT_FRIEND:data.ID_User});
			}
		});		
	});

}

function S_UNFRIEND (data) {
	timeOut = functions.GetTime()+timeUnfriend;
	var timeUnfriendData = functions.ImportTimeToDatabase(new Date(timeOut).toISOString());
	var stringQuery ="UPDATE `"+data.ID_User+"` SET `RemoveTime`="+timeUnfriendData+
	";UPDATE `"+data.ID_Player+"` SET `RemoveTime`="+timeUnfriendData+";";
	db_friend.query(stringQuery,function (error,result) {
		var stringUnfriend1 = data.ID_User+"_"+data.ID_Player;
		var stringUnfriend2 = data.ID_Player+"_"+data.ID_User;

		DictTimeOut[stringUnfriend1] = setTimeout(function (data) {
			var unfriend = "SELECT * FROM `"+data.ID_User+"` WHERE `ID_Player`= "+data.ID_Player;
			db_friend.query(unfriend, function (error,rows) {
				if (rows!=undefined) {
					if (rows[0].RemoveTime!=null) {
						var delete = "DELETE FROM `"+data.ID_User+"` WHERE `ID_Player`= "+data.ID_Player;
						db_friend.query(delete,function (error,result) {
							console.log(error)
						});
					}
				}
				delete DictTimeOut[stringUnfriend1];
			});
		}, timeOut, data);

		DictTimeOut[stringUnfriend2] = setTimeout(function (data) {
			var unfriend = "SELECT * FROM `"+data.ID_Player+"` WHERE `ID_Player`= "+data.ID_User;
			db_friend.query(unfriend, function (error,rows) {
				if (rows!=undefined) {
					if (rows[0].RemoveTime!=null) {
						var delete = "DELETE FROM `"+data.ID_Player+"` WHERE `ID_Player`= "+data.ID_User;
						db_friend.query(delete,function (error,result) {
							console.log(error)
						});
					}
				}
				delete DictTimeOut[stringUnfriend2];
			});
		}, timeOut, data);

	});
}