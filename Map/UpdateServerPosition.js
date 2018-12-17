'use strict';

var db_rss			= require('./../Util/Database/Db_rss.js');
var db_position		= require('./../Util/Database/Db_position.js');
var functions 		= require('./../Util/Functions.js');

var DetailError, LogChange;
var arrayTimeRSS_s1 =[];
var arrayTimeRSS_s2 =[];
var queryUpdatePos;

updateDatabase (1);

function updateDatabase (serverInt) {
	updateFromRSS (serverInt);
	updateFromPlayer(serverInt);
}

function updateFromPlayer(serverInt) {
	
}
function updateFromUnit(serverInt) {
	
}
function updateFromRSS (serverInt) {
	var queryString = "SELECT * FROM `s"+serverInt+"_rss`";
	//console.log(queryString);
	db_rss.query(queryString,function (error,rowsQueryString) {
		if (!!error){DetailError = ('UpdateServerPosition.js: Error queryStringRSS '+ queryString);functions.WriteLogError(DetailError);}
		if (rowsQueryString.length>0) {
			for (var i = 0; i < rowsQueryString.length; i++) {
				queryUpdatePos = "INSERT INTO `s"+serverInt+"_position_test`(`Position_Cell`, `ID_Type`, `Comment`) VALUES ('"+
				rowsQueryString[i].Position+"','"+
				rowsQueryString[i].ID+"','"+
				"RSS')";
				db_position.query(queryUpdatePos,function (error,resultQueryUpdatePos) {
					if (!!error){DetailError = ('UpdateServerPosition.js: Error queryUpdatePos ');functions.WriteLogError(DetailError);}
				});
			}			
		}
	});
}
function countLength (dictionary) {
	return Object.keys(dictionary).length;
}