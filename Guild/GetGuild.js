'use strict';
var db_all_user			= require('./../Util/Database/Db_all_user.js');
var db_all_guild		= require('./../Util/Database/Db_all_guild.js');

var functions 			= require('./../Util/Functions.js');

var Promise 			= require('promise');
var DetailError, LogChange;


var timeAccept 		= 8*60*60*60*1000;
var timeOut;

var diamondCreateGuild = 500;

var dataCreateGuild={};
var EnumCreateGuild={}
var DictTimeOut ={};

exports.Start = function start (io) {
	io.on('connection', function(socket){
		socket.on('S_CREATE_GUILD', function (data){
			S_CREATE_GUILD (socket,data);
		});
		socket.on('S_APPLY',function (data) {
			S_APPLY(socket,data);
		});
		socket.on('S_ACCEPT_APPLY',function (data) {
			S_ACCEPT_APPLY(socket,data);
		});
	});
}

var dataAccept={
	ID_User: 9,
	ID_Player: 42,
	Guild_ID: 13
}

S_ACCEPT_APPLY (dataAccept)
function S_ACCEPT_APPLY (data) {
	checkGuildPosition (data,function (checkBool) {
		//console.log('checkBool: '+checkBool)		
		if (checkBool) {
			//updateGuildAccept (data);
			
			new Promise((resolve,reject)=>{
				var getGuildName = "SELECT `GuildName` FROM `guild_info` WHERE `Guild_ID`='"+data.Guild_ID+"'";
				// db_all_guild.query(getGuildName,function (error,rows) {
				// 	data.GuildName = rows[0].GuildName;
				// 	resolve();
				// });

			}).then(()=>{		
				var stringUserInfo = "SELECT `Server_ID` FROM `user_info` WHERE `ID_User` ='"+data.ID_Player+"'";
				// db_all_user.query(stringUserInfo,function (error,rows) {
				// 	var stringUpdateUser = "UPDATE `game_info_s'"+rows[0].Server_ID+"'` SET `Guild_ID`='"+data.Guild_ID+"',`Guild_Name`='"+data.GuildName+"',`LastGuildID`=null";

				// 	db_all_user.query(stringUpdateUser,function (error,result) {
				// 		if (!!error) {console.log(error)};
				// 	});
				// });
			}).then(()=>{
				R_ACCEPT_APPLY (data);
			});
		}

	});
}

function R_ACCEPT_APPLY (data) {
	var stringQueryGuildMember = "SELECT * FROM `13` WHERE `ID_User`<>'"+data.ID_Player+"'";
	db_all_guild.query(stringQueryGuildMember, function (error,rows) {
		
	});

}

function updateGuildAccept (data) {
	var Server_ID = 0;

	new Promise((resolve,reject)=>{
		var stringUserInfo = "SELECT `Server_ID` FROM `user_info` WHERE `ID_User` ='"+data.ID_Player+"'";
		db_all_user.query(stringUserInfo,function (error,rows) {
			if (!!error) {console.log(error)};
			Server_ID = rows[0].Server_ID;
			resolve();
		});
	}).then(()=>{
		new Promise((resolve,reject)=>{
			var stringUserMight ="SELECT `Might` FROM `game_info_s"+Server_ID+"` WHERE `ID_User`='"+data.ID_Player+"'";
			db_all_user.query(stringUserMight,function (error, rows) {
				if (!!error) {console.log(error)};
				data.Might = rows[0].Might;
				resolve();
			});
		}).then(()=>{
			
			var updateGuild = "UPDATE `"+data.Guild_ID+"` SET `AcceptTime`= null WHERE `ID_User`='"+data.ID_Player+"';"
			+"UPDATE `guild_info` SET `Member`=`Member`+1,`Might`=`Might`+'"+data.Might+"' WHERE `Guild_ID`='"+data.Guild_ID+"';";
			console.log(updateGuild)
			var stringTimeOut =  data.ID_Player+"_"+data.Guild_ID+"_1";
			if (stringTimeOut in DictTimeOut){
				clearTimeout(stringTimeOut);
				delete DictTimeOut[stringTimeOut];
			}
			db_all_guild.query(updateGuild,function (error,result) {
				if (!!error) {console.log(error)};
			});
		});;
		
	});
}

function checkGuildPosition (data,checkBool) {
	var returnBool = false;
	var positionBool=false;
	var userGuildBool=false;
	// console.log(stringQuery);
	new Promise((resolve,reject)=>{
		var stringQuery = "SELECT `GuildPosition` FROM `"+data.Guild_ID+"` WHERE `ID_User`='"+data.ID_User+"'";
		//console.log(stringQuery)
		db_all_guild.query(stringQuery,function (error,rows) {
			if (rows[0].GuildPosition>3) {
				positionBool = true;				
			}

			var stringUserInfo = "SELECT `Server_ID` FROM `user_info` WHERE `ID_User` ='"+data.ID_Player+"'";
			db_all_user.query(stringUserInfo,function (error,rows_stringUserInfo) {

				var stringPlayerGuild = "SELECT `Guild_ID` FROM `game_info_s"+rows_stringUserInfo[0].Server_ID+"` WHERE `ID_User`='"+data.ID_User+"'";	

				db_all_user.query(stringPlayerGuild,function (error,rows_stringPlayerGuild) {					
					if (rows_stringPlayerGuild[0].Guild_ID==null) {
						userGuildBool=true;
					}
					resolve();
				})	
			}); 
		});
	}).then(()=>{
		if (positionBool&&userGuildBool) {
			returnBool = true;
		}
		checkBool(returnBool)
	});
}

// var dataGuild ={
// 	GuildTag: 	'ABf',
// 	GuildName: 	'123456a',
// 	ID_User: 	9,
// 	Server_ID: 	1,
// }
// S_CREATE_GUILD (dataGuild);

// var dataApplication={
// 	ID_User: 	42,
// 	NameInGame: 'Mquan2',
// 	Guild_ID: 	13,
// 	Server_ID: 	1,
// }


function S_CREATE_GUILD (socket,data) {
	checkLengData (data,function (checkBoolLength) {
		if (!checkBoolLength) {
			EnumCreateGuild.Enum=2;
			EnumCreateGuild.Message="Fail Length GuildTag Or GuildName";			
			socket.emit('R_CREATE_GUILD',{R_CREATE_GUILD : EnumCreateGuild});			
		}else{
			checkDiamond(data,function (checkBool,returnDataCheck) {
				if(!checkBool){
					DetailError = ('GetGuild.js: checkDiamond: '+data); functions.WriteLogError(DetailError,1);
					EnumCreateGuild.Enum=3;
					EnumCreateGuild.Message="Fail Diamond Create Guild";					
					//console.log(EnumCreateGuild);
					//console.log({R_CREATE_GUILD : EnumCreateGuild});
					socket.emit('R_CREATE_GUILD',{R_CREATE_GUILD : EnumCreateGuild});
					console.log("reload client");
				}else{
					checkGuildName (socket,returnDataCheck);					
				}
			});
		}
	});	
}

function checkGuildName (socket,data) {
	var stringCheckName = "SELECT * FROM `guild_info` WHERE"+
	" `GuildTag`='"+data.GuildTag+"' OR `GuildName`='"+data.GuildName+"'";
	//console.log(stringCheckName);
	db_all_guild.query(stringCheckName,function (error,rows) {
		if (rows.length>0) {
			EnumCreateGuild.Enum=4;
			EnumCreateGuild.Message="Fail GuildTag OR GuildName Exist";	
		}else{
			//console.log('here')
			EnumCreateGuild.Enum=1;
			EnumCreateGuild.Message="Success Create Guild";
			createNewGuild (data);
		}
		socket.emit('R_CREATE_GUILD',{R_CREATE_GUILD : EnumCreateGuild});
	});
}

function checkLengData (data,checkBool) {
	var returnBool = false;
	if (data.GuildTag.length==3&&(data.GuildName.length<16&&data.GuildName!='')) {
		returnBool=true;
	}
	checkBool(returnBool);
}

function createNewGuild (data) {
	//console.log(data)
	var stringInsertNewGuild = "INSERT INTO `guild_info`(`GuildTag`, `GuildName`, `Server_ID`, `LeaderID`, `LeaderName`, `Might`) VALUES ('"
	+data.GuildTag+"','"
	+data.GuildName+"','"
	+data.Server_ID+"','"
	+data.ID_User+"','"
	+data.NameInGame+"','"
	+data.Might+"')";
	//console.log(stringInsertNewGuild);
	db_all_guild.query(stringInsertNewGuild,function (error,result) {
		if (!!error){DetailError = ('GetGuild.js: query createNewGuild: '+stringInsertNewGuild); functions.WriteLogError(DetailError,1);}
		dataCreateGuild.Guild_ID= result.insertId;
		createGuildTable (dataCreateGuild);
		//console.log(dataCreateGuild);
	})
}

function createGuildTable (data) {
	var stringCreateTable = "CREATE TABLE `"+data.Guild_ID+"` AS SELECT * FROM `guild`;"
	+"ALTER TABLE `"+data.Guild_ID+"` ADD PRIMARY KEY (`ID`);"
	+"ALTER TABLE `"+data.Guild_ID+"` MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;"
	+"INSERT INTO `"+data.Guild_ID+"`(`ID_User`, `NameInGame`, `Might`,`Killed`, `GuildPosition`) VALUES ('"
	+data.ID_User+"','"
	+data.NameInGame+"','"
	+data.Might+"','"
	+data.Killed+"','"
	+"5');"

	db_all_guild.query(stringCreateTable,function (error,result) {
		if (!!error){DetailError = ('GetGuild.js: createGuildTable: '+stringCreateTable); functions.WriteLogError(DetailError,2);}
		LogChange='GetGuild.js: createGuildTable: '+stringCreateTable;functions.LogChange(LogChange,2);
	});
}

function checkDiamond (data,checkBool) {
	var returnBool = false;	
	var stringQuery = "SELECT `Diamond`, `game_info_s"+data.Server_ID+"`.`NameInGame`,`game_info_s"+data.Server_ID+"`.`Might`,`game_info_s"+data.Server_ID+"`.`Killed` FROM `user_info` INNER JOIN `game_info_s"+data.Server_ID
	+"` WHERE  `user_info`.`ID_User`='"+data.ID_User+"' AND `game_info_s"+data.Server_ID+"`.`ID_User`='"+data.ID_User+"';";
	db_all_user.query(stringQuery,function (error,rows) {
		if (!!error){DetailError = ('GetGuild.js: checkDiamond: '+stringQuery); functions.WriteLogError(DetailError,2);}
		if (rows[0].Diamond>=diamondCreateGuild) {
			returnBool=true;
		}

		dataCreateGuild =rows[0];

		dataCreateGuild.ID_User 	= data.ID_User;
		dataCreateGuild.Server_ID	= data.Server_ID;
		dataCreateGuild.GuildTag	= data.GuildTag;
		dataCreateGuild.GuildName 	= data.GuildName;
		
		delete dataCreateGuild.Diamond;
		checkBool(returnBool,dataCreateGuild);
	});
}

//---//

//S_APPLICATION (dataApplication);
function S_APPLY (socket,data) {
	checkCurrentGuild (data,function (checkGuildBool) {
		// console.log(data);
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
		setTimeAccept (timeAccept,data,1);		
	});	
}
//sendApplyToGuildMember (dataApplication);
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
//---//
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
			var stringDelete = "DELETE FROM `"+data.Guild_ID+"` WHERE `ID_User`='"+data.ID_User+"'";
			db_all_guild.query(stringDelete, function (error,result) {
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
				if (!!error) {console.log(error)};
			});
			var stringQueryUser = "SELECT `Server_ID` FROM `user_info` WHERE `ID_User`='"+data.ID_User+"'";
			db_all_user.query(stringQueryUser, function (error,rows) {
				var stringUpdateUserInfo = "UPDATE `game_info_s"+rows[0].Server_ID+"` SET `LastGuildID`=null WHERE `ID_User`='"+data.ID_User+"'";
				db_all_user.query(stringUpdateUserInfo,function (error,result) {
					if (!!error) {console.log(error)};
				});
			});
		}
	}
}

function checkCurrentGuild (data,checkGuildBool) {
	var returnBool = false;
	var currentGuildBool = false;
	var guildApplyBool = false;
	
	new Promise((resolve,reject)=>{
		var stringQuery = "SELECT `Guild_ID` FROM `game_info_s"+data.Server_ID+"` WHERE `ID_User`='"+data.ID_User+"'";
		db_all_user.query(stringQuery,function (error,rows) {

			if (rows[0].Guild_ID!=null) {
				currentGuildBool = true;
				console.log('have guild');
			}
			resolve();
		});
	}).then(

	new Promise((resolve,reject)=>{		
		var stringGuildApply = "SELECT `ID_User` FROM `all_guilds`.`"+data.Guild_ID+"` WHERE `ID_User`='"+data.ID_User+"'";
		db_all_guild.query(stringGuildApply,function (error,rows) {	
			if(rows.length>0){
				guildApplyBool=true;
				console.log('da apply guild')
			}
			resolve();
		});

	}).then(()=>{
		if (currentGuildBool||guildApplyBool) {returnBool=true};
		checkGuildBool(returnBool);		
	}));
}



exports.UpdateDatabase = function updateDatabase () {
	var stringQuery = "SELECT `TABLE_NAME` FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='all_guilds' AND TABLE_NAME<>'guild_info' AND TABLE_NAME<>'guild'";
	db_all_guild.query(stringQuery,function (error,rows) {
		if (rows.length>0) {
			for (var i = 0; i < rows.length; i++) {
				// console.log(rows[i].TABLE_NAME);
				queryGuildData (rows[i].TABLE_NAME);
			}
		}
		
	});
}
function queryGuildData (data) {
	var stringGuild = "SELECT * FROM `"+data+"` WHERE `AcceptTime`<> 'null' OR `RemoveTime`<>'null'";
	var currentTime = functions.GetTime();
	var databaseTime,timeOutApply;
	var dataInfo={};
	
	db_all_guild.query(stringGuild,function (error,rows) {
		//console.log(rows);
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
					}else{
						timeOutApply=0;
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
					}else{
						timeOutApply=0;
					}
					setTimeAccept (timeOutApply,dataInfo,2);
				}
			}
		}
	});
}