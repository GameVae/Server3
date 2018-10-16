// var async 			= require('async');
var lodash			= require('lodash');
// var math 			= require('mathjs');
var shortId 		= require('shortid');
var Promise 		= require('promise');
// var sqrt 			= require('math-sqrt');
// var datetime 		= require('node-datetime');

var database 		= require('./../../Util/db.js');
var move 			= require('./../../Move/move.js');
var redisData 		= require('./../../Util/redis.js');
var chatting		= require('./../../Chat/chatting.js');
var addFriend 		= require('./../../Map/addFriend.js');
var functions 		= require('./../../Util/functions.js');
var upgrade 		= require('./../../Upgrade/upgrade.js');
var harvest			= require('./../../Harvest/harvest.js');
var userBase		= require('./../../UserBase/userBase.js');
var blackList 		= require('./../../BlackList/blackList.js');
var resetMine 		= require('./../../ResetMine/resetMine.js');
var unitInBase 		= require('./../../UnitInBase/unitInBase.js');
var guildManager	= require('./../../GuildManager/guildManager.js');
var unitInLocation	= require('./../../UnitInLocation/unitInLocation.js');
var resourceTransfer= require('./../../ResourceTransfer/resourceTransfer.js');


// var cron 		= require('node-cron');
var Q = require('q');
var currentUser 	= [];
var redisDatas 		= [];

var arrayTimeResetserver;
var arrayTimeTransferFarmfromBaseToUnit;

var blockInfo;

var arrayPolicy;
var arrayAllGuildList;
var arrayNotisyStatus;
var arrayAllMemberGuild;
var arrayMessGuildMember;
var arrayRequestJoinGuild;
var arrayAllInviteByGuild;
var arrayAllresourceupguild;
var arrayAllRequestJoinGuildByUser;

var arrayBlackList;
var arrayBlockedBlackListByUser;

var arrayAllresourcebuybase,arrayAllresourceupbase;

var	arrayAllresourceupMarket,arrayAllResourceToDiamond,
arrayAllresourceupSwordman,arrayAllresourceupBowman,arrayAllresourceupCrossbow,arrayAllresourceupHorseman,
arrayAllresourcebuyunit,
arrayAllresourceupFarm,arrayAllresourceupWood,arrayAllresourceupStone,arrayAllresourceupMetal,
arrayAllresourceupGranary,arrayAllresourceupTower;

var arrayAllUsers;
var arrayMessPrivateMember;

var arrayWaitingFriend,arrayWaitedFriend,arrayAddedFriend,arrayCancelFriend;

var arrayAllMinepositionTrue;

var arrayBaseResource;
var arrayBaseUser, arrayUnitBaseUser,arrayUnitWaitBaseUser,arrayUnitLocationsComplete;
var arrayAllUnitLocationsComplete;

var arrayUserLogin;

function GameServer() 
{  
	this.redisDatas = redisDatas;	  			    
	this.currentUser = currentUser;
	//this.redisarray = redisarray; 			    		   	    
}	

exports.Start = function start (io) {

	io.on('connection', function(socket){

		module.exports =  exports = GameServer;
		S_LOGIN (socket);

	});
}


function S_LOGIN (socket) {
	socket.on('S_LOGIN', function (data){
		
		currentUser = getCurrentUser (data,shortId,socket);
		// var size =Object.keys(currentUser).length;
		// console.log(currentUser);
		
		var currentTime = Math.floor(new Date().getTime() / 1000);

		console.log("Data receive Login1: "+currentUser.name+"_"+currentUser.password+"_"+socket.id);
		
		database.query(queryUserNamePass (currentUser),function (error,rows) {
			if (!!error){DetailError = ('login.js: Error queryUserNamePass');functions.writeLogErrror(DetailError);}
			if (rows.length>0) {
				

				return new Promise((resolve,reject)=>{
					R_CHECK_DUPLICATE_LOGIN(currentUser,socket,resolve);	

				}).then(()=>{
					return new Promise((resolve,reject)=>{
						R_SERVER_TIME_OUT (socket,currentUser,currentTime,function (rows) {
							blockInfo =rows;
							resolve();
						});
					});

				}).then(()=>{
					updateDeviceInfo(currentUser);
					userBase.createNewUserBase (currentUser,currentTime);
					checkTime (currentUser,currentTime);					
					updateOnlineUser (currentUser,currentTime);						

				}).then(()=>{
					unitInBase.updateTimeBuyUnit(currentUser,currentTime);
					unitInBase.updateUnitWaitInBase (currentUser,currentTime)
					resourceTransfer.updateFarmFromBaseToUnit (currentUser,currentTime);
					move.updateUnitInLocation (currentUser,currentTime);
					//console.log("updateTimeBuyUnit");
				}).then(()=>{
					return new Promise((resolve,reject)=>{
						resetMine.getTimeResetMine(currentTime,function (rows) {
							arrayTimeResetserver=rows;
							resolve();
							//console.log("getTimeResetMine");
						})
					});

				}).then(()=>{
					return new Promise((resolve,reject)=>{
						resourceTransfer.getTimeTransferFromBaseToUnit(currentUser,function (rows) {
							arrayTimeTransferFarmfromBaseToUnit=rows;
							resolve();
							//console.log("getTimeTransferFromBaseToUnit");
						});
					});

				}).then(()=>{
					return new Promise((resolve,reject)=>{
						guildManager.getArrayRequestJoinGuild(currentUser,socket,redisDatas,function  (rows){
							arrayRequestJoinGuild=rows;							
						},function  (rows) {
							arrayAllInviteByGuild =rows;		
						},function  (rows) {
							arrayPolicy = rows;		
						},function  (rows) {
							arrayAllMemberGuild =rows;
							resolve();
							//console.log("getArrayRequestJoinGuild");
						});
					});

				}).then(()=>{
					return new Promise((resolve,reject)=>{
						guildManager.updateTimeGuildInvite(currentUser,currentTime,function (rows) {
							arrayRequestJoinGuild=rows;
							resolve();
							//console.log("updateTimeGuildInvite");
						});	
					});
					
				}).then(()=>{
					return new Promise((resolve,reject)=>{
						guildManager.getTimeCancelGuild(currentUser, function (rows) {
							arrayMessGuildMember=rows;
							resolve();
							//console.log("getTimeCancelGuild");
						});
					});

				}).then(()=>{
					return new Promise((resolve,reject)=>{
						guildManager.getarrayAllGuildList(function (rows) {
							arrayAllGuildList=rows;
							resolve();
						})
					});

				}).then(()=>{
					return new Promise((resolve,reject)=>{
						guildManager.getarrayAllRequestJoinGuildByUser(currentUser,function (rows) {
							arrayAllRequestJoinGuildByUser=rows;
							resolve();
						})
					});
				}).then(()=>{
					return new Promise((resolve,reject)=>{
						getUpgradeInfo(function (rows) {
							arrayAllresourceupguild=rows;							
						},function (rows) {
							arrayAllresourcebuybase=rows;
						},function (rows) {
							arrayAllresourceupbase=rows;	
						},function (rows) {
							arrayAllresourceupMarket=rows;	
						},function (rows) {
							arrayAllResourceToDiamond=rows;	
						},function (rows) {
							arrayAllresourceupSwordman=rows;	
						},function (rows) {
							arrayAllresourceupBowman=rows;	
						},function (rows) {
							arrayAllresourceupCrossbow = rows;
						}, function (rows) {
							arrayAllresourceupHorseman = rows;
						}, function (rows) {
							arrayAllresourcebuyunit=rows;	
						},function (rows) {
							arrayAllresourceupFarm=rows;	
						},function (rows) {
							arrayAllresourceupWood=rows;	
						},function (rows) {
							arrayAllresourceupStone=rows;	
						},function (rows) {
							arrayAllresourceupMetal=rows;	
						},function (rows) {
							arrayAllresourceupGranary=rows;
						}, function (rows) {
							arrayAllresourceupTower = rows;
							resolve();
						});
					});
					
				}).then(()=>{
					return new Promise((resolve,reject)=>{
						getBlackListInfo (currentUser,function (rows) {
							arrayBlackList=rows;
						},function (rows) {
							arrayBlockedBlackListByUser=rows;
							resolve();
						});
					});
					
				}).then(()=>{
					return new Promise((resolve,reject)=>{
						chatting.getarrayMessPrivateMember(currentUser,function (rows) {
							arrayMessPrivateMember=rows;
							resolve();
						});
					});
					
					
				}).then(()=>{
					return new Promise((resolve,reject)=>{
						userBase.getarrayAllUsers (currentUser,function (rows) {
							arrayAllUsers=rows;
							resolve();
						});
					});

				}).then(()=>{
					return new Promise((resolve,reject)=>{						
						getFriendRegion(currentUser,currentTime,function (rows) {
							arrayWaitingFriend=rows;
						},function (rows) {
							arrayWaitedFriend=rows;
						},function (rows) {
							arrayAddedFriend=rows;
						},function (rows) {
							arrayCancelFriend=rows;
							resolve();
						});
					});

				}).then(()=>{
					return new Promise((resolve,reject)=>{
						resetMine.getarrayAllMinepositionTrue(function (rows) {
							arrayAllMinepositionTrue=rows;
							resolve();
						})
					});

				}).then(()=>{
					return new Promise((resolve,reject)=>{
						userBase.getarrayBaseResource(currentUser,function (rows) {
							arrayBaseResource=rows;
							resolve();

						});
					});

				}).then(()=>{
					return new Promise((resolve,reject)=>{						
						getUserInfo(currentUser,function (rows) {
							arrayUserLogin=rows;
						},function (rows) {
							arrayBaseUser=rows;
						},function (rows) {
							arrayUnitBaseUser=rows;
						},function (rows) {
							arrayUnitWaitBaseUser=rows;							
						},function (rows) {
							arrayUnitLocationsComplete=rows;
						},function (rows) {
							arrayAllUnitLocationsComplete=rows;
							resolve();

						});						
					});

				}).then(()=>{	
					consoleLog();
					
					if (blockInfo===0) {
						socket.emit('R_LOGIN_SUCCESS',{
							message : '1',

							currentUser: currentUser,
							arrayUserLogin: arrayUserLogin,

							arrayTimeResetserver: arrayTimeResetserver,

							arrayTimeTransferFarmfromBaseToUnit: arrayTimeTransferFarmfromBaseToUnit,

							arrayPolicy: arrayPolicy,
							arrayAllGuildList: arrayAllGuildList,
							arrayAllMemberGuild: arrayAllMemberGuild,
							arrayMessGuildMember: arrayMessGuildMember,
							arrayRequestJoinGuild: arrayRequestJoinGuild,
							arrayAllInviteByGuild: arrayAllInviteByGuild,
							arrayAllresourceupguild: arrayAllresourceupguild,
							arrayAllRequestJoinGuildByUser: arrayAllRequestJoinGuildByUser,

							arrayBlackList: arrayBlackList,
							arrayBlockedBlackListByUser: arrayBlockedBlackListByUser,
							arrayMessPrivateMember:arrayMessPrivateMember,

							arrayAllresourcebuybase: arrayAllresourcebuybase,
							arrayAllresourceupbase : arrayAllresourceupbase,

							arrayAllresourceupMarket: arrayAllresourceupMarket,
							arrayAllResourceToDiamond: arrayAllResourceToDiamond,

							arrayAllresourceupSwordman: arrayAllresourceupSwordman,
							arrayAllresourceupBowman: arrayAllresourceupBowman,
							arrayAllresourceupCrossbow: arrayAllresourceupCrossbow,
							arrayAllresourceupHorseman: arrayAllresourceupHorseman,
							arrayAllresourcebuyunit: arrayAllresourcebuyunit,

							arrayAllresourceupFarm: arrayAllresourceupFarm,
							arrayAllresourceupWood: arrayAllresourceupWood,
							arrayAllresourceupStone: arrayAllresourceupStone,
							arrayAllresourceupMetal: arrayAllresourceupMetal,

							arrayAllresourceupGranary: arrayAllresourceupGranary,
							arrayAllresourceupTower: arrayAllresourceupTower,

							arrayAllUsers: arrayAllUsers,						
							
							arrayAddedFriend: arrayAddedFriend,
							arrayWaitedFriend: arrayWaitedFriend,
							arrayCancelFriend: arrayCancelFriend,
							arrayWaitingFriend: arrayWaitingFriend,

							arrayAllMinepositionTrue: arrayAllMinepositionTrue,

							arrayBaseResource: arrayBaseResource,

							arrayBaseUser: arrayBaseUser,
							arrayUnitBaseUser: arrayUnitBaseUser,
							arrayUnitWaitBaseUser: arrayUnitWaitBaseUser,
							arrayUnitLocationsComplete: arrayUnitLocationsComplete,

							arrayAllUnitLocationsComplete: arrayAllUnitLocationsComplete,

						});
					}

				});

			}			
			else{
				console.log("UserName or Mật khẩu không đúng "+currentUser.name);
				socket.emit('R_LOGIN_SUCCESS',
				{
					message : '0',
				});
			}
		});						
});
}

function consoleLog () {
	/*
	console.log("arrayPolicy");
	console.log(arrayPolicy);

	console.log("arrayAllMemberGuild");
	console.log(arrayAllMemberGuild);

	console.log("arrayMessGuildMember:_");				
	console.log(arrayMessGuildMember);

	console.log("arrayRequestJoinGuild");
	console.log(arrayRequestJoinGuild);

	console.log("arrayAllInviteByGuild");
	console.log(arrayAllInviteByGuild);

	console.log("arrayAllRequestJoinGuildByUser");
	console.log(arrayAllRequestJoinGuildByUser);

	console.log("arrayAllGuildList");
	console.log(arrayAllGuildList);

	console.log("arrayBlackList");
	console.log(arrayBlackList);

	console.log("arrayBlockedBlackListByUser");
	console.log(arrayBlockedBlackListByUser);

	console.log("arrayAllresourceupguild");
	console.log(arrayAllresourceupguild);

	console.log("arrayAllresourcebuybase");
	console.log(arrayAllresourcebuybase);

	console.log("arrayAllresourceupCrossbow");
	console.log(arrayAllresourceupCrossbow);

	console.log("arrayAllresourceupHorseman");
	console.log(arrayAllresourceupHorseman);

	console.log("arrayAllresourceupTower");
	console.log(arrayAllresourceupTower);

	console.log("arrayAllresourcebuyunit");
	console.log(arrayAllresourcebuyunit);

	console.log("arrayAllresourceupbase");
	console.log(arrayAllresourceupbase);

	console.log("arrayAllresourceupMarket");
	console.log(arrayAllresourceupMarket);

	console.log("arrayAllResourceToDiamond");
	console.log(arrayAllResourceToDiamond);

	console.log("arrayAllUsers");
	console.log(arrayAllUsers);

	console.log("blockInfo");				
	console.log(blockInfo);

	console.log("arrayMessPrivateMember");				
	console.log(arrayMessPrivateMember);

	console.log("arrayAddedFriend");				
	console.log(arrayAddedFriend);

	console.log("arrayWaitedFriend");				
	console.log(arrayWaitedFriend);

	console.log("arrayCancelFriend");				
	console.log(arrayCancelFriend);

	console.log("arrayWaitingFriend");				
	console.log(arrayWaitingFriend);

	console.log("arrayTimeResetserver");				
	console.log(arrayTimeResetserver);

	console.log("arrayAllMinepositionTrue");				
	console.log(arrayAllMinepositionTrue);

	console.log("arrayBaseResource");				
	console.log(arrayBaseResource);

	console.log("arrayUserLogin");				
	console.log(arrayUserLogin);

	console.log("arrayBaseUser");				
	console.log(arrayBaseUser);

	console.log("arrayUnitBaseUser");
	console.log(arrayUnitBaseUser);

	console.log("arrayUnitWaitBaseUser");				
	console.log(arrayUnitWaitBaseUser);

	console.log("arrayUnitLocationsComplete");				
	console.log(arrayUnitLocationsComplete);

	console.log("arrayAllUnitLocationsComplete");				
	console.log(arrayAllUnitLocationsComplete);
	*/
}
function getUserInfo (currentUser,arrayUserLogin,arrayBaseUser,arrayUnitBaseUser,arrayUnitWaitBaseUser,arrayUnitLocationsComplete,arrayAllUnitLocationsComplete) {
	userBase.getUserInfo(currentUser,function (rows) {
		arrayUserLogin(rows);
	}, function (rows) {
		arrayBaseUser(rows);
	});
	unitInBase.getarrayUnitBaseUser(currentUser,function (rows) {
		arrayUnitBaseUser(rows); 
	})
	unitInBase.getarrayUnitWaitBaseUser(currentUser,function (rows) {
		arrayUnitWaitBaseUser(rows);
	});
	unitInLocation.getarrayUnitLocationsComplete(currentUser,function (rows) {
		arrayUnitLocationsComplete(rows);
	});
	unitInLocation.getarrayAllUnitLocationsComplete(function (rows) {
		arrayAllUnitLocationsComplete(rows);
	});
}
function getFriendRegion (currentUser,currentTime,arrayWaitingFriend,arrayWaitedFriend,arrayAddedFriend,arrayCancelFriend) {
	addFriend.getarrayWaitingFriend(currentUser,function (rows) {
		arrayWaitingFriend(rows);
	});
	addFriend.getarrayWaitedFriend(currentUser,function (rows) {
		arrayWaitedFriend(rows);
	});
	addFriend.getarrayAddedFriend(currentUser,function (rows) {
		arrayAddedFriend(rows);
	});
	addFriend.getarrayCancelFriend(currentUser,currentTime,function (rows) {
		arrayCancelFriend(rows);
	});
}

function R_SERVER_TIME_OUT (socket,currentUser,currentTime,blockInfo) {
	database.query("SELECT DetailTimeBlock,CheckBLockForever FROM `users` WHERE `UserName`='"+currentUser.name+"'",function(error, rows){
		if (!!error){DetailError =('login :Error SELECT R_SERVER_TIME_OUT');functions.writeLogErrror(DetailError);}
		if (rows.length>0) {
			var TimeBlock=0;
			var Block =0;
			if (parseFloat(rows[0].DetailTimeBlock) > parseFloat(currentTime)) {
				Block =1;
				TimeBlock = rows[0].DetailTimeBlock;
			}
			else {
				TimeBlock =0;
				if (rows[0].CheckBLockForever===1) {Block =1;}	
			}
			socket.emit('R_SERVER_TIME_OUT',{
				block: Block,
				DetailTimeBlockio: TimeBlock,
				blockLimit: rows[0].CheckBLockForever,
			});

			database.query("UPDATE users SET DetailTimeBlock ='"+TimeBlock+"'WHERE `UserName` = '"+currentUser.name+"'",function(error){
				if (!!error){DetailError =('login :Error UPDATE R_SERVER_TIME_OUT');functions.writeLogErrror(DetailError);}
			});
			blockInfo(Block);
		}
	});
}

function getBlackListInfo (currentUser,arrayBlackList,arrayBlockedBlackListByUser) {
	blackList.getarrayBlackList(currentUser,function (rows) {
		arrayBlackList(rows);
	});
	blackList.getarrayBlockedBlackListByUser(currentUser,function (rows) {
		arrayBlockedBlackListByUser(rows);
	});
}

function getUpgradeInfo (arrayAllresourceupguild,
	arrayAllresourcebuybase,arrayAllresourceupbase,
	arrayAllresourceupMarket,arrayAllResourceToDiamond,
	arrayAllresourceupSwordman, arrayAllresourceupBowman, arrayAllresourceupCrossbow, arrayAllresourceupHorseman,
	arrayAllresourcebuyunit,
	arrayAllresourceupFarm,arrayAllresourceupWood,arrayAllresourceupStone,arrayAllresourceupMetal,
	arrayAllresourceupGranary, arrayAllresourceupTower) {

	guildManager.getarrayAllresourceupguild(function (rows) {
		arrayAllresourceupguild(rows);
	});
	upgrade.getUpgradeInfo(function (rows) {
		arrayAllresourcebuybase(rows);
	},function (rows) {
		arrayAllresourceupbase(rows);
	},function (rows) {
		arrayAllresourceupMarket(rows);
	},function (rows) {
		arrayAllResourceToDiamond(rows);
	},function (rows) {
		arrayAllresourceupSwordman(rows);
	},function (rows) {
		arrayAllresourceupBowman(rows);
	},function (rows) {
		arrayAllresourceupCrossbow(rows);
	}, function (rows) {
		arrayAllresourceupHorseman(rows);
	}, function (rows) {
		arrayAllresourcebuyunit(rows);
	},function (rows) {
		arrayAllresourceupFarm(rows);
	},function (rows) {
		arrayAllresourceupWood(rows);
	},function (rows) {
		arrayAllresourceupStone(rows);
	},function (rows) {
		arrayAllresourceupMetal(rows);
	},function (rows) {
		arrayAllresourceupGranary(rows);
	}, function (rows) {
		arrayAllresourceupTower(rows);
	});
}
//
function R_CHECK_DUPLICATE_LOGIN (currentUser,socket,resolve) {
	for (var i = 0; i < redisDatas.length; i++) {
		if (redisDatas[i].name===currentUser.name){
			console.log("=duplicate to user="+currentUser.name);		
			socket.emit('R_CHECK_DUPLICATE_LOGIN',{
				checkDuplicateLogin:0,
			});
		}
		redisDatas.splice(i,1);
		break;
	}
	resolve();	
}
function updateOnlineUser (currentUser,currentTime) {
	//console.log("updateOnlineUser");
	database.query("UPDATE users SET timeLogin = ?,idSocket=?,timeLogout =? WHERE UserName = ?", [currentTime,currentUser.idSocket,0, currentUser.name],function(error){
		if(!!error){DetailError =('login :Error UPDATE users '+currentUser.name);	functions.writeLogErrror(DetailError);}});
	unitInLocation.updateLoginUser (currentUser,currentTime);
	guildManager.updateLoginUser (currentUser,currentTime);

}

function checkTime (currentUser,currentTime) {	

	database.query("SELECT * FROM `userbase` WHERE `UserName` = '"+currentUser.name+"'",function(error, rows){
		if (!!error){DetailError = ('login.js: Error checkTime '+currentUser.name);functions.writeLogErrror(DetailError);}
		if (rows.length>0) {
			for (var i = 0; i < rows.length; i++) {
				harvest.updateTimeHarvest (rows[i],currentTime);
				upgrade.updateCurrentUpgrade(rows[i],currentTime);
				resourceTransfer.updateTimeTransferRes(rows[i],currentTime);
				resourceTransfer.updateTimeTransferResToFriend(rows[i],currentTime);
				
			}			
		}
	});

}

//Cập nhật thông tin thiết bị đăng nhập
function updateDeviceInfo (currentUser) {
	database.query("UPDATE users SET modelDevide ='"+currentUser.modelDevide+"',ramDevide ='"+parseFloat(currentUser.ramDevide)
		+"'WHERE `UserName` = '"+currentUser.name+"'",function(error, result){
			if(!!error){DetailError =('login: Error updateDeviceInfo '+currentUser.name);functions.writeLogErrror(DetailError);}});								
}
//Kiểm tra username và password
function queryUserNamePass (currentUser) {
	return "SELECT UserID FROM `users` WHERE `UserName`='"+currentUser.name+"' AND `UserPass`='"+currentUser.password+"'";
}

function getCurrentUser (data,shortId,socket) {
	return currentUser =
	{
		name: data.name,
		password: data.password,
		modelDevide: data.modelDevide, 
		ramDevide: data.ramDevide,   
		id: shortId.generate(),    
		idSocket: socket.id,
	}	
}