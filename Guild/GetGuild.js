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
			functions.ShowLog(functions.ShowLogBool.Check,'GetGuild.js Start=>createGuild.S_CREATE_GUILD data',[data]);
			createGuild.S_CREATE_GUILD(socket,data);
		});

		socket.on('S_APPLY_GUILD', function (data){
			functions.ShowLog(functions.ShowLogBool.Check,'GetGuild.js Start=>applyGuild.S_APPLY_GUILD data',[data]);
			applyGuild.S_APPLY_GUILD(io,socket,data);
		});
		socket.on('S_ACCEPT_APPLY',function (data) {
			functions.ShowLog(functions.ShowLogBool.Check,'GetGuild.js Start=>applyGuild.S_ACCEPT_APPLY data',[data]);
			applyGuild.S_ACCEPT_APPLY(io,data);
		});
		socket.on('S_REJECT_APPLY',function (data) {
			functions.ShowLog(functions.ShowLogBool.Check,'GetGuild.js Start=>applyGuild.S_REJECT_APPLY data',[data]);
			applyGuild.S_REJECT_APPLY(io,data);
		});

		socket.on('S_KICKOUT_GUILD',function (data) {
			functions.ShowLog(functions.ShowLogBool.Check,'GetGuild.js Start=>managerGuild.S_KICKOUT_GUILD data',[data]);
			managerGuild.S_KICKOUT_GUILD(io,data);
		});
		socket.on('S_PROMOTE',function (data) {
			functions.ShowLog(functions.ShowLogBool.Check,'GetGuild.js Start=>managerGuild.S_PROMOTE data',[data]);
			managerGuild.S_DELETE_GUILD(socket,data);
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

exports.R_USER_GUILD = function (socket,ID_User,Server_ID) {
	var queryGuild_ID = "SELECT `Guild_ID` FROM `game_info_s"+Server_ID+"` WHERE `ID_User`='"+ID_User+"'";
	functions.ShowLog(functions.ShowLogBool.Check,'GetGuild.js R_USER_GUILD ID_User,Server_ID,queryGuild_ID',[ID_User,Server_ID,queryGuild_ID]);
	db_all_user.query(queryGuild_ID,function (error,rows) {
		if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'GetGuild.js R_USER_GUILD queryGuild_ID',[queryGuild_ID]);}
		if (rows[0].Guild_ID!=null) {
			functions.ShowLog(functions.ShowLogBool.Check,'GetGuild.js R_USER_GUILD=>getGuildMember rows[0].Guild_ID',[rows[0].Guild_ID]);
			getGuildMember (socket,rows[0].Guild_ID);
		}
	});
}

function getGuildMember (socket,Guild_ID) {
	var stringGuildMember = "SELECT * FROM `"+Guild_ID+"`";
	
	functions.ShowLog(functions.ShowLogBool.Check,'GetGuild.js getGuildMember stringGuildMember,Guild_ID',[stringGuildMember,Guild_ID]);
	db_all_guild.query(stringGuildMember,function (error,rows) {
		if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'GetGuild.js getGuildMember stringGuildMember',[stringGuildMember]);}
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
			rows[i].Guild_ID = Guild_ID;
		}
		functions.ShowLog(functions.ShowLogBool.Check,'GetGuild.js getGuildMember emit rows',[rows]);
		socket.emit('R_USER_GUILD',{R_USER_GUILD:rows});
	});
}