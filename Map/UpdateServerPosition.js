'use strict';

var db_rss			= require('./../Util/Database/Db_rss.js');
var db_position		= require('./../Util/Database/Db_position.js');

var db_s1_base_info = require('./../Util/Database/Db_s1_base_info.js');
var db_s2_base_info = require('./../Util/Database/Db_s2_base_info.js');

var functions 		= require('./../Util/Functions.js');

var DetailError, LogChange;
var arrayTimeRSS_s1 =[];
var arrayTimeRSS_s2 =[];
var queryUpdatePos;

exports.UpdateDatabase = function updateDatabase (serverInt) {
	updateFromRSS (serverInt);
	updateFromPlayer(serverInt);
	updateFromUnit(serverInt);
}

exports.UpdatePosition = function updatePosition (serverInt,ID_Type) {
	var updateString = "UPDATE `s"+serverInt+"_position` SET `Position_Cell`='"+rows[i].Position+"'' WHERE `ID_Type`='"+ID_Type+"';"
	db_position.query(updateString,function (error,result) {
		if (!!error){DetailError = ('UpdateServerPosition.js: UpdatePosition '+ID_Type);functions.WriteLogError(DetailError);}
		LogChange='UpdateServerPosition.js: UpdatePosition '+updateString;functions.LogChange(LogChange);
	});
}

function updateFromPlayer(serverInt) {
	var queryString = "SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 's"+serverInt+"_base_info' AND TABLE_NAME <> 's"+serverInt+"_base_info'";
	// console.log(queryString);
	var dbBase_info;
	switch (serverInt) {
		case 1:
		dbBase_info = db_s1_base_info;
		break;
		case 1:
		dbBase_info = db_s2_base_info;
		break;
	}
	dbBase_info.query(queryString,function (error,rows) {
		if (!!error){DetailError = ('UpdateServerPosition.js: query updateFromPlayer ');functions.WriteLogError(DetailError);}
		if (rows!=undefined) {
			for (var i = 0; i < rows.length; i++) {
				queryBaseTable(dbBase_info,rows[i],serverInt);
			}
		}	
	});
}

function queryBaseTable (dbBase_info,data,serverInt) {
	var tableQuery = data.TABLE_NAME;
	var stringTableQuery = "SELECT `ID_User`,`Position`,`BaseNumber` FROM `"+tableQuery+"`";
	dbBase_info.query(stringTableQuery, function (error,rows) {
		if (!!error){DetailError = ('UpdateServerPosition.js: query stringTableQuery ');functions.WriteLogError(DetailError);}
		if (rows!=undefined) {
			for (var i = 0; i < rows.length; i++) {
				var updateString = "UPDATE `s"+serverInt+"_position` SET `Position_Cell`="+rows[i].Position+" WHERE `ID_Type`="+rows[i].ID_User+"_0_"+rows[i].BaseNumber;
				db_position.query(updateString,function (error,updateResult) {
					if (!!error){DetailError = ('UpdateServerPosition.js: query updateString ');functions.WriteLogError(DetailError);}
					LogChange='UpdateServerPosition.js: updateString '+updateString;functions.LogChange(LogChange);
				});
			}		
		}
	});
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

				// queryUpdatePos = "INSERT INTO `s"+serverInt+"_position` (`Position_Cell`, `ID_Type`, `Comment`) VALUES ('"+
				// rowsQueryString[i].Position+"','"+
				// rowsQueryString[i].ID+"','"+
				// "RSS')";
				queryUpdatePos = "UPDATE `s"+serverInt+"_position` SET "+
				"`Position_Cell`='"+rowsQueryString[i].Position+
				"',`ID_Type`'"+rowsQueryString[i].ID_Type+
				"' WHERE `ID`='"+rowsQueryString[i].ID+"';";
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