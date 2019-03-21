'use strict';
var db_position				= require('./../../Util/Database/Db_position.js');

var functions 				= require('./../../Util/Functions.js');

var DetailError, LogChange;

var dataUnit = {};


exports.Start = function start (io) {
	io.on('connection', function(socket){
		socket.on('S_UNIT', function (data){
			// console.log('S_UNIT: '+data);
			R_UNIT (socket,data.ID_User,data.Server_ID);
		});
	});
}

function R_UNIT (socket,ID_User,Server_ID) {
	var stringQuery = "SELECT * FROM `s"+Server_ID+"_unit` ORDER BY `ID_User` ='"+ID_User+"'";
	db_position.query(stringQuery,function (error,rows) {
		if (!!error){DetailError = ('GetUnit.js: query '+stringQuery); functions.WriteLogError(DetailError,2);}
		
		for (var i = 0; i < rows.length; i++) {
			var currentTime = functions.GetTime();
			if (rows[i].TimeMoveNextCell != null) {
				rows[i]["TimeMoveNextCell"] = (new Date(functions.ExportTimeDatabase(rows[i].TimeMoveNextCell))-currentTime);		
			}
			if (rows[i].TimeFinishMove != null) {
				rows[i]["TimeFinishMove"] = (new Date(functions.ExportTimeDatabase(rows[i].TimeFinishMove))-currentTime);
			}
			if (rows[i].ListMove!=null) {
				var ListMoveJson = JSON.parse(rows[i].ListMove);
				if (ListMoveJson.length>0) {
					for (var j = 0; j < ListMoveJson.length; j++) {	
						ListMoveJson[j].TimeMoveNextCell = (new Date(functions.ExportTimeDatabase(ListMoveJson[j].TimeMoveNextCell))-currentTime);
					}
				}				
				rows[i].ListMove = ListMoveJson;
			}
			delete rows[i].Attack;
			delete rows[i].Defend;
		}
		dataUnit = rows;		
		socket.emit('R_UNIT',{R_UNIT:dataUnit});
	});
}