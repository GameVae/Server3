'use strict';

var db_friend		= require('./../Util/Database/Db_all_friend.js');
var functions 		= require('./../Util/Functions.js');

var DetailError, LogChange;


var data ={
	ID_User: 	9,
	ID_Player: 10, 
}
var timeAccept = 24*60*60*60*1000;
var timeRemove = 8*60*60*60*1000;
var timeOut;
//S_ADD_FRIEND (data)
function S_ADD_FRIEND (data) {
	timeOut = functions.GetTime()+timeAccept;
	var stringQuery = "INSERT INTO `"+data.ID_User+"` (`ID_Player`, `AcceptTime`) VALUES ("+
	"'"+data.ID_Player+"',"+
	"'"+functions.ImportTimeToDatabase(new Date(timeOut).toISOString())+"')";
	
	db_friend.query(stringQuery, function (error,result) {
		console.log(error);
	});
}

function setTimeoutAddFriend (data,timeOut) {
	setTimeout(function (data) {
		var stringQuery = "SELECT * FROM `9` WHERE `ID_Player`="+data.ID_Player;
		//console.log(stringQuery);
		db_friend.query(stringQuery, function (error,rows) {
			if (rows!=undefined) {
				if (rows[0].AcceptTime!=null) {

				}
			}
		});
	}, timeOut, data);
}