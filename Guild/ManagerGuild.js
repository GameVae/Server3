'use strict';
var db_all_user			= require('./../Util/Database/Db_all_user.js');
var db_all_guild		= require('./../Util/Database/Db_all_guild.js');

var guildData 			= require('./../Redis/Guild/GuildData.js')

var functions 			= require('./../Util/Functions.js');

var Promise 			= require('promise');
var DetailError, LogChange;

var DictTimeOut = {};
var EnumApplyGuild = {};
var stringTimeOut;
var timeRemove 		= 30*60*1000;//30 phut
var kickOutTime,currentTime;
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
// var dataKickOut={
// 	Server_ID: 1,
// 	ID_User: 	9,
// 	Guild_ID: 	13,
// 	ID_KickOut: 42,
// }

// var data_S_DELETE_GUILD = {
// 	ID_User: 5,
// 	ID_Guild: 13
// }

var redis = require('redis');
var client = redis.createClient();
client.select(functions.RedisData.TestUnit);

exports.S_KICKOUT_GUILD = function s_kickout_guild (io,data) {

	functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js S_KICKOUT_GUILD=>compareKickOutPosition data',[data]);
	compareKickOutPosition (data.Guild_ID,data.ID_User,data.ID_KickOut,function (returnBool) {
		functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js S_KICKOUT_GUILD returnBool',[returnBool]);
		if (returnBool) {
			currentTime = functions.GetTime();
			kickOutTime = functions.ImportTimeToDatabase(new Date(currentTime + timeRemove).toISOString());
			data.RemoveTime = timeRemove;

			functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js S_KICKOUT_GUILD=>updateKickOutGuild data.Guild_ID,data.ID_User,data.ID_KickOut',[data.Guild_ID,data.ID_User,data.ID_KickOut]);
			updateKickOutGuild (data.Guild_ID,data.ID_User,data.ID_KickOut);
			
			functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js S_KICKOUT_GUILD=>updateKickOutGuild data,kickOutTime',[data,kickOutTime]);			
			setTimeRemove (data,kickOutTime);

			functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js S_KICKOUT_GUILD=>sendClientKickOut data',[data]);
			sendClientKickOut (io,data);

			functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js S_KICKOUT_GUILD=>getUserServerID data',[data]);
			getUserServerID (data.ID_KickOut,function (returnServer) {
				functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js S_KICKOUT_GUILD=>updateUserInfo data,returnServer',[data,returnServer]);
				updateUserInfo (data,returnServer);
			});
		}
	});
}

function sendClientKickOut (io,data) {	
	var stringQuery = "SELECT `ID_User` FROM `"+data.Guild_ID+"`";

	functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js sendClientKickOut data',[data]);
	db_all_guild.query(stringQuery,function (error,rows) {
		if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'ManagerGuild.js sendClientKickOut stringQuery',[stringQuery]);}
		if (rows.length>0) {
			functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js sendClientKickOut=>R_KICKOUT_GUILD rows[i],data',[rows[i],data]);
			R_KICKOUT_GUILD (io,rows,data);
			// for (var i = 0; i < rows.length; i++) {
			// 	functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js sendClientKickOut=>R_KICKOUT_GUILD rows[i],data',[rows[i],data]);
			// 	R_KICKOUT_GUILD (io,rows[i],data);
			// }
		}
	});
	
	// client.hexists(stringHSocket,data.ID_KickOut,function (error,resultBool) {
	// 	if (resultBool == 1) {
	// 		client.hget(stringHSocket,data.ID_KickOut,function (error,rowsSocket) {
	// 			io.to(rowsSocket).emit('R_KICKOUT_GUILD',{R_KICKOUT_GUILD:data});
	// 		});
	// 	}
	// });
}

function R_KICKOUT_GUILD (io,row,data) {
	functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js R_KICKOUT_GUILD row,data',[row,data]);
	var stringHSocket = "s"+data.Server_ID+"_socket";
	
	functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js R_KICKOUT_GUILD hmget stringHSocket',[row,data]);
	client.hmget(stringHSocket,row,function (error,rowsSocket) {
		if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'ManagerGuild.js hmget R_KICKOUT_GUILD stringHSocket,row,data',[stringHSocket,row,data]);}
		for (var i = 0; i < rowsSocket.length; i++) {
			if (rowsSocket[i]!=null) {
				functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js R_KICKOUT_GUILD data,rowsSocket',[data,rowsSocket]);
				io.to(rowsSocket[i]).emit('R_KICKOUT_GUILD',{R_KICKOUT_GUILD:data});
			}
		}		
	});

	// console.log(data.ID_User)
	// data.RemoveTime = timeRemove;
	// var stringQuery = "SELECT `Socket` FROM `user_info` WHERE `ID_User`='"+row.ID_User+"'";
	// db_all_user.query(stringQuery,function (error,rows) {
	// 	if (!!error){DetailError = ('ApplyGuild.js: sendApplyToGuildMember: '+ stringQuery);functions.WriteLogError(DetailError,2);}
	// 	if (rows[0].Socket!=null) {
	// 		io.to(rows[0].Socket).emit('R_KICKOUT_GUILD',{R_KICKOUT_GUILD:data});
	// 	}
	// });
}

function updateUserInfo (data,Server_ID) {
	functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js updateUserInfo data,Server_ID',[data,Server_ID]);
	getUserServerID (data.ID_KickOut,function (returnServer) {
		functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js updateUserInfo data,Server_ID',[data,Server_ID]);
		var updateKickOut = "UPDATE `game_info_s"+returnServer+"` SET `LastGuildID`= '"+data.Guild_ID+"' WHERE `ID_User`='"+data.ID_KickOut+"'";
		db_all_user.query(updateKickOut,function (error,result) {
			if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'ManagerGuild.js updateUserInfo updateKickOut',[updateKickOut]);}
			functions.ShowLog(functions.ShowLogBool.LogChange,'ManagerGuild.js updateUserInfo updateKickOut',[updateKickOut]);
		});
	});
}

function getUserServerID (dataID_User,returnServer) {
	functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js getUserServerID dataID_User',[dataID_User]);
	var stringQueryUser = "SELECT `Server_ID` FROM `user_info` WHERE `ID_User`='"+dataID_User+"'";
	db_all_user.query(stringQueryUser, function (error,rows) {
		if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'ManagerGuild.js getUserServerID stringQueryUser',[stringQueryUser]);}
		functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js getUserServerID=>returnServer rows[0].Server_ID',[rows[0].Server_ID]);
		returnServer(rows[0].Server_ID);
	});
}

function updateKickOutGuild (Guild_ID,ID_User,ID_KickOut) {
	functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js updateKickOutGuild Guild_ID,ID_User,ID_KickOut',[Guild_ID,ID_User,ID_KickOut]);
	var updateTime = "UPDATE `"+Guild_ID+"` SET `RemoveTime`='"+kickOutTime+"' WHERE `ID_User`='"+ID_KickOut+"'";
	db_all_guild.query(updateTime,function (error,result) {
		if (!!error){functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js updateKickOutGuild updateTime',[updateTime]);}
		functions.ShowLog(functions.ShowLogBool.LogChange,'ManagerGuild.js updateKickOutGuild updateTime',[updateTime]);
	});
}

function setTimeRemove (timeKickout,data) {
	stringTimeOut =  data.ID_KickOut+"_"+data.Guild_ID+"_2";
	functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js setTimeRemove timeKickout,data,stringTimeOut',[timeKickout,data,stringTimeOut]);

	DictTimeOut[stringTimeOut] = setTimeout(function (data){
		var stringCheckGuild = "SELECT * FROM `"+data.Guild_ID+"` WHERE `ID_User`='"+data.ID_KickOut+"'";
		delete DictTimeOut[stringTimeOut];
		
		functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js setTimeRemove data,stringCheckGuild',[data,stringCheckGuild]);
		db_all_guild.query(stringCheckGuild, function (error,rows) {
			if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'ManagerGuild.js setTimeRemove data,stringCheckGuild',[data,stringCheckGuild]);}

			functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js setTimeRemove rows',[rows]);
			if (rows[0]!=null&&rows[0].RemoveTime!=null) {
				currentTime 	= functions.GetTime();
				databaseTime 	= functions.ExportTimeDatabase(rows[0].RemoveTime);
				if (databaseTime>currentTime) {
					var timeOut = databaseTime - currentTime;
					functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js setTimeRemove=>setTimeRemove timeOut,data',[timeOut,data]);
					setTimeRemove (timeOut,data);
				}else {
					functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js setTimeRemove=>deleteGuildMember data',[data]);
					deleteGuildMember (data);
				}
			}
		});		
		
	},timeKickout,data);
}


function deleteGuildMember (data) {
	
	var deleteMember = "DELETE FROM `"+data.Guild_ID+"` WHERE `ID_User`='"+data.ID_KickOut+"'";
	functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js deleteGuildMember data,deleteMember',[data,deleteMember]);

	db_all_guild.query(deleteMember,function (error,result) {
		if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'ManagerGuild.js deleteGuildMember data,deleteMember',[data,deleteMember]);}
		functions.ShowLogBool.LogChange,'ManagerGuild.js deleteGuildMember deleteMember',[deleteMember];
	})
	
	functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js deleteGuildMember=>getUserServerID data.ID_KickOut',[data.ID_KickOut]);
	getUserServerID (data.ID_KickOut,function (returnServer) {
		var clearLastGuild = "UPDATE `game_info_s"+returnServer+"` SET `LastGuildID`= null WHERE `ID_User`='"+data.ID_KickOut+"' AND `LastGuildID`='"+data.Guild_ID+"'";
		functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js deleteGuildMember clearLastGuild',[clearLastGuild]);
		db_all_user.query(clearLastGuild,function (error,results) {
			if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'ManagerGuild.js deleteGuildMember clearLastGuild',[clearLastGuild]);}
			functions.ShowLog(functions.ShowLogBool.LogChange,'ManagerGuild.js deleteGuildMember clearLastGuild',[clearLastGuild]);
		});
	});	

	functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js deleteGuildMember=>removeValueGuild data.GuildID,data.ID_KickOut',[data.GuildID,data.ID_KickOut]);
	removeValueGuild(data.GuildID,data.ID_KickOut);
}

function removeValueGuild (GuildID,stringID_User) {
	functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js removeValueGuild GuildID,stringID_User',[GuildID,stringID_User]);
	var stringHkey = "all_guilds";
	client.hdel(stringHkey,stringID_User);
}

function compareKickOutPosition (Guild_ID,ID_User,ID_KickOut,returnBool) {
	var checkBool = false;
	var stringCompare = "SELECT `GuildPosition` FROM `"+Guild_ID+"` WHERE `ID_User`='"+ID_User+"' UNION SELECT `GuildPosition` FROM `"+Guild_ID+"` WHERE `ID_User`='"+ID_KickOut+"'";
	
	functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js compareKickOutPosition Guild_ID,ID_User,ID_KickOut',[Guild_ID,ID_User,ID_KickOut]);	
	db_all_guild.query(stringCompare,function (error,rows) {
		if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'ManagerGuild.js compareKickOutPosition stringCompare',[stringCompare]);}
		if (rows[0].GuildPosition>rows[1].GuildPosition&&rows[0].GuildPosition>3) {
			checkBool = true;
		}
		functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js compareKickOutPosition rows,checkBool',[rows,checkBool]);
		returnBool(checkBool);
	});
}

function getGuildPosition (Guild_ID,ID_User,returnPosition) {
	var position = 1;
	var stringQuery = "SELECT `GuildPosition` FROM `"+Guild_ID+"` WHERE `ID_User`='"+ID_User+"'";
	functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js getGuildPosition Guild_ID,ID_User,stringQuery',[Guild_ID,ID_User,stringQuery]);
	db_all_guild.query(stringQuery,function (error,rows) {
		if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'ManagerGuild.js getGuildPosition Guild_ID,ID_User,stringQuery',[Guild_ID,ID_User,stringQuery]);}
		position = rows[0].GuildPosition;
		functions.ShowLog(functions.ShowLogBool.Error,'ManagerGuild.js getGuildPosition position',[position]);
		returnPosition(position);
	});
}

// var dataPromote={
// 	ID_User: 9,
// 	ID_Promote: 42,
// 	Guild_ID: 13,
// 	PromotePosition: 5,
// }

exports.S_PROMOTE = function (io,data) {
	if (data.PromotePosition<5) {
		functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js S_PROMOTE=>promoteMember',[data]);
		promoteMember (io,data);
	}else{
		functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js S_PROMOTE=>promoteLeader',[data]);
		promoteLeader (io,data);
	}
}

function promoteLeader (io,data) {
	var dataLeader ={
		ID_User: data.ID_User,
		ID_Promote: data.ID_User,
		Guild_ID: data.Guild_ID,
		PromotePosition: 4,
	}
	functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js promoteLeader=>checkLeaderPosition data,dataLeader',[data,dataLeader]);
	checkLeaderPosition (data,function (returnBool) {
		functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js promoteLeader',[data,dataLeader]);
		if (returnBool) {
			functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js promoteLeader=>updateGuildPosition dataLeader',[dataLeader]);
			updateGuildPosition (dataLeader);
			functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js promoteLeader=>updateGuildPosition data',[data]);
			updateGuildPosition (data);
			functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js promoteLeader=>sendClientPromote data',[data]);
			sendClientPromote (io,data,2);
		}
	});
}

function checkLeaderPosition (data,returnBool) {
	var checkBool = false;
	var queryLeader = "SELECT `GuildPosition` FROM `"+data.Guild_ID+"` WHERE `ID_User`='"+data.ID_User+"'"
	functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js checkLeaderPosition data',[data]);
	db_all_guild.query(queryLeader,function (error,rows) {
		if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'ManagerGuild.js checkLeaderPosition queryLeader',[queryLeader]);}
		if (rows[0].GuildPosition==5) {
			checkBool = true;
		}
		returnBool(checkBool);
	});
}

function promoteMember (io,data) {
	functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js promoteMember data',[data]);
	comparePromotePosition (data,function (returnBool) {
		functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js promoteMember comparePromotePosition data',[data]);
		if (returnBool) {
			functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js promoteMember=>updateGuildPosition data',[data]);
			updateGuildPosition (data);
			functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js promoteMember=>sendClientPromote data',[data]);
			sendClientPromote (io,data,1);
		}
	});
}

function sendClientPromote (io,data,enumPromote) {
	var queryGuild = "SELECT `ID_User` FROM `"+data.Guild_ID+"`";

	switch (enumPromote) {
		case 1:
		var dataProMem = {
			ID_Promote: data.ID_Promote,
			PromotePosition: data.PromotePosition
		}
		db_all_guild.query(queryGuild,function (error,rows) {
			if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'ManagerGuild.js sendClientPromote queryGuild',[queryGuild]);}
			if (rows.length>0) {
				for (var i = 0; i < rows.length; i++) {
					functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js sendClientPromote dataProMem,rows[i].ID_User)',[dataProMem,rows[i].ID_User]);
					R_PROMOTE (io,dataProMem,rows[i].ID_User);
				}			
			}
		})
		break;
		
		case 2:
		var dataProLeader= {
			ID_Promote: data.ID_User,
			PromotePosition: 4
		}
		db_all_guild.query(queryGuild,function (error,rows) {
			if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'ManagerGuild.js sendClientPromote queryGuild',[queryGuild]);}
			if (rows.length>0) {
				for (var i = 0; i < rows.length; i++) {
					functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js sendClientPromote dataProLeader,rows[i].ID_User)',[dataProLeader,rows[i].ID_User]);
					R_PROMOTE (io,dataProLeader,rows[i].ID_User);	
				}
			}
		})
		break;
	}
	
}

function R_PROMOTE (io,dataPro,ID_User) {
	functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js R_PROMOTE dataPro,ID_User)',[dataPro,ID_User]);
	var getSocket = "SELECT `Socket` FROM `user_info` WHERE `ID_User`='"+ID_User+"'";
	db_all_user.query(queryGuild,function (error,rows) {
		if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'ManagerGuild.js R_PROMOTE getSocket)',[getSocket]);}
		functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js R_PROMOTE dataPro)',[dataPro]);
		io.to(rows[0].Socket).emit('R_PROMOTE',{R_PROMOTE:dataPro});
		// socket.broadcast.to(rows[i].Socket).emit('R_PROMOTE',{R_PROMOTE:dataPro});
	})
}

function updateGuildPosition (data) {
	var updatePos ="UPDATE `"+data.Guild_ID+"` SET `GuildPosition`='"+data.PromotePosition+"' WHERE `ID_User`='"+data.ID_Promote+"'";
	functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js updateGuildPosition data,updatePos)',[data,updatePos]);
	db_all_guild.query(updatePos,function (error,result) {
		if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'ManagerGuild.js updateGuildPosition updatePos)',[updatePos]);}
		functions.ShowLog(functions.ShowLogBool.LogChange,'ManagerGuild.js updateGuildPosition updatePos)',[updatePos]);
	});
}

function comparePromotePosition (data,returnBool) {
	var checkBool = false;
	var stringCompare = "SELECT `GuildPosition` FROM `"+data.Guild_ID+"` WHERE `ID_User`='"+data.ID_User+"' UNION SELECT `GuildPosition` FROM `"+data.Guild_ID+"` WHERE `ID_User`='"+data.ID_Promote+"'";
	functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js comparePromotePosition data,stringCompare)',[data,stringCompare]);
	db_all_guild.query(stringCompare,function (error,rows) {
		if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'ManagerGuild.js comparePromotePosition stringCompare)',[stringCompare]);}
		if ((rows[0].GuildPosition>rows[1].GuildPosition)&&(rows[0].GuildPosition>data.PromotePosition)) {
			checkBool = true;
		}
		functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js comparePromotePosition returnBool(checkBool))',[checkBool])
		returnBool(checkBool);
	});
}



exports.S_DELETE_GUILD = function (socket,data) {
	var dataSend = {};
	var guildQuery = "SELECT * FROM `"+data.ID_Guild+"` WHERE `AcceptTime` IS NULL"
	db_all_guild.query(guildQuery,function (error,rows) {
		if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'ManagerGuild.js S_DELETE_GUILD guildQuery',[guildQuery]);}
		if (rows[0]!=null) {
			if (rows[0].length==1 && rows[0].GuildPosition==5) {
				dataSend ={
					BoolDelete : 1,
					MessageDelete : "OK"
				}				
			}else{
				dataSend ={
					BoolDelete : 0,
					MessageDelete : "Need kick all member and wait for removing time"
				}
			}
			functions.ShowLog(functions.ShowLogBool.Clear,'ManagerGuild.js S_DELETE_GUILD guildQuery',[dataSend]);
			socket.emit('R_DELETE_GUILD',{R_DELETE_GUILD:dataSend})
		}
	})
}