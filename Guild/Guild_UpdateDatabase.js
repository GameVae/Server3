'use strict';
var db_all_user			= require('./../Util/Database/Db_all_user.js');
var db_all_guild		= require('./../Util/Database/Db_all_guild.js');

var functions 			= require('./../Util/Functions.js');

var Promise 			= require('promise');
var DetailError, LogChange;

var timeOut;
var DictTimeOut ={};

exports.UpdateDatabase = function updateDatabase () {
	var stringQuery = "SELECT `TABLE_NAME` FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='all_guilds' AND TABLE_NAME<>'guild_info' AND TABLE_NAME<>'guild'";
	db_all_guild.query(stringQuery,function (error,rows) {
		if (!!error){DetailError = ('Guild_UpdateData.js: updateDatabase: '+ stringQuery);functions.WriteLogError(DetailError,2);}
		if (rows.length>0) {
			for (var i = 0; i < rows.length; i++) {
				queryGuildData (rows[i].TABLE_NAME);
			}
		}
	});
}

function queryGuildData (data) {
	var stringGuild = "SELECT * FROM `"+data+"` WHERE `AcceptTime`<> 'null' OR `RemoveTime`<>'null'";
	var currentTime = functions.GetTime();
	var databaseTime;
	var timeOutApply=0;
	var dataInfo={};
	
	db_all_guild.query(stringGuild,function (error,rows) {
		if (!!error){DetailError = ('Guild_UpdateData.js: queryGuildData: '+ stringGuild);functions.WriteLogError(DetailError,2);}
		if (rows.length>0) {
			for (var i = 0; i < rows.length; i++) {

				if (rows[i].AcceptTime!=null) {
					dataInfo ={
						ID_User : rows[i].ID_User,
						Guild_ID: data
					}
					databaseTime = functions.ExportTimeDatabase(rows[i].AcceptTime);
					if (databaseTime>currentTime) {
						timeOutApply = databaseTime-currentTime;
					}
					setTimeAccept (timeOutApply,dataInfo,1);
				}

				if (rows[i].RemoveTime!=null) {
					dataInfo ={
						ID_User : rows[i].ID_User,
						Guild_ID: data
					}
					databaseTime = functions.ExportTimeDatabase(rows[i].RemoveTime);
					if (databaseTime>currentTime) {
						timeOutApply = databaseTime - currentTime;
					}
					setTimeAccept (timeOutApply,dataInfo,2);
				}
			}
		}
	});
}
function setTimeAccept (timeOutApply,data,enumTime) {
	//console.log(timeOutApply,data,enumTime)
	var stringTimeOut =  data.ID_User+"_"+data.Guild_ID+"_"+enumTime;
	DictTimeOut[stringTimeOut] = setTimeout (function (data){
		var stringCheckGuild = "SELECT * FROM `"+data.Guild_ID+"` WHERE `ID_User`='"+data.ID_User+"'";	
		db_all_guild.query(stringCheckGuild, function (error,rows) {
			if (!!error){DetailError = ('Guild_UpdateData.js: stringCheckGuild: '+ stringCheckGuild);functions.WriteLogError(DetailError,2);}
			if (rows.length>0) {
				switch (enumTime) {
					case 1:
					updateAcceptTime (data,rows[0],enumTime);
					break;
					case 2:
					updateRemoveTime (data,rows[0],enumTime);
					break;
				}
			}
		});		
		delete DictTimeOut[stringTimeOut];
	},timeOutApply,data,enumTime);
}
function sendToClient (socket,data,enumTime) {
	var queryGuild = "SELECT `ID_User` FROM `"+data.Guild_ID+"`";

}
function updateAcceptTime (data,row,enumTime) {
	if (row.AcceptTime!=null) {
		var currentTime 	= functions.GetTime();
		var databaseTime 	= functions.ExportTimeDatabase(row.AcceptTime);		
		if (databaseTime>currentTime) {
			var timeOut = databaseTime - currentTime;
			setTimeAccept (timeOut,data,enumTime);
		}else {
			var stringDelete = "DELETE FROM `"+data.Guild_ID+"` WHERE `ID_User`='"+data.ID_User+"'";
			db_all_guild.query(stringDelete, function (error,result) {
				if (!!error){DetailError = ('Guild_UpdateData.js: stringDelete: '+ stringDelete);functions.WriteLogError(DetailError,2);}
				LogChange = 'Guild_UpdateData.js: stringDelete: '+stringDelete;functions.LogChange(LogChange,2);
				if (!!error) {console.log(error)};
			});

		}
	}
}
function updateRemoveTime (data,row,enumTime) {
	if (row.RemoveTime!=null) {
		var currentTime 	= functions.GetTime();
		var databaseTime 	= functions.ExportTimeDatabase(row.RemoveTime);
		
		if (databaseTime>currentTime) {
			var timeOut = databaseTime - currentTime;
			setTimeAccept (timeOut,data,enumTime);
		}else {
			var stringDelete = "DELETE FROM `"+data.Guild_ID+"` WHERE `ID_User`='"+data.ID_User+"'";
			db_all_guild.query(stringDelete, function (error,result) {
				if (!!error){DetailError = ('Guild_UpdateData.js: updateRemoveTime: '+ stringDelete);functions.WriteLogError(DetailError,2);}
				LogChange = 'Guild_UpdateData.js: updateRemoveTime: '+stringDelete;functions.LogChange(LogChange,2);
			});
			
			var stringQueryUser = "SELECT `Server_ID` FROM `user_info` WHERE `ID_User`='"+data.ID_User+"'";
			db_all_user.query(stringQueryUser, function (error,rows) {
				if (!!error){DetailError = ('Guild_UpdateData.js: updateRemoveTime: '+ stringQueryUser);functions.WriteLogError(DetailError,2);}
				
				var stringUpdateUserInfo = "UPDATE `game_info_s"+rows[0].Server_ID+"` SET `LastGuildID`=null WHERE `ID_User`='"+data.ID_User+"'";
				db_all_user.query(stringUpdateUserInfo,function (error,result) {
					if (!!error){DetailError = ('Guild_UpdateData.js: stringUpdateUserInfo: '+ stringUpdateUserInfo);functions.WriteLogError(DetailError,2);}
					LogChange = 'Guild_UpdateData.js: stringUpdateUserInfo: '+stringUpdateUserInfo;functions.LogChange(LogChange,2);
				});
				//send socket? => client tu update
			});
		}
	}
}

