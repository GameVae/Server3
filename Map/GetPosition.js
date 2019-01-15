'use strict';

var db_position		= require('./../Util/Database/Db_position.js');
var functions 		= require('./../Util/Functions.js');

var DetailError, LogChange;

exports.R_GET_POSITION = function R_GET_POSITION (socket,serverInt) {
	var table = "s"+serverInt+"_position";	
	var queryString = "SELECT * FROM `"+table+"`"
	
	db_position.query(queryString,function (error,rows) {
		if (!!error){DetailError = ('GetRss.js: Error query getDataRss');functions.WriteLogError(DetailError,1);}
		socket.emit('R_GET_POSITION',{R_GET_POSITION:rows});
	});
}

