'use strict';
var db_all_user			= require('./../Util/Database/Db_all_user.js');
var db_all_guild		= require('./../Util/Database/Db_all_guild.js');

var functions 			= require('./../Util/Functions.js');

var Promise 			= require('promise');
var DetailError, LogChange;

var diamondCreateGuild = 500;

var dataCreateGuild={};
var EnumCreateGuild={}
var DictTimeOut ={};

exports.S_DELETE_GUILD = function s_DELETE_GUILD (socket,data) {
	//console.log(data)
	//checkData (socket,data)
}
