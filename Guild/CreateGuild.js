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

var dataGuild_S_CREATE_GUILD ={
	GuildTag: 	'ABf',
	GuildName: 	'123456a',
	ID_User: 	9,
	Server_ID: 	1,
}

var redis = require('redis');
var client = redis.createClient();
client.select(functions.RedisData.TestUnit);


exports.S_CREATE_GUILD = function (socket,data) { 
	//console.log(data)
	functions.ShowLog(functions.ShowLogBool.Clear,'CreateGuild.js S_CREATE_GUILD data',[data]);
	checkData (socket,data);
}

function checkData (socket,data) {	
	functions.ShowLog(functions.ShowLogBool.Clear,'CreateGuild.js checkData data',[data]);
	var lengthBool = checkLengData (data);
	if (!lengthBool) {
		EnumCreateGuild.Enum = 2;
		EnumCreateGuild.Message = "Fail Length GuildTag Or GuildName";
		//socket.emit('R_CREATE_GUILD',{R_CREATE_GUILD : EnumCreateGuild});
	}else{
		functions.ShowLog(functions.ShowLogBool.Clear,'CreateGuild.js checkData=>checkDiamond data',[data]);
		checkDiamond (data,function (checkBool,returnDataCheck) {
			functions.ShowLog(functions.ShowLogBool.Clear,'CreateGuild.js checkData checkBool,returnDataCheck',[checkBool,returnDataCheck]);
			if(!checkBool){
				functions.ShowLog(functions.ShowLogBool.Error,'CreateGuild.js checkData checkBool,returnDataCheck',[checkBool,returnDataCheck]);
				EnumCreateGuild.Enum = 3;
				EnumCreateGuild.Message = "Fail Diamond Create Guild";					
				// socket.emit('R_CREATE_GUILD',{R_CREATE_GUILD : EnumCreateGuild});
				functions.ShowLog(functions.ShowLogBool.Error,'CreateGuild.js checkData error Diamond',[checkBool]);
			}else{
				functions.ShowLog(functions.ShowLogBool.Clear,'CreateGuild.js checkData=>checkGuildName returnDataCheck',[returnDataCheck]);
				checkGuildName(socket,returnDataCheck);					
			}
		});
	}
}
function checkGuildName (socket,data) {	
	var stringCheckName = "SELECT * FROM `guild_info` WHERE"+
	" `GuildTag`='"+data.GuildTag+"' OR `GuildName`='"+data.GuildName+"'";
	functions.ShowLog(functions.ShowLogBool.Clear,'CreateGuild.js checkGuildName data,stringCheckName',[data,stringCheckName]);
	db_all_guild.query(stringCheckName,function (error,rows) {
		if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'CreateGuild.js checkGuildName stringCheckName',[stringCheckName]);}
		console.log('rows')
		console.log(rows)
		if (rows.length>0) {
			EnumCreateGuild.Enum = 4;
			EnumCreateGuild.Message = "Fail GuildTag OR GuildName Exist";	
			functions.ShowLog(functions.ShowLogBool.Clear,'CreateGuild.js checkGuildName Fail GuildTag OR GuildName Exist data,stringCheckName,EnumCreateGuild',[data,stringCheckName,EnumCreateGuild]);
			functions.ShowLog(functions.ShowLogBool.LogChange,'CreateGuild.js checkGuildName Fail GuildTag OR GuildName Exist data,stringCheckName,EnumCreateGuild',[data,stringCheckName,EnumCreateGuild]);
		}else{
			EnumCreateGuild.Enum = 1;
			EnumCreateGuild.Message = "Success Create Guild";
			functions.ShowLog(functions.ShowLogBool.Clear,'CreateGuild.js checkGuildName=>createNewGuild data,EnumCreateGuild',[data,EnumCreateGuild]);
			createNewGuild (data);
			functions.ShowLog(functions.ShowLogBool.Clear,'CreateGuild.js checkGuildName=>calcDiamond data,EnumCreateGuild',[data,EnumCreateGuild]);
			calcDiamond(data);
		}
		functions.ShowLog(functions.ShowLogBool.Clear,'CreateGuild.js checkGuildName=>emit data,stringCheckName',[data,stringCheckName]);
		socket.emit('R_CREATE_GUILD',{R_CREATE_GUILD : EnumCreateGuild});
	});
}

function calcDiamond (data) {
	var updateDiamond = "UPDATE `user_info` SET `Diamond`=`Diamond`-'"+diamondCreateGuild+"' WHERE `ID_User`='"+data.ID_User+"'";
	functions.ShowLog(functions.ShowLogBool.Clear,'CreateGuild.js calcDiamond data,updateDiamond',[data,updateDiamond]);
	db_all_user.query(updateDiamond,function (error,result) {	
		if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'CreateGuild.js calcDiamond data,updateDiamond',[data,updateDiamond]);}
		functions.ShowLog(functions.ShowLogBool.LogChange,'CreateGuild.js calcDiamond data,updateDiamond',[data,updateDiamond]);
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
	functions.ShowLog(functions.ShowLogBool.Clear,'CreateGuild.js createNewGuild data,stringInsertNewGuild',[data,stringInsertNewGuild]);
	db_all_guild.query(stringInsertNewGuild,function (error,result) {
		if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'CreateGuild.js createNewGuild data,stringInsertNewGuild',[data,stringInsertNewGuild]);}
		dataCreateGuild = data;
		functions.ShowLog(functions.ShowLogBool.LogChange,'CreateGuild.js createNewGuild data,stringInsertNewGuild',[data,stringInsertNewGuild]);
		dataCreateGuild.Guild_ID = result.insertId;
		functions.ShowLog(functions.ShowLogBool.LogChange,'CreateGuild.js createNewGuild=>createGuildTable dataCreateGuild',[data,dataCreateGuild]);
		createGuildTable (dataCreateGuild);
		functions.ShowLog(functions.ShowLogBool.LogChange,'CreateGuild.js createNewGuild=>updateGuildRedis dataCreateGuild',[data,dataCreateGuild]);
		updateGuildRedis (dataCreateGuild.Guild_ID,dataCreateGuild)
	});

}

function updateGuildRedis (GuildID,data) {
	var stringHGuild = "all_guilds";
	functions.ShowLog(functions.ShowLogBool.Clear,'CreateGuild.js updateGuildRedis GuildID,data,stringHGuild',[GuildID,data,stringHGuild]);
	client.hset(stringHGuild,data.ID_User,GuildID.toString());

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
	functions.ShowLog(functions.ShowLogBool.Clear,'CreateGuild.js createGuildTable data,stringCreateTable',[data,stringCreateTable]);
	db_all_guild.query(stringCreateTable,function (error,result) {
		if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'CreateGuild.js createGuildTable data,stringCreateTable',[data,stringCreateTable]);}
		functions.ShowLog(functions.ShowLogBool.LogChange,'CreateGuild.js createGuildTable data,stringCreateTable',[data,stringCreateTable]);
	});
}

function checkDiamond (data,checkReturn) {
	var returnBool = false;
	var stringQuery = "SELECT `Diamond`, `game_info_s"+data.Server_ID+"`.`NameInGame`,`game_info_s"+data.Server_ID+"`.`Might`,`game_info_s"+data.Server_ID+"`.`Killed` FROM `user_info` INNER JOIN `game_info_s"+data.Server_ID
	+"` WHERE  `user_info`.`ID_User`='"+data.ID_User+"' AND `game_info_s"+data.Server_ID+"`.`ID_User`='"+data.ID_User+"';";
	functions.ShowLog(functions.ShowLogBool.Clear,'CreateGuild.js checkDiamond data,stringQuery',[data,stringQuery]);
	
	db_all_user.query(stringQuery,function (error,rows) {

		if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'CreateGuild.js checkDiamond data,stringQuery',[data,stringQuery]);}	
		if (rows[0].Diamond>=diamondCreateGuild) {
			returnBool=true;
		}

		dataCreateGuild 			= rows[0];
		dataCreateGuild.ID_User 	= data.ID_User;
		dataCreateGuild.Server_ID	= data.Server_ID;
		dataCreateGuild.GuildTag	= data.GuildTag;
		dataCreateGuild.GuildName 	= data.GuildName;
		
		delete dataCreateGuild.Diamond;
		if (!!error){functions.ShowLog(functions.ShowLogBool.Error,'CreateGuild.js checkDiamond data,stringQuery',[data,stringQuery]);}
		functions.ShowLog(functions.ShowLogBool.Clear,'CreateGuild.js checkDiamond checkReturn returnBool,dataCreateGuild',[returnBool,dataCreateGuild]);
		checkReturn(returnBool,dataCreateGuild);
	}); 
}

function checkLengData (data){
	functions.ShowLog(functions.ShowLogBool.Clear,'CreateGuild.js checkLengData data',[data]);
	var returnBool = false;
	if (data.GuildTag.length==3&&(data.GuildName.length<16&&data.GuildName!='')) {
		returnBool = true;
	}
	functions.ShowLog(functions.ShowLogBool.Clear,'CreateGuild.js checkLengData returnBool',[returnBool]);
	return returnBool;
}