'use strict';

var db_s1_base_info			= require('./../../Util/Database/Db_s1_base_info.js');
var db_s1_upgrade			= require('./../../Util/Database/Db_s1_base_upgrade.js');

var db_s2_base_info			= require('./../../Util/Database/Db_s2_base_info.js');
var db_s2_upgrade			= require('./../../Util/Database/Db_s2_base_upgrade.js');

var functions 			= require('./../../Util/Functions.js');

var dbInfo;

var dataUser={
	ID_User: 9,
	ID_Server: 1,

}
var dataInfo={}

exports.R_BASE_INFO = function r_base_info (socket,ID_User,Server_ID) {
	
	switch (parseInt(ID_Server)) {
		case 1:
		dbInfo = db_s1_base_info;
		break;
		case 2:
		dbInfo = db_s2_base_info;
		break;
	}
	var stringQuery = "SELECT * FROM `"+ID_User+"`";
	dbInfo.query(stringQuery, function (error,rows) {
		var currentTime = functions.GetTime();
		
		for (var i = 0; i < rows.length; i++) {
			dataInfo = rows[i]
			if (rows[i].UpgradeTime!=null) {
				dataInfo["UpgradeTime "]= (new Date(functions.ExportTimeDatabase(rows[i].UpgradeTime))-currentTime)/1000;
			}
			if (rows[i].ResearchTime!=null) {
				dataInfo["ResearchTime"]= (new Date(functions.ExportTimeDatabase(rows[i].ResearchTime))-currentTime)/1000;
			}
			if (rows[i].ResearchTime!=null) {
				dataInfo["UnitTransferTime "]= (new Date(functions.ExportTimeDatabase(rows[i].UnitTransferTime))-currentTime)/1000;
			}
			if (rows[i].TrainingTime!=null) {
				dataInfo["TrainingTime"]= (new Date(functions.ExportTimeDatabase(rows[i].TrainingTime))-currentTime)/1000;
			}
			delete dataInfo["ID"];
			socket.Emit('R_BASE_INFO',dataInfo);
		}
	});
}
