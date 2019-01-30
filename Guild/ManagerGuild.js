'use strict';
var db_all_user			= require('./../Util/Database/Db_all_user.js');
var db_all_guild		= require('./../Util/Database/Db_all_guild.js');

var functions 			= require('./../Util/Functions.js');

var Promise 			= require('promise');
var DetailError, LogChange;

var DictTimeOut = {};
var EnumApplyGuild = {};
var stringTimeOut;
var timeRemove 		= 8*60*60*60*1000;
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
var dataKickOut={
	ID_User: 	9,
	Guild_ID: 	13,
	ID_KickOut: 42,
}
exports.S_KICKOUT_GUILD = function s_kickout_guild (socket,data) {
	getUserServerID (data.ID_KickOut,function (returnServer) {
		updateUserInfo (data,returnServer);
	});
	compareKickOutPosition (data.Guild_ID,data.ID_User,data.ID_KickOut,function (returnBool) {
		if (returnBool) {
			currentTime = functions.GetTime();
			kickOutTime = functions.ImportTimeToDatabase(new Date(currentTime + timeRemove).toISOString());
			updateKickOutGuild (data.Guild_ID,data.ID_User,data.ID_KickOut);
			setTimeRemove (data,kickOutTime);
		}
	});
}
function updateUserInfo (data,Server_ID) {
	getUserServerID (data.ID_KickOut,function (returnServer) {
		var updateKickOut = "UPDATE `game_info_s"+returnServer+"` SET `LastGuildID`= '"+data.Guild_ID+"' WHERE `ID_User`='"+data.ID_KickOut+"'";
		db_all_user.query(updateKickOut,function (error,result) {
			if (!!error) {console.log(error);}
		});
	});
}
function getUserServerID (dataID_User,returnServer) {
	var stringQueryUser = "SELECT `Server_ID` FROM `user_info` WHERE `ID_User`='"+dataID_User+"'";
	db_all_user.query(stringQueryUser, function (error,rows) {
		if (!!error) {console.log(error)};
		returnServer(rows[0].Server_ID);
	});
}

function updateKickOutGuild (Guild_ID,ID_User,ID_KickOut) {
	var updateTime = "UPDATE `"+Guild_ID+"` SET `RemoveTime`='"+kickOutTime+"' WHERE 1 `ID_User`='"+ID_KickOut+"'";
	db_all_guild.query(updateTime,function (error,result) {
		if (!!error) {console.log(error);}
	});
}
function setTimeRemove (timeKickout,data) {
	stringTimeOut =  data.ID_KickOut+"_"+data.Guild_ID+"_2";
	DictTimeOut[stringTimeOut] = setTimeout(function (data){
		var stringCheckGuild = "SELECT * FROM `"+data.Guild_ID+"` WHERE `ID_User`='"+data.ID_KickOut+"'";
		delete DictTimeOut[stringTimeOut];
		db_all_guild.query(stringCheckGuild, function (error,rows) {
			if (rows.length>0&&rows[0].RemoveTime!=null) {
				currentTime 	= functions.GetTime();
				databaseTime 	= functions.ExportTimeDatabase(rows[0].RemoveTime);
				if (databaseTime>currentTime) {
					var timeOut = databaseTime - currentTime;
					setTimeRemove (timeOut,data,enumTime);
				}else {
					deleteGuildMember (data);	
				}
			}
		});		
		
	},timeKickout,data);
}
function deleteGuildMember (data) {
	var deleteMember = "DELETE FROM `13` WHERE `ID_User`='"+data.ID_KickOut+"'";
	db_all_guild.query(deleteMember,function (error,result) {
		if (!!error) {console.log(error)}
	})
	getUserServerID (data.ID_KickOut,function (returnServer) {
		var clearLastGuild = "UPDATE `game_info_s"+returnServer+"` SET `LastGuildID`= null WHERE `ID_User`='"+data.ID_KickOut+"' AND `LastGuildID`='"+data.Guild_ID+"'";
		db_all_user.query(clearLastGuild,function (error,results) {
			if (!!error) {console.log(error);}
		});
	});
	
}
function compareKickOutPosition (Guild_ID,ID_User,ID_KickOut,returnBool) {
	var checkBool = false;
	var stringCompare = "SELECT `GuildPosition` FROM `"+Guild_ID+"` WHERE `ID_User`='"+ID_User+"' UNION SELECT `GuildPosition` FROM `"+Guild_ID+"` WHERE `ID_User`='"+ID_KickOut+"'";
	db_all_guild.query(stringCompare,function (error,rows) {
		if (rows[0].GuildPosition>rows[1].GuildPosition&&rows[0].GuildPosition>3) {
			checkBool = true;
		}
		returnBool(checkBool);
	});
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


var dataPromote={
	ID_User: 9,
	ID_Promote: 42,
	Guild_ID: 13,
	PromotePosition: 5,
}

exports.S_PROMOTE = function s_promote (socket,data) {
	
}

promote (dataPromote)
function promote (data) {
	if (data.PromotePosition<5) {
		promoteMember (socket,data);
	}else{
		promoteLeader (data);
	}
}
function promoteLeader (data) {
	
	checkLeaderPosition (data,function (returnBool) {
		if (returnBool) {
			updateGuildPosition (data);
			sendClientPromote (socket,data,2);
		}
	});
}
function checkLeaderPosition (data,returnBool) {
	var checkBool = false;
	var queryLeader = "SELECT `GuildPosition` FROM `"+data.Guild_ID+"` WHERE `ID_User`='"+data.ID_User+"'"
	db_all_guild.query(queryLeader,function (error,rows) {
		if (rows[0].GuildPosition==5) {
			checkBool = true;
		}
		returnBool(checkBool);
	});
}
function promoteMember (socket,data) {
	comparePromotePosition (data,function (returnBool) {
		if (returnBool) {
			updateGuildPosition (data);
			sendClientPromote (socket,data,1);
		}
	});
}

function sendClientPromote (socket,data,enumPromote) {
	var queryGuild = "SELECT `ID_User` FROM `"+data.Guild_ID+"`";
	var dataProMem = {
		ID_Promote: data.ID_Promote,
		PromotePosition: data.PromotePosition
	}

	switch (enumPromote) {
		case 1:
		break;
		case 2:
		var dataProLeader= {
			ID_Promote: data.ID_User,
			PromotePosition: 4
		}
		db_all_guild.query(queryGuild,function (error,rows) {
			if (rows.length>0) {
				for (var i = 0; i < rows.length; i++) {
					R_PROMOTE (socket,dataProLeader,rows[i].ID_User);	
				}
			}
		})
		break;
	}

	db_all_guild.query(queryGuild,function (error,rows) {
		if (rows.length>0) {
			for (var i = 0; i < rows.length; i++) {
				R_PROMOTE (socket,dataProMem,rows[i].ID_User)	
			}
			
		}
	})
}

function R_PROMOTE (socket,data,ID_User) {
	var getSocket = "SELECT `Socket` FROM `user_info` WHERE `ID_User`='"+ID_User+"'";
	db_all_user.query(queryGuild,function (error,rows) {
		//socket.broadcast.to(rows[i].Socket).emit('R_PROMOTE',{R_PROMOTE:dataPro});
	})
}
function updateGuildPosition (data) {
	var updatePos ="UPDATE `"+data.Guild_ID+"` SET `GuildPosition`='"+data.PromotePosition+"' WHERE `ID_User`='"+data.ID_Promote+"'";
	db_all_guild.query(updatePos,function (error,result) {
		if (!!error) {console.log(error);}
	});
}

function comparePromotePosition (data,returnBool) {
	var checkBool = false;
	var stringCompare = "SELECT `GuildPosition` FROM `"+data.Guild_ID+"` WHERE `ID_User`='"+data.ID_User+"' UNION SELECT `GuildPosition` FROM `"+data.Guild_ID+"` WHERE `ID_User`='"+data.ID_Promote+"'";
	db_all_guild.query(stringCompare,function (error,rows) {
		if ((rows[0].GuildPosition>rows[1].GuildPosition)&&(rows[0].GuildPosition>data.PromotePosition)) {
			checkBool = true;
		}
		returnBool(checkBool);
	});
}
