'use strict';

var db_s1_rss			= require('./../Util/Database/Db_s1_rss.js');
var functions 			= require('./../Util/Functions.js');

var DetailError, LogChange;

exports.Start = function start (io) {
	io.on('connection', function(socket){
		socket.on('S_GET_RSS', function (data){
			S_GET_RSS (socket,data);
		});
		socket.on('S_GATHER_RSS', function (data){
			S_GATHER_RSS (socket,data);
		});
	});
}

function S_GATHER_RSS (socket,data) {
	//socket.broadcast.emit('S_GATHER_RSS',{});
	
}
function S_GET_RSS (socket,data) {
	var table = "s_"+data+"_rss_test";
	var queryString = "SELECT * FROM "+table;

	db_s1_rss.query(queryString,function (error,rows) {
		if (!!error){DetailError = ('GetRss.js: Error query getDataRss');functions.WriteLogError(DetailError);}
		socket.emit('R_GET_RSS',{data:rows});
	});
}

exports.UpdateTimeHarvest  = function updateTimeHarvest (argument) {
	console.log('UpdateTimeHarvest');
}