'use strict';
var db_all_user			= require('./../Util/Database/Db_all_user.js');
var db_all_guild		= require('./../Util/Database/Db_all_guild.js');

var functions 			= require('./../Util/Functions.js');

var Promise 			= require('promise');
var DetailError, LogChange;

var timeAccept 		= 24*60*60*60*1000;
var timeUnfriend 	= 8*60*60*60*1000;
var timeOut;

var diamondCreateGuild = 500;

var dataCreateGuild={};
var EnumCreateGuild={}

var timeAccept 		= 8*60*60*60*1000;

exports.Start = function start (io) {
	io.on('connection', function(socket){
		socket.on('S_CREATE_GUILD', function (data){
			//console.log('socketID: '+socket.id);
			S_CREATE_GUILD (socket,data);
		});
		// socket.on('S_ACCEPT_FRIEND',function (data) {
		// 	S_ACCEPT_FRIEND(socket,data);
		// });
		// socket.on('S_UNFRIEND',function (socket,data) {
		// 	S_UNFRIEND(socket,data);
		// });
	});


}

// var dataGuild ={
// 	GuildTag: 	'ABf',
// 	GuildName: 	'123456a',
// 	ID_User: 	9,
// 	Server_ID: 	1,
// }
// S_CREATE_GUILD (dataGuild);

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


var dataApplication={
	ID_User: 	42,
	NameInGame: 'Mquan2',
	Guild_ID: 	13,
	Server_ID: 	1,
}
//---//
S_APPLICATION (dataApplication);
function S_APPLICATION (data) {
	checkCurrentGuild (data,function (checkGuildBool) {
		if (checkGuildBool==false) {
			console.log('chua co guild')
		}
	});
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
				console.log('have guild')
			}
			resolve();
		});
	}).then(new Promise((resolve,reject)=>{		
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