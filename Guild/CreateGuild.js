'use strict';
var db_all_user			= require('./../Util/Database/Db_all_user.js');
var db_all_guild		= require('./../Util/Database/Db_all_guild.js');

var functions 			= require('./../Util/Functions.js');

var Promise 			= require('promise');
var DetailError, LogChange;

var diamondCreateGuild = 500;

var dataCreateGuild={};
var EnumCreateGuild={};
var DictTimeOut ={};

exports.S_CREATE_GUILD = function s_CREATE_GUILD (socket,data) {
	//console.log(data)
	checkData (socket,data);
}

function checkData (socket,data) {	
	var lengthBool = checkLengData (data);
	if (!lengthBool) {
		EnumCreateGuild.Enum = 2;
		EnumCreateGuild.Message = "Fail Length GuildTag Or GuildName";
		//socket.emit('R_CREATE_GUILD',{R_CREATE_GUILD : EnumCreateGuild});
	}else{
		checkDiamond (data,function (checkBool,returnDataCheck) {
			if(!checkBool){
				DetailError = ('CreateGuild.js: checkDiamond: '+data); functions.WriteLogError(DetailError,2);
				EnumCreateGuild.Enum = 3;
				EnumCreateGuild.Message = "Fail Diamond Create Guild";					
				// socket.emit('R_CREATE_GUILD',{R_CREATE_GUILD : EnumCreateGuild});
				console.log("reload client");
			}else{
				checkGuildName(socket,returnDataCheck);					
			}
		});
	}
}
function checkGuildName (socket,data) {
	var stringCheckName = "SELECT * FROM `guild_info` WHERE"+
	" `GuildTag`='"+data.GuildTag+"' OR `GuildName`='"+data.GuildName+"'";
	db_all_guild.query(stringCheckName,function (error,rows) {
		if (!!error){DetailError = ('CreateGuild.js: checkGuildName: '+ stringCheckName);functions.WriteLogError(DetailError,2);}
		if (rows.length>0) {
			EnumCreateGuild.Enum = 4;
			EnumCreateGuild.Message = "Fail GuildTag OR GuildName Exist";	
			LogChange='CreateGuild.js: Fail GuildTag OR GuildName Exist: '+data.GuildName;functions.LogChange(LogChange,2);
		}else{
			EnumCreateGuild.Enum = 1;
			EnumCreateGuild.Message = "Success Create Guild";
			createNewGuild (data);
			calcDiamond(data);
		}
		socket.emit('R_CREATE_GUILD',{R_CREATE_GUILD : EnumCreateGuild});
	});
}
var dataGuild ={
	GuildTag: 	'ABf',
	GuildName: 	'123456a',
	ID_User: 	9,
	Server_ID: 	1,
}

function calcDiamond (data) {
	var updateDiamond = "UPDATE `user_info` SET `Diamond`=`Diamond`-'"+diamondCreateGuild+"' WHERE `ID_User`='"+data.ID_User+"'";
	db_all_user.query(updateDiamond,function (error,result) {	
		if (!!error){DetailError = ('CreateGuild.js: updateDiamond: '+ updateDiamond);functions.WriteLogError(DetailError,2);}
		LogChange = 'CreateGuild.js: removeAddFriend: '+updateDiamond;functions.LogChange(LogChange,2);
	});
}

function createNewGuild (data) {
	var stringInsertNewGuild = "INSERT INTO `guild_info`(`GuildTag`, `GuildName`, `Server_ID`, `LeaderID`, `LeaderName`, `Might`) VALUES ('"
	+data.GuildTag+"','"
	+data.GuildName+"','"
	+data.Server_ID+"','"
	+data.ID_User+"','"
	+data.NameInGame+"','"
	+data.Might+"')";
	//console.log(stringInsertNewGuild);
	db_all_guild.query(stringInsertNewGuild,function (error,result) {
		if (!!error){DetailError = ('CreateGuild.js: createNewGuild: '+stringInsertNewGuild); functions.WriteLogError(DetailError,2);}
		LogChange='CreateGuild.js: createNewGuild: '+stringInsertNewGuild;functions.LogChange(LogChange,2);
		dataCreateGuild.Guild_ID = result.insertId;
		createGuildTable (dataCreateGuild);
		//console.log(dataCreateGuild);
	});
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
		if (!!error){DetailError = ('CreateGuild.js: createGuildTable: '+stringCreateTable); functions.WriteLogError(DetailError,2);}
		LogChange='CreateGuild.js: createGuildTable: '+stringCreateTable;functions.LogChange(LogChange,2);
	});
}

function checkDiamond (data,checkReturn) {
	var returnBool = false;
	var stringQuery = "SELECT `Diamond`, `game_info_s"+data.Server_ID+"`.`NameInGame`,`game_info_s"+data.Server_ID+"`.`Might`,`game_info_s"+data.Server_ID+"`.`Killed` FROM `user_info` INNER JOIN `game_info_s"+data.Server_ID
	+"` WHERE  `user_info`.`ID_User`='"+data.ID_User+"' AND `game_info_s"+data.Server_ID+"`.`ID_User`='"+data.ID_User+"';";
	db_all_user.query(stringQuery,function (error,rows) {
		if (!!error){DetailError = ('GetGuild.js: checkDiamond: '+stringQuery); functions.WriteLogError(DetailError,2);}
		if (rows[0].Diamond>=diamondCreateGuild) {
			returnBool=true;
		}

		dataCreateGuild 			= rows[0];
		dataCreateGuild.ID_User 	= data.ID_User;
		dataCreateGuild.Server_ID	= data.Server_ID;
		dataCreateGuild.GuildTag	= data.GuildTag;
		dataCreateGuild.GuildName 	= data.GuildName;
		
		delete dataCreateGuild.Diamond;
		checkReturn(returnBool,dataCreateGuild);
	}); 
}
function checkLengData (data){
	var returnBool = false;
	if (data.GuildTag.length==3&&(data.GuildName.length<16&&data.GuildName!='')) {
		returnBool = true;
	}
	return returnBool;
}