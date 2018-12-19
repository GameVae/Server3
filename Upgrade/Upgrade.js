'use strict';

var db_upgrade				= require('./../Util/Database/Db_upgrade_database.js');
var functions 				= require('./../Util/Functions.js');

var DetailError, LogChange;

// exports.Start = function start (io) {
// 	io.on('connection', function(socket){
// 		getS1Pos ();
// 		socket.on('S_UPGRADE', function (data){
// 			//console.log('socketID: '+socket.id);
// 			S_UPGRADE (socket,data);
// 		});
// 	});
// }
var data = {
	ID_User: '9',
	ID_Base: '1',
	ID_Upgrade: '1',
	Level:'2'
}
// function S_UPGRADE (socket,data) {
// 	console.log('S_UPGRADE'+ data);
// }

S_UPGRADE (data);
function S_UPGRADE (data) {
	var stringQuery = "SELECT Name_Upgrade FROM `upgrade` WHERE `ID`="+data.ID_Upgrade;
	db_upgrade.query(stringQuery,function(error,rows){
		var tableQuery = "SELECT * FROM `"+rows[0].Name_Upgrade +"` WHERE `Level`= "+data.Level;
		// console.log(tableQuery);
		db_upgrade.query(tableQuery,function(error,rowsUpgrade){
			console.log(rowsUpgrade);
		});

	});



}
