'use strict';
var db_all_user			= require('./../Util/Database/Db_all_user.js');
var db_all_guild		= require('./../Util/Database/Db_all_guild.js');

var functions 			= require('./../Util/Functions.js');

var createGuild 		= require('./CreateGuild.js');
var applyGuild 			= require('./ApplyGuild.js');
var managerGuild 		= require('./ManagerGuild.js');

var Promise 			= require('promise');
var DetailError, LogChange;


exports.Start = function start (io) {
	io.on('connection', function(socket){
		socket.on('S_CREATE_GUILD', function (data){
			createGuild.S_CREATE_GUILD(socket,data);
		});
		socket.on('S_APPLY_GUILD', function (data){
			applyGuild.S_APPLY_GUILD(socket,data);
		});
		socket.on('S_ACCEPT_APPLY',function (data) {
			applyGuild.S_ACCEPT_APPLY(socket,data);
		});
		socket.on('S_REJECT_APPLY',function (data) {
			applyGuild.S_REJECT_APPLY(socket,data);
		});
		socket.on('S_KICKOUT_GUILD',function (data) {
			managerGuild.S_KICKOUT_GUILD(socket,data);
		});
		socket.on('S_PROMOTE',function (data) {
			managerGuild.S_PROMOTE(socket,data);
		});

	});
}

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
// test ('socket',dataGuild)
// function test (dataGuild) {
// 	applyGuild.S_APPLY_GUILD(socket,dataGuild)
// }

exports.R_USER_GUILD = function r_user_guild (socket,ID_User,Server_ID) {
	var queryGuild_ID = "SELECT `Guild_ID` FROM `game_info_s"+Server_ID+"` WHERE `ID_User`='"+ID_User+"'";
	db_all_user.query(queryGuild_ID,function (error,rows) {
		if (rows[0].Guild_ID!=null) {
			getGuildMember (socket,rows[0].Guild_ID)
		}
	});
}

function getGuildMember (socket,Guild_ID) {
	var stringGuildMember = "SELECT * FROM `"+Guild_ID+"`";

	db_all_guild.query(stringGuildMember,function (error,rows) {
		var currentTime = functions.GetTime();
		for (var i = 0; i < rows.length; i++) {
			delete rows[i].ID;
			if (rows[i].AcceptTime!=null) {
				rows[i].AcceptTime = (new Date(functions.ExportTimeDatabase(rows[i].AcceptTime))-currentTime)*0.001;
			}
			if (rows[i].RemoveTime!=null) {
				rows[i].RemoveTime = (new Date(functions.ExportTimeDatabase(rows[i].RemoveTime))-currentTime)*0.001;
			}
			if (rows[i].LogOutTime!=null) {
				rows[i].LogOutTime = (new Date(functions.ExportTimeDatabase(rows[i].LogOutTime))-currentTime)*0.001;
			}
		}
		socket.emit('R_USER_GUILD',{R_USER_GUILD:rows});
	});
}