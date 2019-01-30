'use strict';
var db_all_user			= require('./../Util/Database/Db_all_user.js');
var db_all_guild		= require('./../Util/Database/Db_all_guild.js');

var functions 			= require('./../Util/Functions.js');

var Promise 			= require('promise');
var DetailError, LogChange;

var DictTimeOut ={};
var EnumApplyGuild={};
var stringTimeOut;

var timeAccept 		= 8*60*60*60*1000;
var time
// var dataGuild ={
// 	GuildTag: 	'ABf',
// 	GuildName: 	'123456a',
// 	ID_User: 	9,
// 	Server_ID: 	1,
// }
// var dataApplication={
// 	ID_User: 	42,
// 	Guild_ID: 	13,
// 	Server_ID: 	1,
// }
exports.S_APPLY_GUILD = function s_apply_guild (socket,data) {
	checkCurrentGuild (socket,data,function (checkGuildBool) {
		if (checkGuildBool==false) {
			//console.log('chua co guild');
			applyGuild (socket,data);
		}
	});	
}

function applyGuild (socket,data) {
	var stringGetUserInfo = "SELECT * FROM `game_info_s"+data.Server_ID+"` WHERE `ID_User` = '"+data.ID_User+"'";
	var timeOutApply = functions.GetTime()+timeAccept;
	db_all_user.query(stringGetUserInfo,function (error,rows) {
		data.Might  = rows[0].Might;
		data.Killed = rows[0].Killed;
		data.NameInGame = rows[0].NameInGame;
		//console.log(data)
		var stringInsertApply = "INSERT INTO `"+data.Guild_ID+"`(`ID_User`, `NameInGame`, `Might`, `Killed`, `AcceptTime`) VALUES ('"
		+data.ID_User+"','"
		+data.NameInGame+"','"
		+data.Might+"','"
		+data.Killed+"','"
		+functions.ImportTimeToDatabase(new Date(timeOutApply).toISOString())+"')";

		db_all_guild.query(stringInsertApply,function (error,result) {
			if (!!error) {console.log(error)};
			sendApplyToGuildMember (socket,data);
		});
		setTimeAccept(timeAccept,data,1);		
	});	
}
function sendApplyToGuildMember (socket,data) {
	var stringQuery = "SELECT `ID_User` FROM `"+data.Guild_ID+"`";
	// console.log(stringQuery);
	db_all_guild.query(stringQuery,function (error,rows) {
		if (rows.length>0) {
			for (var i = 0; i < rows.length; i++) {
				getUserInfo (socket,rows[i],data);
			}
		}
	});
}
function getUserInfo (socket,row,data) {
	// console.log(data.ID_User)
	var stringQuery = "SELECT `Server_ID`,`Socket` FROM `user_info` WHERE `ID_User`='"+row.ID_User+"'";
	db_all_user.query(stringQuery,function (error,rows) {
		if (rows[0].Socket!=null) {
			socket.broadcast.to(rows[0].Socket).emit('R_APPLY',{R_APPLY:data});
		}
	});
}
function setTimeAccept (timeOutApply,data,enumTime) {
	var stringTimeOut =  data.ID_User+"_"+data.Guild_ID+"_"+enumTime;
	DictTimeOut[stringTimeOut] = setTimeout(function (data){
		var stringCheckGuild = "SELECT * FROM `"+data.Guild_ID+"` WHERE `ID_User`='"+data.ID_User+"'";
		
		db_all_guild.query(stringCheckGuild, function (error,rows) {
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
function updateAcceptTime (data,row,enumTime) {
	if (row.AcceptTime!=null) {
		var currentTime 	= functions.GetTime();
		var databaseTime 	= functions.ExportTimeDatabase(row.AcceptTime);
		
		if (databaseTime>currentTime) {
			var timeOut = databaseTime - currentTime;
			setTimeAccept (timeOut,data,enumTime);
		}else {
			deleteApply (data.Guild_ID,data.ID_User)	
		}
	}
}
function deleteApply (Guild_ID,ID_User) {
	var stringDelete = "DELETE FROM `"+Guild_ID+"` WHERE `ID_User`='"+ID_User+"'";
	db_all_guild.query(stringDelete, function (error,result) {
		if (!!error) {console.log(error)};
	});
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
				if (!!error) {console.log(error)};
			});

			getUserServerID (data.ID_User,function (returnServer){
				var stringUpdateUserInfo = "UPDATE `game_info_s"+returnServer+"` SET `LastGuildID`=null WHERE `ID_User`='"+data.ID_User+"' AND `LastGuildID`='"+data.Guild_ID+"'";
				db_all_user.query(stringUpdateUserInfo,function (error,result) {
					if (!!error) {console.log(error)};
				});
			});
		}
	}
}
function getUserServerID (dataID_User,returnServer) {
	var stringQueryUser = "SELECT `Server_ID` FROM `user_info` WHERE `ID_User`='"+dataID_User+"'";
	db_all_user.query(stringQueryUser, function (error,rows) {
		if (!!error) {console.log(error)};
		returnServer(rows[0].Server_ID)
	});
}
function checkCurrentGuild (socket,data,returnBool) {
	var returnBool = false;
	var currentGuildBool = false;
	var guildApplyBool = false;
	
	new Promise((resolve,reject)=>{
		var stringQuery = "SELECT `Guild_ID` FROM `game_info_s"+data.Server_ID+"` WHERE `ID_User`='"+data.ID_User+"'";
		db_all_user.query(stringQuery,function (error,rows) {
			if (rows[0].Guild_ID!=null) {
				currentGuildBool = true;
				EnumApplyGuild.Enum = 2;
				EnumApplyGuild.Message = "User Have Guild -> Not Apply";
				//console.log('have guild');
			}
			resolve();
		});
	}).then(

	new Promise((resolve,reject)=>{		
		var stringGuildApply = "SELECT `ID_User` FROM `all_guilds`.`"+data.Guild_ID+"` WHERE `ID_User`='"+data.ID_User+"'";
		db_all_guild.query(stringGuildApply,function (error,rows) {	
			if(rows.length>0){
				guildApplyBool=true;
				EnumApplyGuild.Enum = 3;
				EnumApplyGuild.Message = "Already Apply This Guild";				
				//console.log('da apply guild')
			}
			resolve();
		});

	}).then(()=>{
		if (currentGuildBool||guildApplyBool) {
			returnBool=true; 
			EnumApplyGuild.Enum = 1;
			EnumApplyGuild.Message = "Apply Guild Success";
		}
		socket.emit('R_APPLY_GUILD',{S_APPLY_GUILD:EnumApplyGuild});
		checkGuildBool(returnBool);
	}));
}

var dataAcceptApply={
	ID_User: 	9,
	ID_Apply: 	42,
	Guild_ID: 	13,
}
exports.S_ACCEPT_APPLY = function s_accept_apply (socket,data) {
	checkGuildPosition (data,function (checkBool) {
		//console.log('checkBool: '+checkBool)		
		if (checkBool) {
			updateGuildAccept (data);
			updateApplyPlayer (data);
		}
	});
}

function updateApplyPlayer (data) {
	new Promise((resolve,reject)=>{
		var getGuildName = "SELECT `GuildName` FROM `guild_info` WHERE `Guild_ID`='"+data.Guild_ID+"'";
		db_all_guild.query(getGuildName,function (error,rows) {
			data.GuildName = rows[0].GuildName;
			resolve();
		});
	}).then(new Promise((resolve,reject)=>{
		getUserServerID(data.ID_Apply,function (returnServer){
			var stringUpdateUser = "UPDATE `game_info_s'"+returnServer+"'` SET `Guild_ID`='"+data.Guild_ID+"',`Guild_Name`='"+data.GuildName+"',`LastGuildID`=null";
			db_all_user.query(stringUpdateUser,function (error,result) {
				if (!!error) {console.log(error)};
			});
		});
	}).then(()=>{
		sendUserInfo (socket,data);
	}));
	
}
function sendUserInfo (socket,data) {
	var stringQueryGuildMember = "SELECT `ID_User` FROM `"+data.Guild_ID+"` WHERE `ID_User`<>'"+data.ID_Player+"'";
	console.log(stringQueryGuildMember)
	db_all_guild.query(stringQueryGuildMember, function (error,rows) {
		console.log(rows);
		for (var i = 0; i < rows.length; i++) {
			R_ACCEPT_APPLY (socket,rows[i].ID_User);
		}
	});
}
function R_ACCEPT_APPLY (socket,data) {
	var stringQuery = "SELECT `Socket` FROM `user_info` WHERE `ID_User`='"+data+"'";
	db_all_user.query(stringQuery,function (error,rows) {
		for (var i = 0; i < rows.length; i++) {
			socket.broadcast.to(rows[i].Socket).emit('R_ACCEPT_APPLY',{R_ACCEPT_APPLY:data});
		}
	});
}
function updateGuildAccept (data) {
	new Promise((resolve,reject)=>{
		getUserServerID (data.ID_Apply,function (returnServer) {
			var stringUserMight ="SELECT `Might` FROM `game_info_s"+returnServer+"` WHERE `ID_User`='"+data.ID_Apply+"'";
			db_all_user.query(stringUserMight,function (error, rows) {
				if (!!error) {console.log(error)};
				data.Might = rows[0].Might;
				resolve();
			});
		});
	}).then(()=>{
		var updateGuild = "UPDATE `"+data.Guild_ID+"` SET `AcceptTime`= null,`RemoveTime`= null WHERE `ID_User`='"+data.ID_Apply+"';"
		+"UPDATE `guild_info` SET `Member`=`Member`+1,`Might`=`Might`+'"+data.Might+"' WHERE `Guild_ID`='"+data.Guild_ID+"';";
		console.log(updateGuild)
		var stringTimeOut =  data.ID_Apply+"_"+data.Guild_ID+"_1";
		if (stringTimeOut in DictTimeOut){
			clearTimeout(stringTimeOut);
			delete DictTimeOut[stringTimeOut];
		}
		db_all_guild.query(updateGuild,function (error,result) {
			if (!!error) {console.log(error)};
		});
	});
}
function checkGuildPosition (data,checkBool) {
	var returnBool = false;
	var positionBool = false;
	var applyGuildBool = false;
	// console.log(stringQuery);
	new Promise((resolve,reject)=>{
		getGuildPosition (data.Guild_ID,data.ID_User,function (returnPosition) {
			if (returnPosition>3) {
				positionBool = true;
			}
			resolve();
		});
	}).then(new Promise((resolve,reject)=>{
		getUserServerID (data.ID_Apply,function (returnServer) {
			var stringPlayerGuild = "SELECT `Guild_ID` FROM `game_info_s"+returnServer+"` WHERE `ID_User`='"+data.ID_Apply+"'";
			db_all_user.query(stringPlayerGuild,function (error,rows) {
				if (rows_stringPlayerGuild[0].Guild_ID==null) {
					applyGuildBool=true;
				}else{
					console.log('da co guild => xoa, clear timeout');
					deleteApply(data.Guild_ID,data.ID_Apply);
				}
				resolve();
			});
		});
	}).then(()=>{
		if (positionBool&&applyGuildBool) {returnBool = true;}
		checkBool(returnBool);
	}));
}
function getGuildPosition (Guild_ID,ID_User,returnPosition) {
	var position = 1;
	var stringQuery = "SELECT `GuildPosition` FROM `"+Guild_ID+"` WHERE `ID_User`='"+ID_User+"'";
	db_all_guild.query(stringQuery,function (error,rows) {
		if (!!error) {console.log(error)};
		position = rows[0].GuildPosition;
		returnPosition(position);
	});
}

