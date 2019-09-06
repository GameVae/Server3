'use strict';

var db_s1_base_info			= require('./../Util/Database/Db_s1_base_info.js');
var db_s1_upgrade			= require('./../Util/Database/Db_s1_base_upgrade.js');

var db_s2_base_info			= require('./../Util/Database/Db_s2_base_info.js');
var db_s2_upgrade			= require('./../Util/Database/Db_s2_base_upgrade.js');

var db_all_user				= require('./../Util/Database/Db_all_user.js');
var db_all_harvest			= require('./../Util/Database/Db_all_harvest.js');

var db_upgrade_database		= require('./../Util/Database/Db_upgrade_database.js');

var functions 				= require('./../Util/Functions.js');

var harvest 				= require('./Harvest.js');

var Promise 				= require('promise');

// var redis = require('redis');
// var client = redis.createClient();
// client.select(functions.RedisData.TestUnit);
var currentTime;

var dataHarvest = {
	ID_User 	:"",
	ID_Server	:"",
	ID_Upgrade	:"",
}

exports.Start = function start (io) {
	io.on('connection', function(socket){
		socket.on('S_HARVEST', function (data){
			functions.ShowLog(functions.ShowLogBool.Clear,'GetHarvest.js Start=>S_HARVEST data',[data]);
			S_HARVEST (io,data);
		});
	});
}

function S_HARVEST (io,data) {
	harvest.StartHarvest(io,data.ID_User,data.ID_Upgrade,data.ID_Server);
}