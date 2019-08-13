'use strict';
var db_all_user			= require('./../Util/Database/Db_all_user.js');
var db_all_guild		= require('./../Util/Database/Db_all_guild.js');

var functions 			= require('./../Util/Functions.js');

var Promise 			= require('promise');

var DetailError, LogChange;

var Promise = require('promise');

exports.Start = function start (io) {
	io.on('connection', function(socket){
		socket.on('S_SEARCH_GUILD', function (data){
			functions.ShowLog(functions.ShowLogBool.Check,'GuildInfo.js Start=>S_SEARCH_GUILD data',[data]);
			S_SEARCH_GUILD(socket,data);
		});
		socket.on('S_GET_GUILD_INFO', function (data){
			functions.ShowLog(functions.ShowLogBool.Check,'GuildInfo.js Start=>S_GET_GUILD_INFO data',[data]);
			S_GET_GUILD_INFO(socket,data);
		});
	});
}

var dataSearchGuild ={
	GuildTag: "",
	GuildName: "",
}

function S_SEARCH_GUILD (socket,data) {
	var stringQuery = "SELECT * FROM `guild_info` WHERE `GuildTag` LIKE '"+data.GuildTag+"' OR `GuildName` LIKE '"+data.GuildName+"'";
	functions.ShowLog(functions.ShowLogBool.Check,'GetGuild.js S_SEARCH_GUILD data,stringQuery',[data,stringQuery]);
	db_all_guild.query(stringQuery,function (error,rows) {
		if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'GetGuild.js S_SEARCH_GUILD stringQuery',[stringQuery]);}
		functions.ShowLog(functions.ShowLogBool.Check,'GetGuild.js S_SEARCH_GUILD emit',[rows]);
		socket.emit("R_SEARCH_GUILD",{R_SEARCH_GUILD:rows})
	})

}

var dataGuildInfo ={
	Guild_ID: "",
}

function S_GET_GUILD_INFO (socket,data) {
	functions.ShowLog(functions.ShowLogBool.Check,'GetGuild.js S_GET_GUILD_INFO data',[data]);
	var dataSend = [];
	new Promise((resolve,reject)=>{
		var stringQueryGuildInfo = "SELECT * FROM `guild_info` WHERE `Guild_ID`='"+data.Guild_ID+"'"
		functions.ShowLog(functions.ShowLogBool.Check,'GetGuild.js S_GET_GUILD_INFO stringQueryGuildInfo',[stringQueryGuildInfo]);
		db_all_guild.query(stringQueryGuildInfo,function (error,rows) {
			if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'GetGuild.js S_GET_GUILD_INFO stringQueryGuildInfo',[stringQueryGuildInfo]);}
			if (rows[0]!=null) {dataSend.push(rows[0]);}
			else{
				dataSend.push(null);
			}
			functions.ShowLog(functions.ShowLogBool.Check,'GetGuild.js S_GET_GUILD_INFO dataSend1',[dataSend]);
			resolve();
		})
	}).then(()=>{
		return new Promise((resolve,reject)=>{
			var stringQueryGuildMember = "SELECT * FROM `"+data.Guild_ID+"`"
			db_all_guild.query(stringQueryGuildMember,function (error,rows) {
				if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'GetGuild.js S_GET_GUILD_INFO stringQueryGuildMember',[stringQueryGuildMember]);}
				if (rows[0]!=null) {dataSend.push(rows[0]);}
				else{
					dataSend.push(null);
				}
				functions.ShowLog(functions.ShowLogBool.Check,'GetGuild.js S_GET_GUILD_INFO dataSend2',[dataSend]);
				resolve();
			})
		})
	}).then(()=>{
		// console.log(dataSend)
		functions.ShowLog(functions.ShowLogBool.Check,'GetGuild.js S_GET_GUILD_INFO emit R_GET_GUILD_INFO',[dataSend]);
		socket.emit("R_GET_GUILD_INFO",{S_GET_GUILD_INFO:dataSend})
	})
	
}

// exports.R_USER_GUILD = function (socket,ID_User,Server_ID) {
// 	var queryGuild_ID = "SELECT `Guild_ID` FROM `game_info_s"+Server_ID+"` WHERE `ID_User`='"+ID_User+"'";
// 	functions.ShowLog(functions.ShowLogBool.Check,'GetGuild.js R_USER_GUILD ID_User,Server_ID,queryGuild_ID',[ID_User,Server_ID,queryGuild_ID]);
// 	db_all_user.query(queryGuild_ID,function (error,rows) {
// 		if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'GetGuild.js R_USER_GUILD queryGuild_ID',[queryGuild_ID]);}
// 		if (rows[0].Guild_ID!=null) {
// 			functions.ShowLog(functions.ShowLogBool.Check,'GetGuild.js R_USER_GUILD=>getGuildMember rows[0].Guild_ID',[rows[0].Guild_ID]);
// 			getGuildMember (socket,rows[0].Guild_ID);
// 		}
// 	});
// }

// function getGuildMember (socket,Guild_ID) {
// 	var stringGuildMember = "SELECT * FROM `"+Guild_ID+"`";

// 	functions.ShowLog(functions.ShowLogBool.Check,'GetGuild.js getGuildMember stringGuildMember,Guild_ID',[stringGuildMember,Guild_ID]);
// 	db_all_guild.query(stringGuildMember,function (error,rows) {
// 		if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'GetGuild.js getGuildMember stringGuildMember',[stringGuildMember]);}
// 		var currentTime = functions.GetTime();
// 		for (var i = 0; i < rows.length; i++) {
// 			delete rows[i].ID;
// 			if (rows[i].AcceptTime!=null) {
// 				rows[i].AcceptTime = (new Date(functions.ExportTimeDatabase(rows[i].AcceptTime))-currentTime)*0.001;
// 			}
// 			if (rows[i].RemoveTime!=null) {
// 				rows[i].RemoveTime = (new Date(functions.ExportTimeDatabase(rows[i].RemoveTime))-currentTime)*0.001;
// 			}
// 			if (rows[i].LogOutTime!=null) {
// 				rows[i].LogOutTime = (new Date(functions.ExportTimeDatabase(rows[i].LogOutTime))-currentTime)*0.001;
// 			}
// 		}
// 		functions.ShowLogBool.Check,'GetGuild.js getGuildMember emit rows',[rows]
// 		socket.emit('R_USER_GUILD',{R_USER_GUILD:rows});
// 	});
// }