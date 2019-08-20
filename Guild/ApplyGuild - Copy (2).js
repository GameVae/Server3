'use strict';
var db_all_user			= require('./../Util/Database/Db_all_user.js');
var db_all_guild		= require('./../Util/Database/Db_all_guild.js');

var functions 			= require('./../Util/Functions.js');

var Promise 			= require('promise');
var DetailError, LogChange;

var DictTimeOut ={};
var EnumApplyGuild={};
var stringTimeOut;

var timeAccept 		= 24*60*60*1000;

var redis = require('redis');
var client = redis.createClient();
client.select(functions.RedisData.TestUnit);

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
exports.S_APPLY_GUILD = function s_apply_guild (io,socket,data) {
	checkCurrentGuild (io,socket,data,function (checkGuildBool) {
		if (checkGuildBool==true) {
			//console.log('chua co guild');
			applyGuild (io,data);
		}
	});	
}

function checkCurrentGuild (io,socket,data,checkGuildBool) {
	var returnBool = false;
	var currentGuildBool = false;
	var guildApplyBool = false;
	
	new Promise((resolve,reject)=>{
		var stringQuery = "SELECT `Guild_ID` FROM `game_info_s"+data.Server_ID+"` WHERE `ID_User`='"+data.ID_User+"'";
		db_all_user.query(stringQuery,function (error,rows) {
			if (!!error){DetailError = ('ApplyGuild.js: checkCurrentGuild_stringQuery: '+ stringQuery);functions.WriteLogError(DetailError,2);}
			if (rows[0].Guild_ID!=null) {
				currentGuildBool = true;
				EnumApplyGuild.Enum = 2;
				EnumApplyGuild.Message = "User Have Guild -> Not Apply";
				//console.log('have guild');
			}
			resolve();
		});
	}).then(()=>new Promise((resolve,reject)=>{		
		var stringGuildApply = "SELECT `ID_User` FROM `all_guilds`.`"+data.Guild_ID+"` WHERE `ID_User`='"+data.ID_User+"'";
		db_all_guild.query(stringGuildApply,function (error,rows) {	
			if (!!error){DetailError = ('ApplyGuild.js: checkCurrentGuild_stringGuildApply: '+ stringGuildApply);functions.WriteLogError(DetailError,2);}
			if(rows.length>0){
				guildApplyBool=true;
				EnumApplyGuild.Enum = 3;
				EnumApplyGuild.Message = "Already Apply This Guild";				
				//console.log('da apply guild')
			}
			resolve();
		});

	}).then(()=>{
		if (currentGuildBool==false&&guildApplyBool==false) {
			returnBool=true; 
			EnumApplyGuild.Enum = 1;
			EnumApplyGuild.Message = "Apply Guild Success";
		}
		// io.socket.emit('R_APPLY_GUILD',{R_APPLY_GUILD:EnumApplyGuild});
		socket.emit('R_APPLY_GUILD',{R_APPLY_GUILD:EnumApplyGuild});
		checkGuildBool(returnBool);
	}));
}
function applyGuild (io,data) {
	var stringGetUserInfo = "SELECT * FROM `game_info_s"+data.Server_ID+"` WHERE `ID_User` = '"+data.ID_User+"'";
	var timeOutApply = functions.GetTime()+timeAccept;
	db_all_user.query(stringGetUserInfo,function (error,rows) {
		data.Might  = rows[0].Might;
		data.Killed = rows[0].Killed;
		data.NameInGame = rows[0].NameInGame;
		data.AcceptTime = timeAccept;
		//console.log(data)
		var stringInsertApply = "INSERT INTO `"+data.Guild_ID+"`(`ID_User`, `NameInGame`, `Might`, `Killed`, `AcceptTime`) VALUES ('"
		+data.ID_User+"','"
		+data.NameInGame+"','"
		+data.Might+"','"
		+data.Killed+"','"
		+functions.ImportTimeToDatabase(new Date(timeOutApply).toISOString())+"')";

		db_all_guild.query(stringInsertApply,function (error,result) {
			if (!!error){DetailError = ('ApplyGuild.js: applyGuild: '+ stringInsertApply);functions.WriteLogError(DetailError,2);}
			sendApplyToGuildMember (io,data);
		});
		setTimeAccept(timeAccept,data,1);		
	});	
}

function sendApplyToGuildMember (io,data) {
	var stringQuery = "SELECT `ID_User` FROM `"+data.Guild_ID+"`";
	// console.log(stringQuery);
	db_all_guild.query(stringQuery,function (error,rows) {
		if (!!error){DetailError = ('ApplyGuild.js: sendApplyToGuildMember: '+ stringQuery);functions.WriteLogError(DetailError,2);}
		if (rows.length>0) {
			for (var i = 0; i < rows.length; i++) {
				R_APPLY (io,rows[i],data);
			}
		}
	});
}

function R_APPLY (io,row,data) {
	// console.log(data.ID_User)
	var stringQuery = "SELECT `io` FROM `user_info` WHERE `ID_User`='"+row.ID_User+"'";
	db_all_user.query(stringQuery,function (error,rows) {
		if (!!error){DetailError = ('ApplyGuild.js: sendApplyToGuildMember: '+ stringQuery);functions.WriteLogError(DetailError,2);}
		if (rows[0].io!=null) {
			io.to(rows[0].Socket).emit('R_APPLY',{R_APPLY: data});
			// io.broadcast.to(rows[0].io).emit('R_APPLY',{R_APPLY:data});
		}
	});
}

function setTimeAccept (timeOutApply,data,enumTime) {
	var stringTimeOut = data.ID_User+"_"+data.Guild_ID+"_"+enumTime;
	DictTimeOut[stringTimeOut] = setTimeout(function (data){
		var stringCheckGuild = "SELECT * FROM `"+data.Guild_ID+"` WHERE `ID_User`='"+data.ID_User+"'";
		db_all_guild.query(stringCheckGuild, function (error,rows) {
			if (!!error){DetailError = ('ApplyGuild.js: setTimeAccept: '+ stringCheckGuild);functions.WriteLogError(DetailError,2);}
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
	var stringSelect = "SELECT `RemoveTime` FROM `"+Guild_ID+"` WHERE `ID_User`='"+ID_User+"'";
	var stringDelete;
	db_all_guild.query(stringSelect,function (error,rows) {
		if (rows[0].RemoveTime!=null) {
			stringDelete ="UPDATE `"+Guild_ID+"` SET `AcceptTime` = NULL WHERE `ID_User`='"+ID_User+"'";
		}else{
			stringDelete = "DELETE FROM `"+Guild_ID+"` WHERE `ID_User`='"+ID_User+"'";		
		}
		db_all_guild.query(stringDelete, function (error,result) {
			if (!!error){DetailError = ('ApplyGuild.js: deleteApply: '+ stringDelete);functions.WriteLogError(DetailError,2);}
			LogChange = 'ApplyGuild.js: deleteApply: '+stringDelete;functions.LogChange(LogChange,2);
		});
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
				if (!!error){DetailError = ('ApplyGuild.js: updateRemoveTime: '+ stringDelete);functions.WriteLogError(DetailError,2);}
				LogChange = 'ApplyGuild.js: updateRemoveTime: '+stringDelete;functions.LogChange(LogChange,2);
			});

			getUserServerID (data.ID_User,function (returnServer){
				var stringUpdateUserInfo = "UPDATE `game_info_s"+returnServer+"` SET `LastGuildID`=null WHERE `ID_User`='"+data.ID_User+"' AND `LastGuildID`='"+data.Guild_ID+"'";
				db_all_user.query(stringUpdateUserInfo,function (error,result) {
					if (!!error){DetailError = ('ApplyGuild.js: stringUpdateUserInfo: '+ stringUpdateUserInfo);functions.WriteLogError(DetailError,2);}
					LogChange = 'ApplyGuild.js: stringUpdateUserInfo: '+stringUpdateUserInfo;functions.LogChange(LogChange,2);
				});
			});
		}
	}
}
function getUserServerID (dataID_User,returnServer) {
	var stringQueryUser = "SELECT `Server_ID` FROM `user_info` WHERE `ID_User`='"+dataID_User+"'";
	db_all_user.query(stringQueryUser, function (error,rows) {
		if (!!error){DetailError = ('ApplyGuild.js: getUserServerID: '+ stringQueryUser);functions.WriteLogError(DetailError,2);}
		returnServer(rows[0].Server_ID)
	});
}

var dataAcceptApply={
	ID_User: 	9,
	ID_Apply: 	42,
	Guild_ID: 	13,
}

exports.S_ACCEPT_APPLY = function s_accept_apply (io,data) {
	checkGuildPosition (data,function (checkBool) {
		//console.log('checkBool: '+checkBool)		
		if (checkBool) {
			updateGuildAccept (data);
			updateApplyPlayer (io,data);
		}
	});
}

function updateApplyPlayer (io,data) {
	new Promise((resolve,reject)=>{
		var getGuildName = "SELECT `GuildName` FROM `guild_info` WHERE `Guild_ID`='"+data.Guild_ID+"'";
		db_all_guild.query(getGuildName,function (error,rows) {
			if (!!error){DetailError = ('ApplyGuild.js: updateApplyPlayer: '+ getGuildName);functions.WriteLogError(DetailError,2);}
			data.GuildName = rows[0].GuildName;
			resolve();
		});
	}).then(()=>{
		return new Promise((resolve,reject)=>{
			getUserServerID(data.ID_Apply,function (returnServer){
				var stringUpdateUser = "UPDATE `game_info_s'"+returnServer+"'` SET `Guild_ID`='"+data.Guild_ID+"',`Guild_Name`='"+data.GuildName+"',`LastGuildID`=null";
				db_all_user.query(stringUpdateUser,function (error,result) {
					if (!!error){DetailError = ('ApplyGuild.js: stringUpdateUser: '+ stringUpdateUser);functions.WriteLogError(DetailError,2);}
					LogChange = 'ApplyGuild.js: stringUpdateUser: '+stringUpdateUser;functions.LogChange(LogChange,2);
					
					resolve();
				});
			});
		})
	}).then(()=>{
		return new Promise((resolve,reject)=>{
			sendUserInfo (io,data);
			resolve();
		})
	})
	new Promise((resolve,reject)=>{
		var getGuildName = "SELECT `GuildName` FROM `guild_info` WHERE `Guild_ID`='"+data.Guild_ID+"'";
		db_all_guild.query(getGuildName,function (error,rows) {
			if (!!error){DetailError = ('ApplyGuild.js: updateApplyPlayer: '+ getGuildName);functions.WriteLogError(DetailError,2);}
			data.GuildName = rows[0].GuildName;
			resolve();
		});
	}).then(new Promise((resolve,reject)=>{
		getUserServerID(data.ID_Apply,function (returnServer){
			var stringUpdateUser = "UPDATE `game_info_s'"+returnServer+"'` SET `Guild_ID`='"+data.Guild_ID+"',`Guild_Name`='"+data.GuildName+"',`LastGuildID`=null";
			db_all_user.query(stringUpdateUser,function (error,result) {
				if (!!error){DetailError = ('ApplyGuild.js: stringUpdateUser: '+ stringUpdateUser);functions.WriteLogError(DetailError,2);}
				LogChange = 'ApplyGuild.js: stringUpdateUser: '+stringUpdateUser;functions.LogChange(LogChange,2);
				if (!!error) {console.log(error)};
			});
		});
	}).then(()=>{
		sendUserInfo (io,data);
		updateGuildMemberRedis (data.GuildID,data.ID_User)
	}));
	
}
function updateGuildMemberRedis (GuildID,data) {
	var stringHGuild = "all_guild";
	client.hset(stringHGuild,data.ID_User,GuildID);

}
function sendUserInfo (io,data) {
	var stringQueryGuildMember = "SELECT `ID_User` FROM `"+data.Guild_ID+"` WHERE `ID_User`<>'"+data.ID_Player+"'";
	db_all_guild.query(stringQueryGuildMember, function (error,rows) {
		if (!!error){DetailError = ('ApplyGuild.js: stringQueryGuildMember: '+ stringQueryGuildMember);functions.WriteLogError(DetailError,2);}
		for (var i = 0; i < rows.length; i++) {
			R_ACCEPT_APPLY (io,rows[i].ID_User);
		}
	});
}

function R_ACCEPT_APPLY (io,data) {
	var stringQuery = "SELECT `io` FROM `user_info` WHERE `ID_User`='"+data+"'";
	db_all_user.query(stringQuery,function (error,rows) {
		if (!!error){DetailError = ('ApplyGuild.js: R_ACCEPT_APPLY: '+ stringQuery);functions.WriteLogError(DetailError,2);}
		for (var i = 0; i < rows.length; i++) {
			io.to(rows[i].io).emit('R_ACCEPT_APPLY',{R_ACCEPT_APPLY:data});
		}
	});
}

function updateGuildAccept (data) {
	new Promise((resolve,reject)=>{
		getUserServerID (data.ID_Apply,function (returnServer) {
			var stringUserMight ="SELECT `Might` FROM `game_info_s"+returnServer+"` WHERE `ID_User`='"+data.ID_Apply+"'";
			db_all_user.query(stringUserMight,function (error, rows) {
				if (!!error){DetailError = ('ApplyGuild.js: updateGuildAccept_stringUserMight: '+ stringUserMight);functions.WriteLogError(DetailError,2);}
				data.Might = rows[0].Might;
				resolve();
			});
		});
	}).then(()=>{
		var updateGuild = "UPDATE `"+data.Guild_ID+"` SET `AcceptTime`= null,`RemoveTime`= null WHERE `ID_User`='"+data.ID_Apply+"';"
		+"UPDATE `guild_info` SET `Member`=`Member`+1,`Might`=`Might`+'"+data.Might+"' WHERE `Guild_ID`='"+data.Guild_ID+"';";
		var stringTimeOut =  data.ID_Apply+"_"+data.Guild_ID+"_1";
		// if (stringTimeOut in DictTimeOut){
		// 	clearTimeout(stringTimeOut);
		// 	delete DictTimeOut[stringTimeOut];
		// }
		if (DictTimeOut[stringTimeOut]!=undefined){
			clearTimeout(stringTimeOut);
			delete DictTimeOut[stringTimeOut];
		}
		db_all_guild.query(updateGuild,function (error,result) {
			if (!!error){DetailError = ('ApplyGuild.js: updateGuildAccept_updateGuild: '+ updateGuild);functions.WriteLogError(DetailError,2);}
			LogChange = 'ApplyGuild.js: updateGuildAccept_updateGuild: '+updateGuild;functions.LogChange(LogChange,2);
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
				if (!!error){DetailError = ('ApplyGuild.js: stringPlayerGuild: '+ stringPlayerGuild);functions.WriteLogError(DetailError,2);}
				if (rows_stringPlayerGuild[0].Guild_ID==null) {
					applyGuildBool=true;
				}else{
					//console.log('da co guild => xoa, clear timeout');
					deleteApply(data.Guild_ID,data.ID_Apply);
					var stringTimeOut =  data.ID_User+"_"+data.Guild_ID+"_1";
					if (DictTimeOut[stringTimeOut]!=undefined) {
						clearTimeout(stringTimeOut);
						delete DictTimeOut[stringTimeOut];
					}
					var dataRej ={
						ID_Reject: data.ID_Apply,
						Guild_ID: data.Guild_ID
					}
					sendReject (io,dataRej);
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
		if (!!error){DetailError = ('ApplyGuild.js: getGuildPosition: '+ stringQuery);functions.WriteLogError(DetailError,2);}
		position = rows[0].GuildPosition;
		returnPosition(position);
	});
}

var dataReject ={
	Server_ID: 1,
	ID_User: 9,
	ID_Reject: 42,
	Guild_ID: 13
}

exports.S_REJECT_APPLY = function s_reject_apply(io,data) {
	var positionBool = false;
	new Promise((resolve,reject)=>{
		getGuildPosition (data.Guild_ID,data.ID_User,function (returnPosition) {
			if (returnPosition>3) {
				positionBool=true;
				deleteApply(data.Guild_ID,data.ID_Reject);
				var stringTimeOut =  data.ID_User+"_"+data.Guild_ID+"_1";
				if (DictTimeOut[stringTimeOut]!=undefined) {
					clearTimeout(stringTimeOut);
					delete DictTimeOut[stringTimeOut];
				}
			}
			resolve();
		});
	}).then(()=>{
		if (positionBool==true) {
			sendReject (io,data);
		}
		
	});
}

function sendReject (io,data) {
	var stringQuery = "SELECT `ID_User` FROM `"+data.Guild_ID+"`";
	db_all_user.query(stringQuery,function (error,rows) {
		if (rows.length>0) {
			for (var i = 0; i < rows.length; i++) {				
				R_REJECT_APPLY (io,data,rows[i])
			}
		}
	});
	var stringHSocket = "s"+data.Server_ID+"_socket";
	client.hexists(stringHSocket,data.ID_Reject,function (error,resultBool) {
		if (resultBool == 1) {
			client.hget(stringHSocket,data.ID_Reject,function (error,rowsSocket) {
				io.to(rowsSocket).emit('R_REJECT_APPLY',{R_REJECT_APPLY:data});
			});
		}
	})
}

function R_REJECT_APPLY (io,data,row) {
	var stringQuery = "SELECT `Socket` FROM `user_info` WHERE `ID_User`='"+row.ID_User+"'";
	// var dataRe ={
	// 	ID_Reject: data.ID_Reject,
	// 	Guild_ID: data.Guild_ID
	// }
	db_all_user.query(stringQuery,function (error,rows) {
		if (!!error){DetailError = ('ApplyGuild.js: sendApplyToGuildMember: '+ stringQuery);functions.WriteLogError(DetailError,2);}
		if (rows[0].Socket!=null) {
			io.to(rows[0].Socket).emit('R_REJECT_APPLY',{R_REJECT_APPLY:data});
		}
	});
}
