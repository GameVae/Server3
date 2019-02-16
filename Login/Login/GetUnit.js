'use strict';
var db_position				= require('./../../Util/Database/Db_position.js');

var functions 				= require('./../../Util/Functions.js');

var DetailError, LogChange;

var dataUnit ={}

exports.R_UNIT = function r_unit (socket,ID_User,Server_ID) {
	var stringQuery = "SELECT * FROM `s"+Server_ID+"_unit` ORDER BY `ID_User` ='"+ID_User+"'";
	db_position.query(stringQuery,function (error,rows) {
		if (!!error){DetailError = ('GetUnit.js: query '+stringQuery); functions.WriteLogError(DetailError,2);}
		var currentTime = functions.GetTime();
		for (var i = 0; i < rows.length; i++) {
			if (rows[i].TimeMoveNextCell!=null) {
				rows[i]["TimeMoveNextCell"] = (new Date(functions.ExportTimeDatabase(rows[i].TimeMoveNextCell))-currentTime)*0.001;
			}
		}
		dataUnit = rows;
		socket.emit('R_UNIT',{R_UNIT:dataUnit});
	});
}

