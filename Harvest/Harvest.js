'use strict';

var db_s1_base_info			= require('./../Util/Database/Db_s1_base_info.js');
var db_s1_upgrade			= require('./../Util/Database/Db_s1_base_upgrade.js');

var db_s2_base_info			= require('./../Util/Database/Db_s2_base_info.js');
var db_s2_upgrade			= require('./../Util/Database/Db_s2_base_upgrade.js');

var db_all_user				= require('./../Util/Database/Db_all_user.js');
var db_all_harvest			= require('./../Util/Database/Db_all_harvest.js');
var db_positon 				= require('./../Util/Database/Db_position.js');
var db_upgrade_database		= require('./../Util/Database/Db_upgrade_database.js');

var functions 				= require('./../Util/Functions.js');

var Promise 				= require('promise');

var redis = require('redis');
var client = redis.createClient();
client.select(functions.RedisData.TestUnit);

var dbUpgrade,dbBase;
var DetailError, LogChange;
var currentTime;

var DictTimeHarvest={};

exports.StartHarvest = function (io,ID_User,ID_Upgrade,ID_Server) {
	var dataRss={};
	var dataInfo={};
	var stringUpdateUserRSS;
	var stringResetHarvest;
	var timeFullHarvest;
	var stringUpdateFullHarvest;
	
	var calcRssPerSec = 0;
	var currentHarvest = 0;	
	var harvestFullSec = 0;

	new Promise((resolve,reject)=>{
		var stringQuery = "SELECT * FROM `"+ID_User+"` WHERE `ID_Upgrade`='"+ID_Upgrade+"'"
		db_all_harvest.query(stringQuery,function (error,rows) {
			if (!!error) {console.log(error);}
			if (rows[0]!=null) {
				dataRss = rows[0];
			}
			resolve();
		})
	}).then(()=>{
		return new Promise((resolve,reject)=>{
			calcRssPerSec = dataRss.Harvest/60;
			harvestFullSec = (data.MaxStore*60/data.Harvest)*1000;
			
			currentTime = functions.GetTime();
			timeFullHarvest = currentTime + harvestFullSec;

			if (data.StartTime!=null&&data.EndTime!=null) {				
				if (functions.ExportTimeDatabase(data.StartTime)>=currentTime) {
					currentHarvest = data.MaxStore;
				}else{
					currentHarvest =parseInt(calcRssPerSec * ((currentTime - functions.ExportTimeDatabase(data.StartTime))/1000));
				}
			}

			if (currentHarvest>0) {
				
				switch (ID_Upgrade) {
					case functions.RssType.Farm:
					stringUpdateUserRSS ="UPDATE `"+ID_User+"` SET `Farm`=`Farm`+'"+currentHarvest+"';"					
					break;
					case functions.RssType.Wood:
					stringUpdateUserRSS ="UPDATE `"+ID_User+"` SET `Wood`=`Wood`+'"+currentHarvest+"';"
					break;
					case functions.RssType.Stone:
					stringUpdateUserRSS ="UPDATE `"+ID_User+"` SET `Stone`=`Stone`+'"+currentHarvest+"';"
					break;
					case functions.RssType.Metal:
					stringUpdateUserRSS ="UPDATE `"+ID_User+"` SET `Metal`=`Metal`+'"+currentHarvest+"';"
					break;
				}				
				switch (parseInt(ID_Server)) {
					case 1:
					dbBase = db_s1_base_info;
					break;
					case 2:
					dbBase = db_s2_base_info;
					break;
				}
				dbBase.query(stringUpdateUserRSS,function (error,result) {
					if (!!error) {console.log(error);}
					resolve();
				})
			}else{
				resolve();
			}
			

		})
	}).then(()=>{
		return new Promise((resolve,reject)=>{

			stringUpdateFullHarvest = "UPDATE `"+ID_User+"` SET `StartTime`='"+currentTime+"',`EndTime`='"+timeFullHarvest+"' WHERE `ID_Upgrade`='"+ID_Upgrade+"';"
			db_all_harvest.query(stringUpdateFullHarvest,function (error,result) {
				if (!!error) {console.log(error);}
				resolve();
			})

		})

	}).then(()=>{
		return new Promise((resolve,reject)=>{
			
			if (currentHarvest>0) {
				var stringQuery = "SELECT * FROM `"+ID_User+"`";
				currentTime = functions.GetTime();
				dbInfo.query(stringQuery, function (error,rows) {
					if (!!error){console.log(error);}
					var currentTime = functions.GetTime();
					for (var i = 0; i < rows.length; i++) {
						if (rows[i].UpgradeTime!=null) {
							rows[i]["UpgradeTime"]= (new Date(functions.ExportTimeDatabase(rows[i].UpgradeTime))-currentTime)*0.001;
						}
						if (rows[i].ResearchTime!=null) {
							rows[i]["ResearchTime"]= (new Date(functions.ExportTimeDatabase(rows[i].ResearchTime))-currentTime)*0.001;
						}
						if (rows[i].ResearchTime!=null) {
							rows[i]["UnitTransferTime "]= (new Date(functions.ExportTimeDatabase(rows[i].UnitTransferTime))-currentTime)*0.001;
						}
						if (rows[i].TrainingTime!=null) {
							rows[i]["TrainingTime"]= (new Date(functions.ExportTimeDatabase(rows[i].TrainingTime))-currentTime)*0.001;
						}
						dataInfo = rows;
						delete dataInfo["ID"];	
					}
					resolve();
				})
			}else{
				resolve();
			}
		})
	}).then(()=>{

		return new Promise((resolve,reject)=>{

			if (currentHarvest>0) {
				var stringHSocket = "s"+ID_Server+"_socket";
				client.hget(stringHSocket,ID_User,function (error,socketID){
					if (!!error) {console.log(error);}
					if (socketID!=null) {
						io.to(socketID).emit('R_BASE_INFO',{R_BASE_INFO:dataInfo});
					}
					resolve();
				})	
			}else{
				resolve();
			}

		})

	})
}

exports.GetHarvest = function (ID_User) {

}