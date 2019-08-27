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
	functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js S_APPLY_GUILD=>checkCurrentGuild data',[data]);
	checkCurrentGuild (io,socket,data,function (checkGuildBool) {
		if (checkGuildBool==true) {
			//console.log('chua co guild');
			functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js S_APPLY_GUILD checkCurrentGuild=>applyGuild data',[data]);
			applyGuild (io,data);
		}
	});	
}

function checkCurrentGuild (io,socket,data,checkGuildBool) {
	var returnBool = false;
	var currentGuildBool = false;
	var guildApplyBool = false;
	functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js checkCurrentGuild data',[data]);

	new Promise((resolve,reject)=>{
		var stringQuery = "SELECT `Guild_ID` FROM `game_info_s"+data.Server_ID+"` WHERE `ID_User`='"+data.ID_User+"'";
		functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js checkCurrentGuild stringQuery',[stringQuery]);

		db_all_user.query(stringQuery,function (error,rows) {
			if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'ApplyGuild.js checkCurrentGuild stringQuery',[stringQuery]);}
			if (rows[0].Guild_ID!=null) {
				currentGuildBool = true;
				EnumApplyGuild.Enum = 2;
				EnumApplyGuild.Message = "User Have Guild -> Not Apply";
				//console.log('have guild');
			}
			functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js checkCurrentGuild currentGuildBool,EnumApplyGuild',[currentGuildBool,EnumApplyGuild]);
			resolve();
		});
	}).then(()=>new Promise((resolve,reject)=>{		

		var stringGuildApply = "SELECT `ID_User` FROM `all_guilds`.`"+data.Guild_ID+"` WHERE `ID_User`='"+data.ID_User+"'";
		functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js checkCurrentGuild stringGuildApply',[stringGuildApply]);
		
		db_all_guild.query(stringGuildApply,function (error,rows) {	
			if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'ApplyGuild.js checkCurrentGuild stringGuildApply',[stringGuildApply]);}
			if(rows.length>0){
				guildApplyBool=true;
				EnumApplyGuild.Enum = 3;
				EnumApplyGuild.Message = "Already Apply This Guild";				
				//console.log('da apply guild')
			}
			functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js checkCurrentGuild stringGuildApply,EnumApplyGuild',[stringGuildApply,EnumApplyGuild]);
			resolve();
		});

	}).then(()=>{
		if (currentGuildBool==false&&guildApplyBool==false) {
			returnBool=true; 
			EnumApplyGuild.Enum = 1;
			EnumApplyGuild.Message = "Apply Guild Success";
		}
		functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js checkCurrentGuild=>R_APPLY_GUILD currentGuildBool,guildApplyBool,returnBool',[stringGuildApply,guildApplyBool,returnBool]);
		// io.socket.emit('R_APPLY_GUILD',{R_APPLY_GUILD:EnumApplyGuild});
		socket.emit('R_APPLY_GUILD',{R_APPLY_GUILD:EnumApplyGuild});
		checkGuildBool(returnBool);
	}));
}
function applyGuild (io,data) {
	var stringGetUserInfo = "SELECT * FROM `game_info_s"+data.Server_ID+"` WHERE `ID_User` = '"+data.ID_User+"'";
	var timeOutApply = functions.GetTime()+timeAccept;

	functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js applyGuild data,stringGetUserInfo,timeOutApply',[data,stringGetUserInfo,timeOutApply]);
	
	db_all_user.query(stringGetUserInfo,function (error,rows) {
		if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'ApplyGuild.js applyGuild stringGetUserInfo',[stringGetUserInfo]);}
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

		functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js applyGuild stringInsertApply',[stringInsertApply]);

		db_all_guild.query(stringInsertApply,function (error,result) {
			if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'ApplyGuild.js applyGuild stringInsertApply',[stringInsertApply]);}
			functions.ShowLog(functions.ShowLogBool.Error,'ApplyGuild.js applyGuild=>sendApplyToGuildMember data',[data]);
			sendApplyToGuildMember (io,data);
		});
		functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js applyGuild=>setTimeAccept timeAccept,data,1',[timeAccept,data,1]);
		setTimeAccept(timeAccept,data,1);		
	});	
}

function sendApplyToGuildMember (io,data) {
	var stringQuery = "SELECT `ID_User` FROM `"+data.Guild_ID+"`";
	functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js sendApplyToGuildMember data',[data]);

	db_all_guild.query(stringQuery,function (error,rows) {
		if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'ApplyGuild.js sendApplyToGuildMember data',[data]);}
		if (rows.length>0) {
			for (var i = 0; i < rows.length; i++) {
				if (rows[i]!=null){
					functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js sendApplyToGuildMember=>R_APPLY data',[data]);
					R_APPLY (io,rows[i],data);
				}
			}
		}
	});
}

function R_APPLY (io,row,data) {
	var stringQuery = "SELECT `io` FROM `user_info` WHERE `ID_User`='"+row.ID_User+"'";
	functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js R_APPLY stringQuery',[stringQuery]);

	db_all_user.query(stringQuery,function (error,rows) {
		if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'ApplyGuild.js R_APPLY stringQuery',[stringQuery]);}
		if (rows[0].io!=null) {
			if (!!error){functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js R_APPLY emit data',[data]);}
			io.to(rows[0].Socket).emit('R_APPLY',{R_APPLY: data});
			// io.broadcast.to(rows[0].io).emit('R_APPLY',{R_APPLY:data});
		}
	});
}

function setTimeAccept (timeOutApply,data,enumTime) {
	var stringTimeOut = data.ID_User+"_"+data.Guild_ID+"_"+enumTime;
	functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js setTimeAccept timeOutApply,data,enumTime,stringTimeOut',[timeOutApply,data,enumTime,stringTimeOut]);

	DictTimeOut[stringTimeOut] = setTimeout(function (data){
		var stringCheckGuild = "SELECT * FROM `"+data.Guild_ID+"` WHERE `ID_User`='"+data.ID_User+"'";
		functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js setTimeAccept stringCheckGuild',[stringCheckGuild]);

		db_all_guild.query(stringCheckGuild, function (error,rows) {
			if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'ApplyGuild.js setTimeAccept stringCheckGuild',[stringCheckGuild]);}
			if (rows.length>0) {
				switch (enumTime) {
					case 1:
					functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js setTimeAccept=>updateAcceptTime data,rows[0],enumTime',[data,rows[0],enumTime]);
					updateAcceptTime (data,rows[0],enumTime);
					break;
					case 2:
					functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js setTimeAccept=>updateRemoveTime data,rows[0],enumTime',[data,rows[0],enumTime]);
					updateRemoveTime (data,rows[0],enumTime);
					break;
				}
			}
		});		
		delete DictTimeOut[stringTimeOut];
	},timeOutApply,data,enumTime);
}

function updateAcceptTime (data,row,enumTime) {
	functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js updateAcceptTime data,row,enumTime',[data,row,enumTime]);

	if (row.AcceptTime!=null) {
		var currentTime 	= functions.GetTime();
		var databaseTime 	= functions.ExportTimeDatabase(row.AcceptTime);
		functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js updateAcceptTime currentTime,databaseTime',[currentTime,databaseTime]);
		if (databaseTime>currentTime) {
			var timeOut = databaseTime - currentTime;
			functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js updateAcceptTime=>setTimeAccept',[timeOut,data,enumTime]);
			setTimeAccept (timeOut,data,enumTime);
		}else {
			functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js updateAcceptTime=>deleteApply data.Guild_ID,data.ID_User',[data.Guild_ID,data.ID_User]);
			deleteApply (data.Guild_ID,data.ID_User)	
		}
	}
}

function deleteApply (Guild_ID,ID_User) {
	var stringSelect = "SELECT `RemoveTime` FROM `"+Guild_ID+"` WHERE `ID_User`='"+ID_User+"'";
	var stringDelete;
	functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js deleteApply Guild_ID,ID_User,stringSelect',[Guild_ID,ID_User,stringSelect]);

	db_all_guild.query(stringSelect,function (error,rows) {
		if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'ApplyGuild.js deleteApply stringSelect',[stringSelect]);}
		if (rows[0].RemoveTime!=null) {
			stringDelete ="UPDATE `"+Guild_ID+"` SET `AcceptTime` = NULL WHERE `ID_User`='"+ID_User+"'";
		}else{
			stringDelete = "DELETE FROM `"+Guild_ID+"` WHERE `ID_User`='"+ID_User+"'";		
		}
		
		functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js deleteApply Guild_ID,ID_User,stringSelect',[Guild_ID,ID_User,stringSelect]);

		db_all_guild.query(stringDelete, function (error,result) {
			if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'ApplyGuild.js deleteApply stringDelete',[stringDelete]);}
			functions.ShowLog(functions.ShowLogBool.LogChange,'ApplyGuild.js deleteApply stringDelete',[stringDelete]);
		});
	});	
}

function updateRemoveTime (data,row,enumTime) {
	functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js updateRemoveTime data,row,enumTime',[data,row,enumTime]);
	
	if (row.RemoveTime!=null) {
		var currentTime 	= functions.GetTime();
		var databaseTime 	= functions.ExportTimeDatabase(row.RemoveTime);
		
		functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js updateRemoveTime data,row,enumTime',[data,row,enumTime]);
		if (databaseTime>currentTime) {
			var timeOut = databaseTime - currentTime;
			setTimeAccept (timeOut,data,enumTime);
		}else {
			var stringDelete = "DELETE FROM `"+data.Guild_ID+"` WHERE `ID_User`='"+data.ID_User+"'";
			functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js updateRemoveTime stringDelete',[stringDelete]);
			db_all_guild.query(stringDelete, function (error,result) {
				if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'ApplyGuild.js updateRemoveTime stringDelete',[stringDelete]);}
				functions.ShowLog(functions.ShowLogBool.LogChange,'ApplyGuild.js updateRemoveTime stringDelete',[stringDelete]);
			});

			functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js updateRemoveTime=>getUserServerID data.ID_User',[data.ID_User]);
			getUserServerID (data.ID_User,function (returnServer){
				var stringUpdateUserInfo = "UPDATE `game_info_s"+returnServer+"` SET `LastGuildID`=null WHERE `ID_User`='"+data.ID_User+"' AND `LastGuildID`='"+data.Guild_ID+"'";
				db_all_user.query(stringUpdateUserInfo,function (error,result) {
					if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'ApplyGuild.js updateRemoveTime getUserServerID stringUpdateUserInfo',[stringUpdateUserInfo]);}
					functions.ShowLog(functions.ShowLogBool.LogChange,'ApplyGuild.js updateRemoveTime getUserServerID stringUpdateUserInfo',[stringUpdateUserInfo]);
				});
			});
		}
	}
}
function getUserServerID (dataID_User,returnServer) {
	var stringQueryUser = "SELECT `Server_ID` FROM `user_info` WHERE `ID_User`='"+dataID_User+"'";
	functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js getUserServerID stringQueryUser,dataID_User',[stringQueryUser,dataID_User]);

	db_all_user.query(stringQueryUser, function (error,rows) {
		if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'ApplyGuild.js getUserServerID stringQueryUser',[stringQueryUser]);}
		functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js getUserServerID stringQueryUser,dataID_User',[stringQueryUser,dataID_User]);
		returnServer(rows[0].Server_ID)
	});
}

var dataAcceptApply={
	ID_User: 	9,
	ID_Apply: 	42,
	Guild_ID: 	13,
}

exports.S_ACCEPT_APPLY = function (io,data) {
	functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js S_ACCEPT_APPLY=>checkGuildPosition data',[data]);
	checkGuildPosition (data,function (checkBool) {
		//console.log('checkBool: '+checkBool)
		functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js checkGuildPosition checkBool',[checkBool]);
		if (checkBool) {
			functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js S_ACCEPT_APPLY=>updateGuildAccept data',[data]);
			updateGuildAccept (data);

			functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js S_ACCEPT_APPLY=>updateApplyPlayer data',[data]);
			updateApplyPlayer (io,data);
		}
	});
}

function updateApplyPlayer (io,data) {
	functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js updateApplyPlayer data',[data]);
	new Promise((resolve,reject)=>{
		var getGuildName = "SELECT `GuildName` FROM `guild_info` WHERE `Guild_ID`='"+data.Guild_ID+"'";
		functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js updateApplyPlayer getGuildName',[getGuildName]);
		db_all_guild.query(getGuildName,function (error,rows) {
			if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'ApplyGuild.js updateApplyPlayer getGuildName',[getGuildName]);}
			data.GuildName = rows[0].GuildName;				
			resolve();
		});
	}).then(()=>{
		return new Promise((resolve,reject)=>{
			functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js updateApplyPlayer=>getUserServerID data.ID_Apply',[data.ID_Apply]);
			getUserServerID(data.ID_Apply,function (returnServer){
				var stringUpdateUser = "UPDATE `game_info_s'"+returnServer+"'` SET `Guild_ID`='"+data.Guild_ID+"',`Guild_Name`='"+data.GuildName+"',`LastGuildID`=null";
				functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js updateApplyPlayer getUserServerID stringUpdateUser',[stringUpdateUser]);
				db_all_user.query(stringUpdateUser,function (error,result) {
					if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'ApplyGuild.js updateApplyPlayer getUserServerID stringUpdateUser',[stringUpdateUser]);}
					functions.ShowLog(functions.ShowLogBool.LogChange,'ApplyGuild.js updateApplyPlayer getUserServerID stringUpdateUser',[stringUpdateUser]);
					
					resolve();
				});
			});
		})
	}).then(()=>{
		return new Promise((resolve,reject)=>{
			functions.ShowLog(functions.ShowLogBool.LogChange,'ApplyGuild.js updateApplyPlayer=>sendUserInfo data',[data]);
			sendUserInfo (io,data);
			resolve();
		})
	});

	new Promise((resolve,reject)=>{
		var getGuildName = "SELECT `GuildName` FROM `guild_info` WHERE `Guild_ID`='"+data.Guild_ID+"'";
		functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js updateApplyPlayer getGuildName',[getGuildName]);

		db_all_guild.query(getGuildName,function (error,rows) {
			if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'ApplyGuild.js updateApplyPlayer getGuildName',[getGuildName]);}
			data.GuildName = rows[0].GuildName;
			resolve();
		});
	}).then(new Promise((resolve,reject)=>{
		functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js updateApplyPlayer=>getUserServerID data.ID_Apply',[data.ID_Apply]);
		getUserServerID(data.ID_Apply,function (returnServer){
			var stringUpdateUser = "UPDATE `game_info_s'"+returnServer+"'` SET `Guild_ID`='"+data.Guild_ID+"',`Guild_Name`='"+data.GuildName+"',`LastGuildID`=null";
			functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js updateApplyPlayer stringUpdateUser',[stringUpdateUser]);

			db_all_user.query(stringUpdateUser,function (error,result) {
				if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'ApplyGuild.js S_ACCEPT_APPLY stringUpdateUser',[stringUpdateUser]);}
				functions.ShowLog(functions.ShowLogBool.LogChange,'ApplyGuild.js updateApplyPlayer stringUpdateUser',[stringUpdateUser]);
			});
		});
	}).then(()=>{
		functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js updateApplyPlayer=>sendUserInfo data',[data]);
		sendUserInfo (io,data);
		functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js updateApplyPlayer=>updateGuildMemberRedis data.GuildID,data.ID_User',[data.GuildID,data.ID_User]);
		updateGuildMemberRedis (data.GuildID,data.ID_User)
	}));
	
}
function updateGuildMemberRedis (GuildID,data) {
	var stringHGuild = "all_guild";
	functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js updateGuildMemberRedis hset stringHGuild,data.ID_User,GuildID',[stringHGuild,data.ID_User,GuildID]);
	client.hset(stringHGuild,data.ID_User,GuildID);

}
function sendUserInfo (io,data) {
	var stringQueryGuildMember = "SELECT `ID_User` FROM `"+data.Guild_ID+"` WHERE `ID_User`<>'"+data.ID_Player+"'";
	functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js sendUserInfo hset stringQueryGuildMember',[stringQueryGuildMember]);
	db_all_guild.query(stringQueryGuildMember, function (error,rows) {
		if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'ApplyGuild.js sendUserInfo hset stringQueryGuildMember',[stringQueryGuildMember]);}
		for (var i = 0; i < rows.length; i++) {
			functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js sendUserInfo=>R_ACCEPT_APPLY rows[i].ID_User',[rows[i].ID_User]);
			R_ACCEPT_APPLY (io,rows[i].ID_User);
		}
	});
}

function R_ACCEPT_APPLY (io,data) {
	var stringQuery = "SELECT `io` FROM `user_info` WHERE `ID_User`='"+data+"'";
	functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js R_ACCEPT_APPLY data,stringQuery',[data,stringQuery]);
	db_all_user.query(stringQuery,function (error,rows) {
		if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'ApplyGuild.js R_ACCEPT_APPLY stringQuery',[stringQuery]);}
		for (var i = 0; i < rows.length; i++) {
			functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js R_ACCEPT_APPLY emit data',[data]);
			io.to(rows[i].io).emit('R_ACCEPT_APPLY',{R_ACCEPT_APPLY:data});
		}
	});
}

function updateGuildAccept (data) {
	new Promise((resolve,reject)=>{
		functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js updateGuildAccept=>getUserServerID data.ID_Apply',[data.ID_Apply]);
		getUserServerID (data.ID_Apply,function (returnServer) {
			var stringUserMight ="SELECT `Might` FROM `game_info_s"+returnServer+"` WHERE `ID_User`='"+data.ID_Apply+"'";
			functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js updateGuildAccept getUserServerID data.ID_Apply,returnServer,stringUserMight',[data.ID_Apply,returnServer,stringUserMight]);
			db_all_user.query(stringUserMight,function (error, rows) {
				if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'ApplyGuild.js updateGuildAccept getUserServerID stringUserMight',[stringUserMight]);}
				data.Might = rows[0].Might;
				resolve();
			});
		});
	}).then(()=>{
		var updateGuild = "UPDATE `"+data.Guild_ID+"` SET `AcceptTime`= null,`RemoveTime`= null WHERE `ID_User`='"+data.ID_Apply+"';"
		+"UPDATE `guild_info` SET `Member`=`Member`+1,`Might`=`Might`+'"+data.Might+"' WHERE `Guild_ID`='"+data.Guild_ID+"';";
		functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js updateGuildAccept updateGuild',[updateGuild]);
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
			if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'ApplyGuild.js updateGuildAccept updateGuild',[updateGuild]);}
			functions.ShowLog(functions.ShowLogBool.LogChange,'ApplyGuild.js updateGuildAccept updateGuild',[updateGuild]);
		});
	});
}

function checkGuildPosition (data,checkBool) {
	var returnBool = false;
	var positionBool = false;
	var applyGuildBool = false;
	functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js checkGuildPosition data',[data]);
	new Promise((resolve,reject)=>{
		functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js checkGuildPosition=>getGuildPosition data.Guild_ID,data.ID_User',[data.Guild_ID,data.ID_User]);
		getGuildPosition (data.Guild_ID,data.ID_User,function (returnPosition) {
			if (returnPosition>3) {
				positionBool = true;
			}
			functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js checkGuildPosition getGuildPosition dpositionBool',[positionBool]);
			resolve();
		});
	}).then(new Promise((resolve,reject)=>{
		functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js checkGuildPosition=>getGuildPosition data.Guild_ID,data.ID_User',[data.Guild_ID,data.ID_User]);
		getUserServerID (data.ID_Apply,function (returnServer) {
			var stringPlayerGuild = "SELECT `Guild_ID` FROM `game_info_s"+returnServer+"` WHERE `ID_User`='"+data.ID_Apply+"'";
			functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js checkGuildPosition getGuildPosition stringPlayerGuild',[stringPlayerGuild]);
			db_all_user.query(stringPlayerGuild,function (error,rows) {
				if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'ApplyGuild.js checkGuildPosition getGuildPosition stringPlayerGuild',[stringPlayerGuild]);}
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
					functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js checkGuildPosition getGuildPosition=>sendReject dataRej',[dataRej]);
					sendReject (io,dataRej);
				}
				functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js checkGuildPosition getGuildPosition applyGuildBool',[applyGuildBool]);
				resolve();
			});
		});
	}).then(()=>{
		if (positionBool&&applyGuildBool) {returnBool = true;}
		functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js checkGuildPosition getGuildPosition returnBool',[returnBool]);
		checkBool(returnBool);
	}));
}
function getGuildPosition (Guild_ID,ID_User,returnPosition) {
	var position = 1;
	var stringQuery = "SELECT `GuildPosition` FROM `"+Guild_ID+"` WHERE `ID_User`='"+ID_User+"'";
	functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js getGuildPosition Guild_ID,ID_User,stringQuery',[Guild_ID,ID_User,stringQuery]);
	db_all_guild.query(stringQuery,function (error,rows) {
		if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'ApplyGuild.js getGuildPosition stringQuery',[stringQuery]);}
		position = rows[0].GuildPosition;
		functions.ShowLog(functions.ShowLogBool.Error,'ApplyGuild.js getGuildPosition position',[position]);
		returnPosition(position);
	});
}

var dataReject ={
	Server_ID: 1,
	ID_User: 9,
	ID_Reject: 42,
	Guild_ID: 13
}

exports.S_REJECT_APPLY = function (io,data) {
	var positionBool = false;
	functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js S_REJECT_APPLY data',[data]);
	new Promise((resolve,reject)=>{
		functions.ShowLog(functions.ShowLogBool.Error,'ApplyGuild.js S_REJECT_APPLY=>getGuildPosition data.Guild_ID,data.ID_User',[data.Guild_ID,data.ID_User]);
		getGuildPosition (data.Guild_ID,data.ID_User,function (returnPosition) {
			if (returnPosition>3) {
				positionBool=true;
				functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js S_REJECT_APPLY getGuildPosition=>deleteApply data.Guild_ID,data.ID_Reject',[data.Guild_ID,data.ID_Reject]);
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
			functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js S_REJECT_APPLY getGuildPosition=>sendReject data',[data]);
			sendReject (io,data);
		}
		
	});
}

function sendReject (io,data) {
	var stringQuery = "SELECT `ID_User` FROM `"+data.Guild_ID+"`";
	functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js sendReject stringQuery, data',[stringQuery,data]);
	db_all_user.query(stringQuery,function (error,rows) {
		if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'ApplyGuild.js sendReject stringQuery',[stringQuery]);}
		if (rows.length>0) {
			for (var i = 0; i < rows.length; i++) {		
				functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js sendReject=>R_REJECT_APPLY data,rows[i]',[data,rows[i]]);		
				R_REJECT_APPLY (io,data,rows[i])
			}
		}
	});

	var stringHSocket = "s"+data.Server_ID+"_socket";
	functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js sendReject stringHSocket',[stringHSocket]);		
	client.hget(stringHSocket,data.ID_Reject,function (error,rowsSocket) {
		if (rows!=null) {
			functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js sendReject emit data',[data]);		
			io.to(rowsSocket).emit('R_REJECT_APPLY',{R_REJECT_APPLY:data});
		}
	});

	// client.hexists(stringHSocket,data.ID_Reject,function (error,resultBool) {
	// 	if (resultBool == 1) {
	// 		client.hget(stringHSocket,data.ID_Reject,function (error,rowsSocket) {
	// 			io.to(rowsSocket).emit('R_REJECT_APPLY',{R_REJECT_APPLY:data});
	// 		});
	// 	}
	// })
}

function R_REJECT_APPLY (io,data,row) {
	var stringQuery = "SELECT `Socket` FROM `user_info` WHERE `ID_User`='"+row.ID_User+"'";
	// var dataRe ={
	// 	ID_Reject: data.ID_Reject,
	// 	Guild_ID: data.Guild_ID
	// }
	functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js R_REJECT_APPLY stringQuery',[stringQuery]);

	db_all_user.query(stringQuery,function (error,rows) {
		if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'ApplyGuild.js R_REJECT_APPLY stringQuery',[stringQuery]);}
		if (rows[0].Socket!=null) {
			functions.ShowLog(functions.ShowLogBool.Check,'ApplyGuild.js R_REJECT_APPLY rows[0].Socket,data',[rows[0].Socket,data]);
			io.to(rows[0].Socket).emit('R_REJECT_APPLY',{R_REJECT_APPLY:data});
		}
	});
}
