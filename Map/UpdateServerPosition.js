'use strict';

var db_rss			= require('./../Util/Database/Db_rss.js');
var db_position		= require('./../Util/Database/Db_position.js');
var functions 		= require('./../Util/Functions.js');

var DetailError, LogChange;
var arrayTimeRSS_s1 =[];
var arrayTimeRSS_s2 =[];

updateDatabase (1);
function updateDatabase (serverInt) {
	var stringSelectRss = "SELECT * FROM `s"+serverInt+"_rss`";
	var stringQueryRss,stringUpdateData;
	var rowsData;
	//console.log(stringUpdate);
	db_rss.query(stringSelectRss,function (error,rows) {
		if (!!error){DetailError = ('UpdateServerPosition: stringSelectRss'); functions.WriteLogError(DetailError);}
		//console.log(rows[0].Position)
		if (rows.length>0) {
			for (var i = 0; i < rows.length; i++) {
				stringQueryRss = "SELECT * FROM `s"+serverInt+"_position` WHERE `Position_Cell` = '"+ rows[i].Position +"'";
				//console.log(stringQueryRss);
				rowsData = rows[i];
				db_position.query(stringQueryRss,function (error,rows_s1_position) {
					if (rows_s1_position.length==0) {
						stringUpdateData = "INSERT INTO `s"+serverInt+"_position`(`Position_Cell`, `ID_Type`, `Comment`) VALUES ('"+
						rowsData.Position+"','"+
						rowsData.RssType+"','"+
						"RSS'"+")";
						console.log(stringUpdateData);
					}
				});
			}
		}

		// var stringUpdate = "INSERT INTO `s"+serverInt+"_position`(`Position_Cell`, `ID_Type`, `Comment`) VALUES ('"+
		// rows[0].Position+"','"+
		// rows[0].RssType+"','"+
		// "RSS'"+")";
		// db_position.query(stringUpdate,function (error,result) {
		// 	console.log(error);
		// 	console.log(result);
		// });

	});
}
function countLength (dictionary) {
	return Object.keys(dictionary).length;
}