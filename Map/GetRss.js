'use strict';

var db_rss			= require('./../Util/Database/Db_rss.js');
var functions 		= require('./../Util/Functions.js');

var DetailError, LogChange;
var arrayTimeRSS_s1 =[];
var arrayTimeRSS_s2 =[];
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
	//socket.broadcast.emit('R_GATHER_RSS',{});
	console.log('S_GATHER_RSS '+"update database");
	console.log('R_GATHER_RSS');
}
function S_GET_RSS (socket,data) {
	var table = "s_"+data+"_rss_test";
	var queryString = "SELECT * FROM "+table;

	db_rss.query(queryString,function (error,rows) {
		if (!!error){DetailError = ('GetRss.js: Error query getDataRss');functions.WriteLogError(DetailError);}
		socket.emit('R_GET_RSS',{data:rows});
	});
}

exports.UpdateTimeHarvest = function updateTimeHarvest () {
	console.log('UpdateTimeHarvest');
	var queryStringTimePrepare = "SELECT * FROM `s1_rss` WHERE `TimePrepare`<> 'NULL'";
	var currentTime = new Date().getTime();
	var rowTime = 0;
	db_rss.querry(queryStringTimePrepare,function (error,rows) {
		if (!!error){DetailError = ('GetRss.js: Error query UpdateTimePrepare');functions.WriteLogError(DetailError);}
		for (var i = 0; i < rows.length; i++) {
			rowTime = new Date(rows[i].TimePrepare).getTime();
			if (rowTime<=currentTime) {
				console.log("here")
			}
		}
	});

	var queryStringTimeHarvestFinish = "SELECT * FROM `s1_rss` WHERE `TimeHarvestFinish` <> 'NULL'";

}

updateTimeHarvest();
function updateTimeHarvest () {
	console.log('UpdateTimeHarvest');
	var queryStringTimePrepare = "SELECT * FROM `s1_rss_test` WHERE `TimePrepare`<> 'NULL'";
	var currentTime = new Date().getTime();
	var rowTime = 0;
	db_rss.query(queryStringTimePrepare,function (error,rows) {
		if (!!error){DetailError = ('GetRss.js: Error query UpdateTimePrepare');functions.WriteLogError(DetailError);}

		console.log(rows.length)
		if (rows.length>0) {
			for (var i = 0; i < rows.length; i++) {
				rowTime = new Date(rows[i].TimePrepare).getTime();
				if (rowTime>currentTime) {
					console.log("here: "+rowTime);
				}else{
					console.log(rowTime);	
					console.log(new Date(rowTime).getTime());	
				}
			}
		}		
	});

	var queryStringTimeHarvestFinish = "SELECT * FROM `s1_rss` WHERE `TimeHarvestFinish` <> 'NULL'";
}

function countLength (dictionary) {
	return Object.keys(dictionary).length;
}