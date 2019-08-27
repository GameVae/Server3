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
	
	var dataSend = [];
	db_all_guild.query(stringQuery,function (error,rows) {
		if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'GetGuild.js S_SEARCH_GUILD stringQuery',[stringQuery]);}
		functions.ShowLog(functions.ShowLogBool.Check,'GetGuild.js S_SEARCH_GUILD emit',[rows]);
		if (rows!=null) {
			if (rows.length<20) {
				for (var i = 0; i < 20; i++) {
					dataSend.push(rows[i]);
				}
			}
		}
		socket.emit("R_SEARCH_GUILD",{R_SEARCH_GUILD:dataSend})
	})

}

var dataGuildInfo = {
	Guild_ID: ""
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