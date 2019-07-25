'use strict';
var getInfo 				= require("./../Info/GetInfo.js");
var positionRemove 			= require('./../Redis/Position/Position_Remove.js'); 
// positionRemove.Test(5)
var moving 					= require('./../Unit/Moving.js');
var moving_Attack 			= require('./../Unit/Moving_Attack.js');

var position_Check			= require('./../Redis/Position/Position_Check.js');
var positionCheckPos		= require('./../Redis/Position/Position_CheckPos.js');
var db_position 			= require('./../Util/Database/Db_position.js');

var guildData				= require('./../Redis/Guild/GuildData.js');
var friendData				= require('./../Redis/Friend/FriendData.js');

var attackGetPos 			= require('./AttackGetPos.js');

var functions 				= require('./../Util/Functions.js');

var Promise 				= require('promise');

var redis 					= require("redis"),
client 						= redis.createClient();
client.select(functions.RedisData.TestUnit);

var counter = 1.2;

var stringHAttack,stringHUnit,stringHPos,stringMoveAttack;

var DictTimeAttack={};
var DictMoveAttack={};
var stringInterval;


exports.CheckCurrentPos = function (io,data,stringKey,pos,Server_ID) {
	checkCurrentPos (io,data,stringKey,pos,Server_ID);
}
function checkCurrentPos (io,data,stringKey,pos,Server_ID) {
	// var dataNewPos ={
	// 	// Position_Cell: data.Position_Cell,
	// 	// Next_Cell: data.Next_Cell,
	// 	PositionCheck: pos,
	// }
	// console.log('dataNewPos')
	// console.log(dataNewPos)
	// console.log('stringKey')
	// console.log(stringKey)
	// io.emit('R_TESTMOVE',{R_TESTMOVE:dataNewPos});
	functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js checkCurrentPos data,stringKey,pos,Server_ID',[data,stringKey,pos,Server_ID]);
	stringHPos ="s"+Server_ID+"_pos";
	stringHUnit = "s"+Server_ID+"_unit";
	stringHAttack = "s"+Server_ID+"_attack";
	// var Server_ID = data.Server_ID;

	var ID_User = stringKey.split("_")[2];
	var arrayUnitInPos = [];
	// var tempListUnitInPos = [];
	var listUnitAttack = [];
	var listIDUnitAttack = [];
	var listCurrentAttack = [];
	// var listUnit = [];
	var checkBoolFriendData = false, checkBoolGuildData = false;
	var getAttackBool = false;
	var clearBool = false;
	var defendingUnit;

	new Promise((resolve,reject)=>{
		functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js checkCurrentPos hget stringHPos,pos',[stringHPos,pos]);
		client.hget(stringHPos,pos,function(error,rows){
			if (rows!=null) {
				arrayUnitInPos = rows.split("/").filter(String);				
				for (var i = 0; i < arrayUnitInPos.length; i++) {
					if (arrayUnitInPos[i].split("_")[2] != ID_User) {
						listIDUnitAttack.push(arrayUnitInPos[i]);
						// arrayUnitInPos.splice(arrayUnitInPos.indexOf(arrayUnitInPos[i], 1))
					}
				}
			}
			// listIDUnitAttack = arrayUnitInPos;
			// functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js checkCurrentPos listIDUnitAttack',[listIDUnitAttack]);
			if (listIDUnitAttack.length==0) {
				// attackFunc.ClearInterAttack(stringKey,functions.CaseClearAttack.Full);		
				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js checkCurrentPos=>clearDefend1 stringKey',[stringKey]);
				clearDefend(io,stringKey);		
				clearBool = true;
			}
			resolve();
		})
	}).then(()=>{
		
		return new Promise((resolve,reject)=>{
			functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js clearBool1 ',[clearBool]);
			if (clearBool==false) {
				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js=>checkCurrentPos=>friendData.CheckListFriendData listIDUnitAttack,stringKey',[listIDUnitAttack,stringKey]);
				friendData.CheckListFriendData(listIDUnitAttack,stringKey.split("_")[2],function (returnListUnit) {
					listIDUnitAttack = returnListUnit;
					resolve();
				})
			}
		})		
	}).then(()=>{
		
		return new Promise((resolve,reject)=>{
			if (clearBool==false) {
				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js=>checkCurrentPos guildData.CheckListGuildData listIDUnitAttack,stringKey',[listIDUnitAttack,stringKey]);
				guildData.CheckListGuildData(listIDUnitAttack,stringKey.split("_")[2],function (returnListUnit) {
					listIDUnitAttack = returnListUnit;
					resolve();
				})
			}
		})
		
	}).then(()=>{
		
		return new Promise((resolve,reject)=>{
			if (clearBool==false) {
				if (listIDUnitAttack.length==0) {
					functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js checkCurrentPos listIDUnitAttack=0=>clearDefend',[stringKey]);
					clearDefend(io,stringKey);
					clearBool==true
				}else{
					functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js checkCurrentPos hmget stringHUnit,listIDUnitAttack',[stringHUnit,listIDUnitAttack]);
					client.hmget(stringHUnit,listIDUnitAttack,function (error,rows) {
						if (rows!=null) {
							for (var i = 0; i < rows.length; i++) {
								if(rows[i]!=null){
									var unitResult = JSON.parse(rows[i]);
									var attackBool = false;

									if (unitResult.Status==functions.UnitStatus.Standby&&unitResult.Attack_Unit_ID==null) {
										attackBool = true;	
									}
									if (unitResult.Attack_Unit_ID==stringKey){
										attackBool = true;
									}
									if (unitResult.Status==functions.UnitStatus.Standby&&unitResult.Attack_Unit_ID=='null') {
										attackBool = true;	
									}
									if (unitResult.Status==functions.UnitStatus.Attack_Unit&&unitResult.Attack_Unit_ID==stringKey) {
										attackBool = true;	
									}
									if (attackBool == false) {
										listIDUnitAttack.splice(listIDUnitAttack.indexOf(listIDUnitAttack[i]), 1);
									}
								}else{
									listIDUnitAttack.splice(listIDUnitAttack.indexOf(listIDUnitAttack[i]), 1);
								}
							}
						}else{
							functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js checkCurrentPos=>clearDefend2 stringKey',[stringKey]);
							clearDefend(io,stringKey);
							clearBool=true;
						}
						resolve();
					})
				}
			}
		})		
	}).then(()=>{
		
		return new Promise((resolve,reject)=>{

			functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js checkCurrentPos hget stringHAttack,stringKey',[stringHAttack,stringKey]);
			if (listIDUnitAttack.length>0) {
				client.hget(stringHAttack,stringKey,function (error,rows) {
					if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'AttackFunc.js checkCurrentPos hget stringHAttack,stringKey',[stringHAttack,stringKey]);}
					if (rows!=null) {
						listCurrentAttack = rows.split("/").filter(String);
					}
					resolve();
				})
			}
		})
		
	}).then(()=>{
		return new Promise((resolve,reject)=>{

			if (listIDUnitAttack.length>0) {
				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js checkCurrentPos=>setListAttackData Server_ID,stringKey,listIDUnitAttack,listCurrentAttack',[Server_ID,stringKey,listIDUnitAttack,listCurrentAttack]);
				setListAttackData(io,Server_ID,stringKey,listIDUnitAttack,listCurrentAttack);
			}
			if(listIDUnitAttack.length==0&&listCurrentAttack.length==0){
				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js checkCurrentPos=>clearDefend listIDUnitAttack.length==0&&listCurrentAttack.length==0 stringKey',[stringKey]);
				clearDefend(io,stringKey);				
			}
			resolve();

		})
	})
}

exports.ClearAttackUnit = function (io,stringUnit) {
	clearAttackUnit (io,stringUnit)
}
function clearAttackUnit (io,stringUnit) {
	functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js clearAttackUnit stringUnit',[stringUnit]);
	
	var Server_ID = stringUnit.split("_")[0];
	stringHAttack = "s"+Server_ID+"_attack";
	stringHUnit = "s"+Server_ID+"_unit";
	
	var defendUnit = null;
	new Promise((resolve,reject)=>{
		functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js clearAttackUnit hget stringHUnit,stringUnit',[stringHUnit,stringUnit]);
		client.hget(stringHUnit,stringUnit,function (error,rows) {
			if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'Moving_Attack.js clearAttackUnit stringHUnit stringUnit',[stringHUnit,stringUnit]);}
			if (rows!=null) {
				var result = JSON.parse(rows);
				defendUnit = result.Attack_Unit_ID;
			}
			resolve();
		})
	}).then(()=>{
		
		return new Promise((resolve,reject)=>{
			if (defendUnit!=null) {
				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js clearAttackUnit stringHAttack,defendUnit',[stringHAttack,defendUnit]);
				client.hget(stringHAttack,defendUnit,function (error,rows) {
					if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'AttackFunc.js clearAttackUnit stringUnit',[stringUnit]);}
					if (rows!=null) {
						var arrayAttackUnit = rows.split("/").filter(String);
						if (arrayAttackUnit.includes(stringUnit)) {
							functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js clearAttackUnit=>removeValue',[stringHAttack,defendUnit,rows,stringUnit]);
							removeValue (stringHAttack,defendUnit,rows,stringUnit);
							functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js clearAttackUnit=>clearDefend',[defendUnit]);
							clearDefend(io,defendUnit)
						}
					}
					resolve();
				})
			}else{
				resolve();
			}
		})
		
	})	
}
// exports.ClearAttackUnit = function clearAttackUnit2 (io,ID_User_Attack) {
// 	functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js ClearAttackUnit ID_User_Attack',[ID_User_Attack]);

// 	var Server_ID = ID_User_Attack.split("_")[0]
// 	stringHUnit ="s"+Server_ID+"_unit";
// 	stringHAttack ="s"+Server_ID+"_attack";
// 	var ID_User_Defend;
// 	var stringReplace;

// 	var resultUnit={};
// 	new Promise((resolve,reject)=>{
// 		functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js ClearAttackUnit hget stringHUnit,ID_User_Attack',[stringHUnit,ID_User_Attack]);
// 		client.hget(stringHUnit,ID_User_Attack,function (error,rows) {
// 			if (rows!=null) {
// 				resultUnit = JSON.parse(rows)				
// 				ID_User_Defend = resultUnit.Attack_Unit_ID;
// 				stringInterval = "Attacking_"+ID_User_Defend;
// 			}
// 			resolve();
// 		})
// 	}).then(()=>{
// 		return new Promise((resolve,reject)=>{

// 			if (DictTimeAttack[stringInterval]!=undefined) {
// 				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js ClearAttackUnit hget stringHUnit,ID_User_Attack',[stringHUnit,ID_User_Attack]);
// 				client.hget(stringHAttack,ID_User_Defend, function (error,rows) {
// 					if (rows!=null) {

// 						var result = rows.split("/").filter(String);
// 						if (result.includes(ID_User_Attack)) {
// 							stringReplace = rows.replace(ID_User_Attack+"/","");
// 							functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js ClearAttackUnit hset stringReplace',[stringReplace]);
// 							client.hset(stringHAttack,ID_User_Defend,stringReplace)
// 							if (stringReplace.length==0) {
// 								clearInterval(DictTimeAttack[stringInterval]);			
// 								delete DictTimeAttack[stringInterval];
// 								functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js ClearAttackUnit hdel stringHAttack,ID_User_Defend',[stringHAttack,ID_User_Defend]);
// 								client.hdel(stringHAttack,ID_User_Defend);
// 							}
// 						}
// 					}				
// 					resolve();
// 				})		
// 			}
// 		})
// 	})

// }

// #ClearDefend
exports.ClearDefend = function (io,stringDefend) {
	clearDefend (io,stringDefend)
}
function clearDefend (io,stringDefend) {
	functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js clearDefend stringDefend',[stringDefend])
	var server_ID = stringDefend.split("_")[0]
	stringHAttack ="s"+server_ID+"_attack";
	stringHUnit = "s"+server_ID+"_unit";
	stringInterval = "Attacking_"+stringDefend;
	stringMoveAttack = "Moving_Attack_"+stringDefend;

	var listStringUnitAttacking = [];
	var listDataUnitAttacking = [];

	new Promise((resolve,reject)=>{
		client.hget(stringHAttack,stringDefend,function (error,rows) {
			if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'AttackFunc.js clearDefend stringDefend',[stringDefend]);}
			if (rows!=null) {
				listStringUnitAttacking = rows.split("/").filter(String);
			}
			// if (DictMoveAttack[stringMoveAttack]!=null) {
			// 	clearTimeout(DictMoveAttack[stringMoveAttack]);
			// 	delete DictMoveAttack[stringMoveAttack];
			// }
			if (DictTimeAttack[stringInterval]!=null) {
				clearTimeout(DictTimeAttack[stringInterval]);
				delete DictTimeAttack[stringInterval];
			}
			resolve();
		})
	}).then(()=>{
		return new Promise((resolve,reject)=>{
			functions.ShowLog(functions.ShowLogBool.Off,'AttackFunc.js clearDefend listStringUnitAttacking',[listStringUnitAttacking]);
			if (listStringUnitAttacking.length>0) {
				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js clearDefend hmget stringHUnit,listStringUnitAttacking',[stringHUnit,listStringUnitAttacking])
				client.hmget(stringHUnit,listStringUnitAttacking,function (error,rows) {
					if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'AttackFunc.js clearDefend hmget stringHUnit,listStringUnitAttacking',[stringHUnit,listStringUnitAttacking]);}
					
					if (rows!=null) {
						for (var i = 0; i < rows.length; i++) {
							if(rows[i]!=null){
								var result = JSON.parse(rows[i])
								if (result.Status==functions.UnitStatus.Attack_Unit) {
									result.Status = functions.UnitStatus.Standby
								}
								if (result.Status==functions.UnitStatus.Base) {
									result.Status = functions.UnitStatus.Base
								}
								result.Attack_Unit_ID = null;
								functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js clearDefend hset1 result',[result]);
								client.hset(stringHUnit,listStringUnitAttacking[i],JSON.stringify(result));
								var ID = listStringUnitAttacking[i].split("_")[3];
								// console.log('\x1b[33m%s\x1b[0m','ID')
								// console.log('\x1b[33m%s\x1b[0m',ID)
								var stringUpdate = "UPDATE `s"+server_ID+"_unit` SET `Status`='"+functions.UnitStatus.Standby+"', `Attack_Unit_ID`= NULL WHERE `ID`='"+ID+"'";
								db_position.query(stringUpdate,function(error,result){
									if(!!error){functions.ShowLog(functions.ShowLogBool.Error,'AttackFunc.js clearDefend stringUpdate1',[stringUpdate]);}
								})
								listDataUnitAttacking.push(result);
							}else{
								listDataUnitAttacking.push(null);
							}
						}
						resolve();
					}else{
						return null;
					}

				});	
			}else{
				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js clearDefend listStringUnitAttacking.length=0 stringHUnit,stringDefend',[stringHUnit,stringDefend]);
				
				client.hget(stringHUnit,stringDefend,function (error,rows) {
					var result = JSON.parse(rows);
					result.AttackedBool = 0;
					
					client.hset(stringHUnit,stringDefend,JSON.stringify(result));

					var stringUpdate = "UPDATE `s"+server_ID+"_unit` SET`AttackedBool`= 0 WHERE `ID`='"+stringDefend.split("_")[3]+"'"
					functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js clearDefend hset2 result,stringUpdate',[result,stringUpdate]);
					db_position.query(stringUpdate,function(error,result){
						if(!!error){functions.ShowLog(functions.ShowLogBool.Error,'AttackFunc.js clearDefend stringUpdate2',[stringUpdate]);}
						// return null;
						resolve();
					})
				})
				
			}

		})

	}).then(()=>{
		new Promise((resolve,reject)=>{
			client.hdel(stringHAttack,stringDefend);
			resolve();
		})
	}).then(()=>{
		return new Promise((resolve,reject)=>{
			if (listStringUnitAttacking.length>0) {
				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js clearDefend listStringUnitAttacking',[listStringUnitAttacking]);
				listStringUnitAttacking.forEach(function(unit, index) {
					if (listDataUnitAttacking[index]!=null) {
						functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js clearDefend=>checkAttackPosition unit,listDataUnitAttacking.Position_Cell',[unit,listDataUnitAttacking[index].Position_Cell]);
						checkAttackPosition (io,unit,listDataUnitAttacking[index].Position_Cell);
						// checkCurrentPos(io,listDataUnitAttacking[index],unit,listDataUnitAttacking.Position_Cell,server_ID)
					}
				});
			}
			
			resolve();
		})
	})

}

function updateRedis(stringHkey,stringUnit,data) {
	functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js updateRedis stringHkey,stringUnit,data]',[stringHkey,stringUnit,data]);
	client.hset(stringHkey,stringUnit,JSON.stringify(data));
}
// #SetListAttackData
exports.SetListAttackData = function (io,Server_ID,stringKeyDefend,listStringKeyAttack,listCurrentAttack){
	setListAttackData (io,Server_ID,stringKeyDefend,listStringKeyAttack,listCurrentAttack)
}
function setListAttackData (io,Server_ID,stringKeyDefend,listStringKeyAttack,listCurrentAttack) {
	
	functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js setListAttackData Server_ID,stringKeyDefend,listStringKeyAttack,listCurrentAttack]',[Server_ID,stringKeyDefend,listStringKeyAttack,listCurrentAttack]);
	stringHUnit = "s"+Server_ID+"_unit";
	stringHAttack = "s"+Server_ID+"_attack";

	var defendAliveBool = false;
	var attackAliveBool = false;
	var clearBool = false;
	var currentAttack = listCurrentAttack;
	var listClearUnit = [];

	new Promise((resolve,reject)=>{
		functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js setListAttackData hget stringHUnit,stringKeyDefend]',[stringHUnit,stringKeyDefend]);
		client.hget(stringHUnit,stringKeyDefend,function (error,rows) {
			if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'AttackFunc.js setListAttackData hget stringHUnit,stringKeyDefend]',[stringHUnit,stringKeyDefend]);}
			if (rows!=null) {
				defendAliveBool = true;
				var result = JSON.parse(rows);
				result.AttackedBool = 1;
				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js setListAttackData hset result]',[result]); 
				client.hset(stringHUnit,stringKeyDefend,JSON.stringify(result));
			}else{
				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js setListAttackData=>clearDefend1 stringKeyDefend]',[stringKeyDefend]); 
				clearDefend(io,stringKeyDefend);	
				clearBool = true; 			
			}
			resolve();
		})
	}).then(()=>{
		if (clearBool==false) {
			return new Promise((resolve,reject)=>{

				if ((currentAttack.length>0&&listStringKeyAttack.length>0)) {
					functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js setListAttackData=>compareArray currentAttack,listStringKeyAttack',[currentAttack,listStringKeyAttack]); 
					listClearUnit = compareArray (currentAttack,listStringKeyAttack);				
					if (listClearUnit.length>0) {
						functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js setListAttackData=>updateClearUnit Server_ID,listClearUnit,stringKeyDefend',[Server_ID,listClearUnit,stringKeyDefend]); 
						updateClearUnit (Server_ID,listClearUnit,stringKeyDefend);
					}
				}

				resolve();
			})
		}
	}).then(()=>{

		return new Promise((resolve,reject)=>{
			var stringListAttack="";
			if (listStringKeyAttack.length>0) {
				for (var i = 0; i < listStringKeyAttack.length; i++) {
					stringListAttack = stringListAttack + listStringKeyAttack[i]+"/";
				}
				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js setListAttackData hset stringHAttack,stringKeyDefend,stringListAttack',[stringHAttack,stringKeyDefend,stringListAttack]); 
				client.hset(stringHAttack,stringKeyDefend,stringListAttack);
				resolve();
			}else{
				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js setListAttackData=>clearDefend2 listStringKeyAttack.length==0 stringKeyDefend',[stringKeyDefend]); 
				clearDefend(io,stringKeyDefend);
				clearBool = true;
			}
		})

	}).then(()=>{
		functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js setListAttackData=>attackInterval Server_ID,stringKeyDefend',[Server_ID,stringKeyDefend]); 
		if (clearBool==false) {
			attackInterval(io,Server_ID,stringKeyDefend);
		}
		// return new Promise((resolve,reject)=>{
		// 	functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js setListAttackData=>attackInterval Server_ID,stringKeyDefend',[Server_ID,stringKeyDefend]); 
		// 	attackInterval(io,Server_ID,stringKeyDefend);
		// 	resolve();
		// })
	}).then(()=>{
		if (clearBool==false) {
			listStringKeyAttack.forEach(function (unit){
				new Promise((resolve,reject)=>{
					functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js setListAttackData listStringKeyAttack hget stringHUnit,unit',[stringHUnit,unit]); 
					client.hget(stringHUnit,unit,function (error,rows) {
						if (rows!=null) {
							var result = JSON.parse(rows);
							result.Attack_Unit_ID = stringKeyDefend;
							result.Status = functions.UnitStatus.Attack_Unit;
							functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js setListAttackData listStringKeyAttack hset result',[result]); 
							client.hset(stringHUnit,unit,JSON.stringify(result))
							resolve();
						}
					})
				}).then(()=>{
					return new Promise((resolve,reject)=>{
						var stringUpdate = "UPDATE `s"+Server_ID+"_unit` SET `Attack_Unit_ID` ='"+stringKeyDefend+"', `Status`='"+functions.UnitStatus.Attack_Unit+"' WHERE `ID`='"+unit.split("_")[3]+"'";
						functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js setListAttackData stringUpdate',[stringUpdate]); 
						db_position.query(stringUpdate,function (error,result) {
							if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'AttackFunc.js setListAttackData UpdateData stringUpdate',[stringUpdate]);}
							resolve();
						})
					})
				})
			})
		}
		


	})

}


function compareArray (arrayOldPos,arrayNewPos) {
	functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js compareArray arrayOldPos,arrayNewPos',[arrayOldPos,arrayNewPos]);
	var finalArray = [];
	arrayOldPos.forEach( function(unit,index) {
		if(!arrayNewPos.includes(arrayOldPos[index])){
			finalArray.push(arrayOldPos[index]);
		}
	});	
	var uniqueArray = finalArray.filter(function(item, pos) {
		return finalArray.indexOf(item) == pos;
	})
	if (uniqueArray.length>0) {functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js compareArray uniqueArray',[uniqueArray]);}	
	return uniqueArray;
}

function updateClearUnit (Server_ID,listUnit,stringKeyDefend) {
	stringHUnit = "s"+Server_ID+"_unit";
	stringHAttack = "s"+Server_ID+"_attack";

	functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js updateClearUnit Server_ID,listUnit,stringKeyDefend',[Server_ID,listUnit,stringKeyDefend]);
	
	client.hmget(stringHUnit,unit,function (error,rows){
		if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'AttackFunc.js updateClearUnit hmget stringHUnit,unit',[stringHUnit,unit]);}
		if (rows!=null) {
			for (var i = 0; i < rows.length; i++) {
				if (rows[i!=null]) {
					var result = JSON.parse(rows[i]);					
					result.Attack_Unit_ID = null;
					result.Status = functions.UnitStatus.Standby;
					functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js updateClearUnit hset result',[result]);
					client.hset(stringHUnit,unit,JSON.stringify(result))	
				}
				
			}

		}
	});


	for (var i = 0; i < listUnit.length; i++) {
		var stringUpdate = "UPDATE `s"+server_ID+"_unit` SET `Status`='"+functions.UnitStatus.Standby+"',`Attack_Unit_ID` = NULL WHERE `ID`='"+listUnit[i].split("_")[3]+"'";
		db_position.query(stringUpdate,function (error,result) {
			if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'AttackFunc.js updateClearUnit stringUpdate',[stringUpdate]);}			
		});
	}

	// listUnit.forEach(function (unit) {
	// 	new Promise((resolve,reject)=>{
	// 		functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js updateClearUnit hget stringHUnit,unit',[stringHUnit,unit]);
	// 		client.hget(stringHUnit,unit,function (error,rows) {
	// 			if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'AttackFunc.js updateClearUnit hget stringHUnit,unit',[stringHUnit,unit]);}
	// 			if (rows!=null) {
	// 				var result = JSON.parse(rows);					
	// 				result.Attack_Unit_ID = null;
	// 				result.Status = functions.UnitStatus.Standby;
	// 				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js updateClearUnit hset result',[result]);
	// 				client.hset(stringHUnit,unit,JSON.stringify(result))	
	// 			}
	// 			resolve();
	// 		})
	// 	}).then(()=>{
	// 		return new Promise((resolve,reject)=>{
	// 			var stringUpdate = "UPDATE `s"+server_ID+"_unit` SET `Attack_Unit_ID` = NULL, `Status`='"+functions.UnitStatus.Standby+"' WHERE `ID`='"+unit.split("_")[3]+"'";
	// 			db_position.query(stringUpdate,function (error,result) {
	// 				if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'AttackFunc.js updateClearUnit stringUpdate',[stringUpdate]);}
	// 				resolve();
	// 			});	

	// 		})
	// 	})
	// })

}
function updateRedisData (stringKey) {
	Server_ID = stringKey.split("_")[0];
	stringHUnit = "s"+Server_ID+"_unit";
	stringHAttack = "s"+Server_ID+"_attack";

	var arrayUnitAttack = [];
	functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js updateRedisData stringKey',[stringKey]);

	client.hget(stringHAttack,stringKey,function (error,rows) {
		if (rows!=null) {
			arrayUnitAttack = rows.split("/").filter(String);
			if (arrayUnitAttack.length>0) {
				listStringKeyAttack.forEach(function (unit) {
					functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js updateRedisData hget stringHUnit,unit',[stringHUnit,unit]);
					client.hget(stringHUnit,unit,function (error,rowsUnit) {
						if (rowsUnit!=null) {
							var result = JSON.parse(rowsUnit);
							result.Attack_Unit_ID = null;
							result.Status = functions.Status.Standby;
							functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js updateRedisData hset result',[result]);
							client.hset(stringHUnit,unit,JSON.stringify(result))
						}
					})
				})
			}
		}
	})
}




exports.SetAttackData = function (Server_ID,ID_Defend,ID_Attack) {
	setAttackData (Server_ID,ID_Defend,ID_Attack)
}

function setAttackData (Server_ID,ID_Defend,ID_Attack) {
	functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js setAttackData Server_ID,ID_Defend,ID_Attack',[Server_ID,ID_Defend,ID_Attack]);
	stringHAttack = "s"+Server_ID+"_attack";
	stringHUnit = "s"+Server_ID+"_unit";
	// console.log(Server_ID,ID_Defend,ID_Attack)
	var defendAliveBool = false;
	var attackAliveBool = false;

	new Promise((resolve,reject)=>{
		functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js setAttackData hget stringHUnit,ID_Defend',[stringHUnit,ID_Defend]);

		client.hget(stringHUnit,ID_Defend,function (error,rows){
			if (rows==null) {functions.ShowLog(functions.ShowLogBool.Error,'AttackFunc.js setAttackData hget stringHUnit,ID_Defend',[stringHUnit,ID_Defend]);}
			if (rows!=null) {
				defendAliveBool = true;
				var result = JSON.parse(rows);
				result.AttackedBool = 1;

				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js setAttackData hset result',[result]);
				client.hset(stringHUnit,ID_Defend,JSON.stringify(result));

				var stringUpdateDefend = "UPDATE `s"+Server_ID+"_unit` SET `AttackedBool`= 1 WHERE `ID`='"+ID_Defend.split("_")[3]+"'"
				db_position.query(stringUpdateDefend,function (error,result) {
					if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'AttackFunc.js setAttackData stringUpdateDefend',[stringUpdateDefend]);}					
				})
			}else {
				return null;
			}
			resolve();
		})

	}).then(()=>{
		return new Promise((resolve,reject)=>{

			if (defendAliveBool==true) {
				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js setAttackData hget stringHUnit,ID_Attack',[stringHUnit,ID_Attack]);			
				client.hget(stringHUnit,ID_Attack,function (error,rows) {
					if (rows!=null) {
						attackAliveBool = true;
						functions.AddValue (stringHAttack,ID_Defend,ID_Attack);

						var result = JSON.parse(rows)
						result.Attack_Unit_ID = ID_Defend;
						result.Status = functions.UnitStatus.Attack_Unit;

						functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js setAttackData hset defendAliveBool result',[result]);	
						client.hset(stringHUnit,ID_Attack,JSON.stringify(result))
					}else{
						functions.ShowLog(functions.ShowLogBool.Error,'AttackFunc.js setAttackData hget stringHUnit,ID_Attack',[stringHUnit,ID_Attack]);	
					}
				})					
			}else {
				return null;
			}
			resolve();
		})		
	}).then(()=>{
		return new Promise((resolve,reject)=>{
			if (defendAliveBool==true && attackAliveBool==true) {
				var stringUpdateAttack = "UPDATE `s"+Server_ID+"_unit` SET `Status`='"+functions.UnitStatus.Attack_Unit+"',`Attack_Unit_ID` ='"+ID_Defend+"' WHERE `ID`='"+ID_Attack.split("_")[3]+"'; "+
				"UPDATE `s"+Server_ID+"_unit` SET`AttackedBool` = '1' WHERE `ID` = '"+ID_Defend.split("_")[3]+"'";
				db_position.query(stringUpdateAttack,function (error,result) {
					if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'AttackFunc.js setAttackData defendAliveBool,attackAliveBool,stringUpdateAttack',[defendAliveBool,attackAliveBool,stringUpdateAttack]);}
				})
			}else{
				functions.ShowLog(functions.ShowLogBool.Error,'AttackFunc.js setAttackData defendAliveBool,attackAliveBool',[defendAliveBool,attackAliveBool]);
			}
			resolve();
		})
	})

	// new Promise((resolve,reject)=>{
	// 	hgetConsole ('setAttackData,stringHUnit,ID_Defend',stringHUnit,ID_Defend);	
	// 	client.hget(stringHUnit,ID_Defend,function (error,rows){
	// 		if (rows!=null) {
	// 			defendAliveBool = true;
	// 			var result = JSON.parse(rows);
	// 			result.AttackedBool = 1; 
	// 			client.hset(stringHUnit,ID_Defend,JSON.stringify(result));
	// 		}
	// 		resolve();
	// 	})
	// }).then(()=>new Promise((resolve,reject)=>{
	// 	hgetConsole ('setAttackData,stringHAttack,ID_Defend',stringHAttack,ID_Defend);	
	// 	client.hget(stringHAttack,ID_Defend,function (error,result){
	// 		if (defendAliveBool==true) {
	// 			if (result!=null) {
	// 				var resultID = result.split("/").filter(String)
	// 				// console.log("resultID: "+resultID);
	// 				if (!resultID.includes(ID_Attack)) {
	// 					addValue (stringHAttack,ID_Defend,result,ID_Attack);
	// 				}
	// 			}else {
	// 				addValue (stringHAttack,ID_Defend,"",ID_Attack);
	// 			}
	// 		}
	// 		resolve();
	// 	})
	// }).then(()=>new Promise((resolve,reject)=>{
	// 	hgetConsole ('setAttackData,stringHUnit,ID_Attack',stringHUnit,ID_Attack);	
	// 	client.hget(stringHUnit,ID_Attack,function (error,rows) {
	// 		if (rows!=null) {
	// 			attackAliveBool = true;
	// 			var result = JSON.parse(rows);
	// 			result.Attack_Unit_ID = ID_Defend;
	// 			result.Status = functions.UnitStatus.Attack_Unit;

	// 			client.hset(stringHUnit,ID_Attack,JSON.stringify(result))	
	// 		}
	// 		resolve();	
	// 	});
	// }).then(()=>new Promise((resolve,reject)=>{
	// 	if (defendAliveBool==true&&attackAliveBool==true) {
	// 		var stringUpdate = "UPDATE `s"+Server_ID+"_unit` SET `Status`='"+functions.UnitStatus.Attack_Unit+"',`Attack_Unit_ID` ='"+ID_Defend+"' WHERE `ID`='"+ID_Attack.split("_")[3]+"'; "+
	// 		"UPDATE `s"+Server_ID+"_unit` SET`AttackedBool` = '1' WHERE `ID` = '"+ID_Defend.split("_")[3]+"'"
	// 		db_position.query(stringUpdate,function (error,result) {
	// 			if (!!error) {console.log('AttackFunc.js setAttackData '+stringUpdate);}
	// 			resolve();
	// 		});
	// 	}
	// }))
	// )
	// )	
}


//#begin: Attack Interval
exports.AttackInterval =function (io,Server_ID,ID_Defend){
	attackInterval (io,Server_ID,ID_Defend)
}

function attackInterval (io,Server_ID,ID_Defend){
	stringInterval = "Attacking_"+ID_Defend;

	if (DictTimeAttack[stringInterval]==null||DictTimeAttack[stringInterval]==undefined) {
		doAttackInterval (io,Server_ID,ID_Defend)
	}

}
function doAttackInterval (io,Server_ID,ID_Defend){
	stringHAttack = "s"+Server_ID+"_attack";
	stringHUnit = "s"+Server_ID+"_unit";
	stringInterval = "Attacking_"+ID_Defend;
	var clearBool = false;
	//lay data attack truoc => danh truoc roi moi chay lai timeout
	var defendAliveBool = true;
	functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js attackInterval stringHUnit,stringHAttack,Server_ID,ID_Defend',[stringHUnit,stringHAttack,Server_ID,ID_Defend]);
	new Promise((resolve,reject)=>{
		functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js attackInterval hget1 stringHUnit,ID_Defend',[stringHUnit,ID_Defend]);
		client.hget(stringHUnit,ID_Defend,function (error,rows) {
			if (rows==null||rows==undefined) {
				defendAliveBool = false;
				functions.ShowLog(functions.ShowLogBool.Off,'AttackFunc.js attackInterval=>clearDefend1 ID_Defend',[ID_Defend]);
				clearDefend(io,ID_Defend);			
			}
			// if (rows==undefined) {
			// 	defendAliveBool = false;
			// 	functions.ShowLog(functions.ShowLogBool.Off,'AttackFunc.js attackInterval=>clearDefend2 ID_Defend',[ID_Defend]);
			// 	clearDefend(io,ID_Defend);
			// }
			if (defendAliveBool == false) {clearDefend(io,ID_Defend);}
			resolve();
		});
	}).then(()=>{
		new Promise((resolve,reject)=>{
			if (defendAliveBool==true) {
				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js attackInterval hget2 stringHAttack,ID_Defend',[stringHAttack,ID_Defend]);
				client.hget(stringHAttack,ID_Defend,function (error,rows) {	
					if (rows!=null) {
						var dataAttack = rows.split("/").filter(String);						
						if (dataAttack.length>0) {
							functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js attackInterval=>getAttackCalc Server_ID,dataAttack,ID_Defend',[Server_ID,dataAttack,ID_Defend]);
							getAttackCalc (io,Server_ID,dataAttack,ID_Defend);
						}else {
							functions.ShowLog(functions.ShowLogBool.Off,'AttackFunc.js attackInterval=>clearDefend3 ID_Defend',[ID_Defend]);
							clearDefend(io,ID_Defend);
							clearBool = true;
						}
					}else {
						functions.ShowLog(functions.ShowLogBool.Off,'AttackFunc.js attackInterval=>clearDefend4 ID_Defend',[ID_Defend]);
						clearDefend(io,ID_Defend);
						clearBool = true;
						
					}	
					resolve();
				});
			}
			
		})
	}).then(()=>{
		if (defendAliveBool==true && clearBool==false) {
			functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js attackInterval=>DictTimeAttack[stringInterval] Server_ID,ID_Defend',[Server_ID,ID_Defend]);
			DictTimeAttack[stringInterval] = setTimeout(function (io,Server_ID,ID_Defend) {
				doAttackInterval (io,Server_ID,ID_Defend)
			}, 1000,io,Server_ID,ID_Defend);
		}
		
	})
	
}

function getAttackCalc (io,server_ID,dataAttack,dataDefend) {
	stringHUnit = "s"+server_ID+"_unit";
	stringHAttack = "s"+server_ID+"_attack";

	var def = {};
	var Attack = 0, Hea_Lost = 0;
	var CounterMul = [];
	var QualityLost = 0;
	var tempObj={};
	var defendAliveBool=false;
	var rowsUnit={};
	var clearBool =  false;

	functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js getAttackCalc server_ID,dataAttack,dataDefend',[server_ID,dataAttack,dataDefend]);
	
	new Promise((resolve,reject)=>{
		functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js getAttackCalc hget stringHUnit,ID_User_Attack',[stringHUnit,dataAttack]);

		client.hget(stringHUnit,dataDefend,function (error,rows) {
			if (rows!=null) {
				def = JSON.parse(rows);
				if (def.Server_ID==null||def.Server_ID==undefined) {def.Server_ID=dataDefend.split("_")[0];}
				if ((def.Attack_Unit_ID==null&&def.Status==functions.UnitStatus.Standby)||(def.Attack_Unit_ID=='null'&&def.Status==functions.UnitStatus.Standby)) {
					functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js getAttackCalc=>checkAttackPosition dataDefend,def.Position_Cell',[dataDefend,def.Position_Cell]);
					checkAttackPosition (io,dataDefend,def.Position_Cell)
					// checkCurrentPos(io,def,dataDefend,def.Position_Cell,server_ID);
				}
				defendAliveBool = true;
			}else{
				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js getAttackCalc=>clearDefend1 dataDefend',[dataDefend]);
				clearBool = true;
				clearDefend(io,dataDefend);
			}	
			resolve();
		});

	}).then(()=>{
		return new Promise((resolve,reject)=>{
			functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js getAttackCalc hmget stringHUnit,dataAttack',[stringHUnit,dataAttack]);			
			client.hmget(stringHUnit,dataAttack,function (error,rows){
				rowsUnit = rows;

				if (rows!=null&&defendAliveBool==true) {
					for (var i = 0; i < rows.length; i++) {
						if (rows[i]!=null) {
							var result = JSON.parse(rows[i]);
							functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js getAttackCalc=>checkCounter result,def',[result,def]);
							CounterMul[i] = checkCounter(result,def);
							Attack = Attack + (result.Attack * (result.Quality/def.Quality)*CounterMul[i]);
							functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js getAttackCalc=>checkSocketAttack server_ID,dataAttack[i],result,dataDefend',[server_ID,dataAttack[i],result,dataDefend]);
							checkSocketAttack (io,server_ID,dataAttack[i],result,dataDefend);
						}else {
							Attack = Attack + 0;
							if (dataDefend==null) {functions.ShowLog(functions.ShowLogBool.Error,'AttackFunc.js getAttackCalc removeRedisData dataDefend null',[dataDefend]);return null;}
							else{
								functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js getAttackCalc=>removeRedisData dataDefend,dataAttack[i]',[dataDefend,dataAttack[i]]);
								removeRedisData (stringHAttack,dataDefend,dataAttack[i]);							
								dataAttack.splice(dataAttack.indexOf(dataAttack[i]), 1);
							}
						}

						Hea_Lost = parseFloat(Attack - def.Defend).toFixed(2);

						if (Hea_Lost < 1) {Hea_Lost = 1;}

						if (Hea_Lost < def.Hea_cur){
							if (parseFloat(def.Hea_cur - Hea_Lost).toFixed(2)<1) {
								def.Hea_cur = def.Hea_cur - 1;
							}else{
								def.Hea_cur = parseFloat(def.Hea_cur - Hea_Lost).toFixed(2);
							}	
						}else if (Hea_Lost >= def.Hea_cur) {
							if (parseFloat(def.Health - parseInt((Hea_Lost - def.Hea_cur)%def.Health)).toFixed(2)<1) {
								def.Hea_cur = def.Hea_cur - 1;
							}else{
								def.Hea_cur = parseFloat(def.Health - parseInt((Hea_Lost - def.Hea_cur)%def.Health)).toFixed(2);
							}

							QualityLost = parseInt((Hea_Lost - def.Hea_cur)/def.Health);
							def.Quality = def.Quality - (parseInt((Hea_Lost - def.Hea_cur)/def.Health) +1);
						}

					}

					if (def.Quality <= 0) {

						def.Quality = 0;
						functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js getAttackCalc def.Quality=0',[def]);
						for (var i = 0; i < rows.length; i++) {
							if (rows[i]!=null) {

								var resultAttack = JSON.parse(rows[i]);
								resultAttack.Status = functions.UnitStatus.Standby;
								resultAttack.Attack_Unit_ID = null;

								var stringAttack = server_ID+"_"+resultAttack.ID_Unit+"_"+resultAttack.ID_User+"_"+resultAttack.ID;

								// client.hset(stringHUnit,stringAttack,JSON.stringify(resultAttack));
								client.hset(stringHUnit,dataAttack[i],JSON.stringify(resultAttack));
								
								functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js getAttackCalc=>checkAttackPosition stringAttack,resultAttack.Position_Cell',[stringAttack,resultAttack.Position_Cell]);
								// checkCurrentPos(io,resultAttack,stringAttack,resultAttack.Position_Cell,server_ID);
								checkAttackPosition (io,stringAttack,resultAttack.Position_Cell);
							}
						}

					}
					functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js getAttackCalc=>updateAttackData dataAttack',[dataAttack]);
					updateAttackData (io,dataAttack);

					functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js getAttackCalc=>updateRemoveDefendData dataAttack',[server_ID,dataDefend]);
					updateRemoveDefendData (server_ID,dataDefend);
					def.Hea_cur = Number(def.Hea_cur);
					resolve();
				}

			})

		})		
		
	}).then(()=>{

		return new Promise((resolve,reject)=>{
			if (clearBool==false) {
				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js getAttackCalc=>updateDataBaseQuality server_ID,def',[server_ID,def]);
				updateDataBaseQuality(server_ID,def);
				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js getAttackCalc=>checkSocketClient dataDefend,def',[dataDefend,def]);
				checkSocketClient (io,dataDefend,def);

				if (def.Quality>0) {
					functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js getAttackCalc=>hset def.Quality>0 def',[def]);
					client.hset(stringHUnit,dataDefend,JSON.stringify(def));
				}else{
					
					functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js getAttackCalc=>positionRemove.PostionRemove def',[def]);
					positionRemove.PostionRemove(def);

					functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js getAttackCalc=>moving.ClearMoveTimeout dataDefend,def',[dataDefend,def]);
					moving.ClearMoveTimeout(io,dataDefend,def);

					functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js getAttackCalc=>clearMovingAttack dataDefend',[dataDefend]);
					clearMovingAttack(dataDefend);

					functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js getAttackCalc=>clearDefend2 dataDefend',[dataDefend]);
					clearDefend(io,dataDefend);

					functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js getAttackCalc=>hdel stringHAttack,dataDefend',[stringHAttack,dataDefend]);
					client.hdel(stringHAttack,dataDefend);

					functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js getAttackCalc=>hdel stringHUnit,dataDefend',[stringHUnit,dataDefend]);
					client.hdel(stringHUnit,dataDefend);

					clearBool=true;
				}
			}
			resolve();

		})
		
	}).then(()=>{
		
		if (QualityLost>0) {
			functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js getAttackCalc=>updateMight_Kill QualityLost,dataAttack,dataDefend',[QualityLost,dataAttack,dataDefend]);
			updateMight_Kill (QualityLost,dataAttack,dataDefend);
		}

	})

}

// xoa trong redis thoi khi di chuyen

exports.RemoveRedisData = function (stringHkey,stringKeyDefend,ID_Attack) {
	removeRedisData (stringHkey,stringKeyDefend,ID_Attack);
}
function removeRedisData (stringHkey,stringKeyDefend,ID_Attack) {

	functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js removeRedisData stringHkey,stringKeyDefend,ID_Attack',[stringHkey,stringKeyDefend,ID_Attack]);
	functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js removeRedisData hget stringHkey,stringKeyDefend',[stringHkey,stringKeyDefend]);
	client.hget(stringHkey,stringKeyDefend,function (error,rows) {				
		if (rows!=null) {
			var result = rows.split("/").filter(String);
			if (result.includes(ID_Attack)) {
				var stringReplace = rows.replace(ID_Attack+"/","");
				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js removeRedisData hset stringReplace',[stringReplace]);
				client.hset(stringHkey,stringKeyDefend,stringReplace);
				if (stringReplace.length==0) {
					functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js removeRedisData hdel stringHkey,stringKeyDefend',[stringHkey,stringKeyDefend]);
					client.hdel(stringHkey,stringKeyDefend);
				}
			}
		}
		if (!!error) {
			functions.ShowLog(functions.ShowLogBool.Error,'AttackFunc.js removeRedisData stringHkey,stringKeyDefend,ID_Attack',[stringHkey,stringKeyDefend,ID_Attack]);
		}
	})

}
// #end: removeRedisData

// #Begin: checkCounter
function checkCounter (dataAtt,dataDef) {
	var counterAB=1;
	functions.ShowLog(functions.ShowLogBool.Off,'AttackFunc.js checkCounter dataAtt,dataDef',[dataAtt,dataDef]);

	if (dataAtt==null) {
		functions.ShowLog(functions.ShowLogBool.Off,'AttackFunc.js checkCounter counterAB',[counterAB]);
		return 0;
	}else {
		var unitA = returnCaseUnit (dataAtt.ID_Unit);
		var unitB = returnCaseUnit (dataDef.ID_Unit);

		if (unitA==1 && unitB == 3) {counterAB = counter;}
		else if (unitA==3 && unitB == 2) {counterAB = counter;}
		else if (unitA==2 && unitB == 1) {counterAB = counter;}

		else if (unitA==3 && unitB == 1) {counterAB = parseFloat(1/counter).toFixed(2);}
		else if (unitA==2 && unitB == 3) {counterAB = parseFloat(1/counter).toFixed(2);}
		else if (unitA==1 && unitB == 2) {counterAB = parseFloat(1/counter).toFixed(2);}
		functions.ShowLog(functions.ShowLogBool.Off,'AttackFunc.js checkCounter counterAB',[counterAB]);
		return counterAB;	
	}
}
function returnCaseUnit (dataUnit) {
	var returnCase=0;
	if (dataUnit>15&&dataUnit<20) {returnCase=1;}
	else if (dataUnit>20&&dataUnit<25) {returnCase=2;}
	else if (dataUnit>25&&dataUnit<30) {returnCase=3;}
	else {returnCase = 4;}
	functions.ShowLog(functions.ShowLogBool.Off,'AttackFunc.js returnCaseUnit dataUnit,returnCase',[dataUnit,returnCase]);
	return returnCase;
}
// #end: checkCounter

// #begin: updateMight_Kill
function updateMight_Kill (QualityLost,dataAttack,dataDefend) {
	functions.ShowLog(functions.ShowLogBool.Off,'AttackFunc.js updateMight_Kill=>getInfo.UpdateMight_Kill QualityLost,dataAttack,dataDefend',[QualityLost,dataAttack,dataDefend]);
	getInfo.UpdateMight_Kill(QualityLost,dataAttack,dataDefend);
}
// #end: updateMight_Kill

exports.ClearMovingAttack = function (stringUnit) {
	clearMovingAttack (dataDefend)
}

function clearMovingAttack (stringUnit) {
	moving_Attack.ClearMovingAttack(stringUnit)
	// stringMoveAttack = "Moving_Attack_"+stringUnit;
	// functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js clearMovingAttack stringUnit,stringMoveAttack,DictMoveAttack[stringMoveAttack]',[stringUnit,stringMoveAttack,DictMoveAttack[stringMoveAttack]]);
	// if (DictMoveAttack[stringMoveAttack]!=null) {
	// 	clearTimeout(DictMoveAttack[stringMoveAttack]);			
	// 	delete DictMoveAttack[stringMoveAttack];
	// }
}
// exports.CheckAttackedUnit = function (io,Server_ID,dataCheck) {
// 	checkAttackedUnit (io,Server_ID,dataCheck);
// }
// function checkAttackedUnit (io,Server_ID,dataCheck) {
// 	// console.log("checkAttackedUnit: "+dataCheck)
// 	// var posArray = [];
// 	// var dataAttack = dataCheck;

// 	// var dataDefendArray = [];
// 	// var dataDefend;

// 	// var attackBool = false;
// 	// var attackDataBool = false;

// 	stringHUnit = "s"+Server_ID+"_unit";
// 	stringHAttack = "s"+Server_ID+"_attack";
// 	var attackedBool=false;
// 	functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js checkAttackedUnit stringHUnit,stringHAttack,dataCheck,',[stringHUnit,stringHAttack,dataCheck]);

// 	client.hget(stringHUnit,dataCheck,function (error,rows) {
// 		if (rows!=null) {
// 			var result = JSON.parse(rows);

// 			functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js checkAttackedUnit stringHUnit,dataCheck,',[stringHUnit,dataCheck]);
// 			checkAttackPosition(io,dataCheck,result.Position_Cell);

// 		}else{
// 			functions.ShowLog(functions.ShowLogBool.Error,'AttackFunc.js checkAttackedUnit dataCheck null',[dataCheck]);
// 			return null;
// 		}
// 	})
// }

// #CheckAttackPosition lấy unit để tấn công
exports.CheckAttackPosition = function (io,stringUnit,pos) {
	checkAttackPosition (io,stringUnit,pos) 
}

function checkAttackPosition (io,stringUnit,pos) {
	functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js checkAttackPosition stringUnit,pos',[stringUnit,pos]);

	var arrayUnitInPos = [], tempListUnitInPos = [], listUnitAttacking = [];

	var Server_ID = stringUnit.split("_")[0];
	var ID_User = stringUnit.split("_")[2];

	var getAttackBool = false;
	var defendingUnit;

	stringHUnit = "s"+Server_ID+"_unit";
	stringHAttack = "s"+Server_ID+"_attack";
	stringHPos = "s"+Server_ID+"_pos";

	var returnPosArray = positionCheckPos.CheckPostion(stringUnit,pos);

	functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js checkAttackPosition returnPosArray',[returnPosArray]);

	functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js checkAttackPosition hget stringHAttack,stringUnit',[stringHAttack,stringUnit]);
	client.hget(stringHAttack,stringUnit,function (error,rows) {
		if (rows!=null) {
			listUnitAttacking = rows.split("/").filter(String);
			functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js checkAttackPosition=>getAttackedUnit stringUnit,pos,listUnitAttacking,returnPosArray',[stringUnit,pos,listUnitAttacking,returnPosArray]);
			getAttackedUnit(io,stringUnit,pos,listUnitAttacking,returnPosArray)
		}else {
			functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js checkAttackPosition=>getUnitAttackInPos stringUnit,pos,returnPosArray',[stringUnit,pos,returnPosArray]);
			getUnitAttackInPos(io,stringUnit,pos,returnPosArray)
		}

	})

}

function getAttackedUnit(io,stringUnit,pos,listUnitAttacking,returnPosArray) {
	functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js getAttackedUnit stringUnit,pos,listUnitAttacking,returnPosArray',[stringUnit,pos,listUnitAttacking,returnPosArray]);
	var Server_ID = stringUnit.split("_")[0];
	var ID_User = stringUnit.split("_")[2];

	var getAttackBool = false;
	var defendingUnit;

	stringHPos = "s"+Server_ID+"_pos";
	stringHUnit = "s"+Server_ID+"_unit";
	stringHAttack = "s"+Server_ID+"_attack";

	new Promise((resolve,reject)=>{
		functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js getAttackedUnit hmget stringHUnit,listUnitAttacking',[stringHUnit,listUnitAttacking]);
		
		client.hmget(stringHUnit,listUnitAttacking,function (error,rows) {
			if (rows!=null) {
				for (var i = 0; i < rows.length; i++) {
					if (rows[i]!=null) {
						var result =  JSON.parse(rows[i]);
						if (returnPosArray.includes(result.Position_Cell)) {
							getAttackBool = true;
							defendingUnit = listUnitAttacking[i];
							break;
						}
					}					
				}				
			}
			resolve();
		})

	}).then(()=>{		
		new Promise((resolve,reject)=>{
			if (getAttackBool==true) {
				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js getAttackedUnit=>setAttackData Server_ID,defendingUnit,stringUnit',[Server_ID,defendingUnit,stringUnit]);
				setAttackData(Server_ID,defendingUnit,stringUnit);
			}else {
				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js getAttackedUnit hmget stringHUnit,listUnitAttacking',[stringHUnit,listUnitAttacking]);
				getUnitAttackInPos(io,stringUnit,pos,returnPosArray);
			}
			resolve();
		})

	}).then(()=>{
		
		return new Promise((resolve,reject)=>{
			if (getAttackBool==true) {
				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js getAttackedUnit=>attackInterval Server_ID,defendingUnit',[Server_ID,defendingUnit]);
				attackInterval(io,Server_ID,defendingUnit);	
			}
			resolve();
		})

	})
}

function getUnitAttackInPos (io,stringUnit,pos,returnPosArray) {
	functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js getUnitAttackInPos hmget stringUnit,pos,returnPosArray',[stringUnit,pos,returnPosArray]);
	var arrayUnitInPos = [], tempListUnitInPos = [];
	var Server_ID = stringUnit.split("_")[0];
	var ID_User = stringUnit.split("_")[2];

	var getAttackBool = false;
	var defendingUnit;

	stringHPos = "s"+Server_ID+"_pos";
	stringHUnit = "s"+Server_ID+"_unit"
	stringHAttack = "s"+Server_ID+"_attack";
	// console.log('stringUnit,pos,returnPosArray')
	// console.log(stringUnit,pos,returnPosArray)
	new Promise((resolve,reject)=>{		
		functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js getUnitAttackInPos hget stringHPos,pos',[stringHPos,pos]);		
		client.hget(stringHPos,pos,function (error,rows){
			if (rows!=null) {
				arrayUnitInPos = rows.split("/").filter(String);
				for (var i = 0; i < arrayUnitInPos.length; i++) {
					if (arrayUnitInPos[i].split("_")[2] != ID_User) {
						tempListUnitInPos.push(arrayUnitInPos[i]);
					}
				}
			}else{
				functions.ShowLog(functions.ShowLogBool.Off,'AttackFunc.js getUnitAttackInPos=>clearDefend not found any unit',[]);
				clearDefend(io,stringUnit)

				// return null;
			}
			resolve();
		})

	}).then(()=>{

		return new Promise((resolve,reject)=>{
			if (tempListUnitInPos.length==0) {console.log('tempListUnitInPos length 0');}
			else {
				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js getUnitAttackInPos hmget stringHUnit,tempListUnitInPos',[stringHUnit,tempListUnitInPos]);
				client.hmget(stringHUnit,tempListUnitInPos,function (error,rowsUnit) {				
					if (rowsUnit!=null) {
						for (var i = 0; i < rowsUnit.length; i++) {
							if (rowsUnit[i]!=null) {
								var resultUnitAttack = JSON.parse(rowsUnit[i])
								if (returnPosArray.includes(resultUnitAttack.Position_Cell)) {
									getAttackBool = true;
									defendingUnit = tempListUnitInPos[i];
									break;
								}
							}
						}
					}
					if (getAttackBool == false) {return null;}
					resolve();
				})
			}
			

		})

	}).then(()=>{
		
		return new Promise((resolve,reject)=>{
			if (getAttackBool==true) {
				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js getUnitAttackInPos=>setAttackData',[Server_ID,defendingUnit,stringUnit]);
				setAttackData(Server_ID,defendingUnit,stringUnit);					
			}
			resolve();
		})

	}).then(()=>{
		return new Promise((resolve,reject)=>{
			if (getAttackBool==true) {
				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js getUnitAttackInPos=>attackInterval',[Server_ID,defendingUnit]);
				attackInterval(io,Server_ID,defendingUnit);
				resolve();
			}
		})
	})

}
// #CheckAttackPosition

function updateRemoveDefendData (server_ID,stringDefend) {
	functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js updateRemoveDefendData server_ID,stringDefend',[server_ID,stringDefend]);
	stringHUnit ="s"+server_ID+"_unit";
	stringHAttack ="s"+server_ID+"_attack";

	var stringQuery ="SELECT `Attack_Unit_ID` FROM `s"+server_ID+"_unit` WHERE `ID` ='"+stringDefend.split("_")[3]+"'"
	db_position.query(stringQuery,function (error,rows) {
		if (!!error) {console.log('AttackFunc.js updateRemoveDefendData '+ stringQuery);}
		if (rows[0]!=null) {
			if (rows[0].Attack_Unit_ID!=null) {
				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js updateRemoveDefendData=>removeRedisData stringHAttack,rows[0].Attack_Unit_ID,stringDefend',[stringHAttack,rows[0].Attack_Unit_ID,stringDefend]);
				removeRedisData (stringHAttack,rows[0].Attack_Unit_ID,stringDefend);
			}
		}
	})
}

function updateDataBaseQuality (server_ID,dataUpdate) {
	var stringUpdate;
	if (dataUpdate.Quality > 0) {
		stringUpdate = "UPDATE `s"+server_ID+"_unit` SET `Quality`= '"+dataUpdate.Quality+"', `Hea_cur`='"+dataUpdate.Hea_cur
		+"' WHERE `ID`='"+dataUpdate.ID+"'";
		// LogChange		
	}else{
		stringUpdate = "DELETE FROM `s"+server_ID+"_unit` WHERE `ID`='"+dataUpdate.ID+"'";
		// LogChange		
	}
	functions.ShowLog(functions.ShowLogBool.Off,'AttackFunc.js updateDataBaseQuality server_ID,dataUpdate,stringUpdate',[server_ID,dataUpdate,stringUpdate]);
	db_position.query(stringUpdate,function (error,result) {
		if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'AttackFunc.js updateDataBaseQuality server_ID,dataUpdate,stringUpdate',[server_ID,dataUpdate,stringUpdate]);}
	});
}


function checkSocketClient (io,dataDefend,def) {
	var Server_ID = dataDefend.split("_")[0]
	var stringHSocket = "s"+Server_ID+"_socket";
	functions.ShowLog(functions.ShowLogBool.Off,'AttackFunc.js checkSocketClient dataDefend,def',[dataDefend,def]);
	client.hvals(stringHSocket,function (error,rowsSocket) {
		if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'AttackFunc.js checkSocketClient stringHSocket',[stringHSocket]);}	
		for (var i = 0; i < rowsSocket.length; i++) {
			sendToClient (io,rowsSocket[i],def);
		}
	});
}
function checkSocketAttack (io,Server_ID,dataAttack,att,dataDefend) {
	functions.ShowLog(functions.ShowLogBool.Off,'AttackFunc.js checkSocketAttack Server_ID,dataAttack,att,dataDefend',[Server_ID,dataAttack,att,dataDefend]);
	var stringHSocket = "s"+Server_ID+"_socket";
	client.hvals(stringHSocket,function (error,rowsSocket) {
		if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'AttackFunc.js checkSocketAttack stringHSocket',[stringHSocket]);}
		for (var i = 0; i < rowsSocket.length; i++) {
			functions.ShowLog(functions.ShowLogBool.Off,'AttackFunc.js checkSocketAttack=>sendToClientAttack rowsSocket[i],att,dataDefend',[rowsSocket[i],att,dataDefend]);
			sendToClientAttack (io,rowsSocket[i],att,dataDefend);
		}
	});
}
function sendToClientAttack (io,socketID,att,dataDefend) {
	// console.log(att.Attack_Unit_ID)
	var dataSend ={
		ID: 			att.ID,
		ID_User: 		att.ID_User,
		ID_Unit: 		att.ID_Unit,
		Quality:        att.Quality,
		Hea_cur: 		att.Hea_cur,
		Health: 		att.Health,
		Attack_Unit_ID: dataDefend
	}
	functions.ShowLog(functions.ShowLogBool.Off,'AttackFunc.js sendToClientAttack socketID,att,dataDefend',[socketID,att,dataDefend,dataSend]);
	io.to(socketID).emit('R_ATTACK',{R_ATTACK:dataSend});
}

function sendToClient (io,socketID,def) {
	var dataSend ={
		ID: 			def.ID,
		ID_User: 		def.ID_User,
		ID_Unit: 		def.ID_Unit,
		Quality:        def.Quality,
		Hea_cur: 		def.Hea_cur,
		Health: 		def.Health,
		Attack_Unit_ID: def.Attack_Unit_ID
	}
	functions.ShowLog(functions.ShowLogBool.Off,'AttackFunc.js sendToClient socketID,def',[socketID,def,dataSend]);
	io.to(socketID).emit('R_ATTACK',{R_ATTACK:dataSend});
}
//#end: Attack Interval

//#begin: updateAttackData
function updateAttackData (io,data) {
	functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js updateAttackData=>checkDataAttack data',[data]);
	for (var i = 0; i < data.length; i++) {
		checkDataAttack (io,data[i])
	}
}
function checkDataAttack (io,dataCheck) {
	var stringHUnit;
	var stringUpdate,stringQuery;
	functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js checkDataAttack dataCheck',[dataCheck]);
	
	for (var i = 0; i < dataCheck.length; i++) {

		
		stringHUnit = "s"+dataCheck[i].toString().split("_")[3]+"_unit"
		stringQuery = "SELECT * FROM `s"+dataCheck.toString().split("_")[0]+"_unit` WHERE "+
		"`ID`='"+dataCheck[i].toString().split("_")[3]+"'";

		functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js checkDataAttack dataCheck',[dataCheck]);
		db_position.query(stringQuery,function(error,rows){
			if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'AttackFunc.js checkDataAttack stringQuery',[stringQuery]);}
			if (rows[0]!=null) {
				
				if (rows[0].Status!=functions.UnitStatus.Base){
					stringUpdate = "UPDATE `s"+dataCheck.toString().split("_")[0]+"_unit` SET "
					+"`Status`='"+functions.UnitStatus.Standby
					+"',`Attack_Unit_ID`= NULL"
					+" WHERE `ID`='"+dataCheck.toString().split("_")[3]+"'";
					functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js checkDataAttack hget stringHUnit,dataCheck',[stringHUnit,dataCheck]);
					client.hget(stringHUnit,dataCheck,function (error,rows) {
						if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'AttackFunc.js checkDataAttack hget stringHUnit,dataCheck',[stringHUnit,dataCheck]);}
						var result = JSON.parse(rows);
						result.Status = functions.UnitStatus.Standby;
						result.Attack_Unit_ID = null;
						functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js checkDataAttack hset result',[result]);
						client.hset(stringHUnit,dataCheck,JSON.stringify(result));
					});


				}else {
					stringUpdate = "UPDATE `s"+dataCheck.toString().split("_")[0]+"_unit` SET "
					+"`Status`='"+functions.UnitStatus.Base
					+"',`Attack_Unit_ID`= NULL"
					+" WHERE `ID`='"+dataCheck.toString().split("_")[3]+"'";
					functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js checkDataAttack hget stringHUnit,dataCheck',[stringHUnit,dataCheck]);
					client.hget(stringHUnit,dataCheck,function (error,rows) {
						if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'AttackFunc.js checkDataAttack hget stringHUnit,dataCheck',[stringHUnit,dataCheck]);}
						var result = JSON.parse(rows);
						result.Status = functions.UnitStatus.Base;
						result.Attack_Unit_ID = null;
						functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js checkDataAttack hset result',[result]);
						client.hset(stringHUnit,dataCheck,JSON.stringify(result));
					});			
				}
				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js checkDataAttack stringUpdate',[stringUpdate]);
				db_position.query(stringUpdate,function(error,result){
					if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'AttackFunc.js checkDataAttack stringUpdate',[stringUpdate]);}
				});

			}
		})
	}
}



function updateDataBaseAttack (Server_ID,dataAttack,dataDefend) {
	functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js updateDataBaseAttack Server_ID,dataAttack,dataDefend',[Server_ID,dataAttack,dataDefend]);
	
	var ID = dataAttack.split("_")[3];
	var stringUpdate = "UPDATE `s"+Server_ID+"_unit` SET `Attack_Unit_ID` ='"+dataDefend+"', `Status`='"+functions.UnitStatus.Attack_Unit+"' WHERE `ID`='"+ID+"'"
	functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js updateDataBaseAttack stringUpdate',[stringUpdate]);
	db_position.query(stringUpdate,function (error,result) {
		if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'AttackFunc.js updateDataBaseAttack stringUpdate',[stringUpdate]);}
	});
	functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js hget stringHUnit,dataAttack',[stringHUnit,dataAttack]);
	client.hget(stringHUnit,dataAttack,function (error,rows) {
		if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'AttackFunc.js updateDataBaseAttack stringHUnit,dataAttack',[stringHUnit,dataAttack]);}
		var result = JSON.parse(rows)
		result.Attack_Unit_ID = dataDefend;
		functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js hset result',[result]);
		client.hset(stringHUnit,dataAttack,JSON.stringify(result));
	});
}
// #end: updateAttackData
//#begin: removeRedisData



// #ClearDefend
// exports.StopIntervalAttack =function (ID_User_Defend) {
// 	stopIntervalAttack (ID_User_Defend);
// }
// function stopIntervalAttack (ID_User_Defend) {
// 	functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js stopIntervalAttack ID_User_Defend',[ID_User_Defend]);
// 	var server_ID = ID_User_Defend.split("_")[0];
// 	var ID_Unit = ID_User_Defend.split("_")[3];
// 	stringHAttack ="s"+server_ID+"_attack";
// 	stringHUnit ="s"+server_ID+"_unit";
// 	stringInterval = "Attacking_"+ID_User_Defend;

// 	if (DictTimeAttack[stringInterval]!=undefined) {
// 		functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js stopIntervalAttack DictTimeAttack[stringInterval]',[DictTimeAttack[stringInterval]]);
// 		clearTimeout(DictTimeAttack[stringInterval]);			
// 		delete DictTimeAttack[stringInterval];			
// 	}
// 	functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js stopIntervalAttack stringHAttack,ID_User_Defend',[stringHAttack,ID_User_Defend]);
// 	client.hdel(stringHAttack,ID_User_Defend);

// 	new Promise((resolve,reject)=>{
// 		functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js stopIntervalAttack hget stringHUnit,stringKey',[stringHUnit,stringKey]);
// 		client.hget(stringHUnit,stringKey,function (error,rows) {
// 			if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'AttackFunc.js stopIntervalAttack hget stringHUnit,stringKey',[stringHUnit,stringKey]);}
// 			var unitResult = JSON.parse(rows);
// 			unit.AttackedBool = 0;
// 			client.hset(stringHUnit,stringKey,JSON.stringify(unitResult))
// 			resolve();
// 		})
// 	}).then(()=>{
// 		return new Promise((resolve,reject)=>{
// 			var stringUpdate = "UPDATE `s"+server_ID+"_unit` SET `AttackedBool`='0' WHERE `ID`='"+ID_Unit+"';"
// 			db_position.query(stringUpdate,function(error,result){
// 				if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'AttackFunc.js stopIntervalAttack stringUpdate',[stringUpdate]);}
// 				resolve();
// 			})

// 		})
// 	})
// }


// exports.ClearInterAttackUpdate = function clearInterAttackUpdate2 (io,ID_User_Defend){
// 	clearInterAttackUpdate (io,ID_User_Defend);
// }

// function clearInterAttackUpdate (io,ID_User_Defend) {
// 	stringInterval = "Attacking_"+ID_User_Defend;
// 	var server_ID = ID_User_Defend.split("_")[0]
// 	stringHAttack ="s"+server_ID+"_attack";
// 	stringHUnit = "s"+server_ID+"_unit";
// 	var resultArrayUnit = [];
// 	var arrayAttacking = [];

// 	functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js clearInterAttackUpdate ID_User_Defend,stringInterval,server_ID,stringHAttack,stringHUnit',[ID_User_Defend,stringInterval,server_ID,stringHAttack,stringHUnit]);

// 	new Promise((resolve,reject)=>{
// 		functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js clearInterAttackUpdate hget stringHAttack,ID_User_Defend',[stringHAttack,ID_User_Defend]);
// 		client.hget(stringHAttack,ID_User_Defend, function (error,rows){
// 			if (rows!=null) {
// 				resultArrayUnit = rows.split("/").filter(String);
// 			}
// 			resolve();
// 		})
// 	}).then(()=>{
// 		return new Promise((resolve,reject)=>{
// 			if (resultArrayUnit.length>0) {
// 				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js clearInterAttackUpdate hmget sstringHAttack,resultArrayUnit',[stringHAttack,resultArrayUnit]);
// 				client.hmget(stringHAttack,resultArrayUnit,function (error,rowsAttack) {
// 					if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'AttackFunc.js clearInterAttackUpdate hmget stringHAttack,resultArrayUnit',[stringHAttack,resultArrayUnit]);}
// 					arrayAttacking = rowsAttack;
// 					resolve();
// 				})
// 			}else{
// 				resolve();
// 			}
// 		})
// 	}).then(()=>{
// 		return new Promise((resolve,reject)=>{
// 			if (resultArrayUnit.length>0) {
// 				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js clearInterAttackUpdate hmget stringHUnit,resultArrayUnit',[stringHUnit,resultArrayUnit]);
// 				client.hmget(stringHUnit,resultArrayUnit,function (error,resultUnitAttack){
// 					if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'AttackFunc.js clearInterAttackUpdate hmget stringHUnit,resultArrayUnit',[stringHUnit,resultArrayUnit]);}
// 					if (resultUnitAttack!=null) {

// 						for (var i = 0; i < resultUnitAttack.length; i++) {		
// 							if (resultUnitAttack[i]!=null) {
// 								var stringUnitResult =  JSON.parse(resultUnitAttack[i]);
// 								var unitID = resultArrayUnit[i];
// 								stringUnitResult.Attack_Unit_ID = null;
// 								if (arrayAttacking[i]==null) {
// 									stringUnitResult.AttackedBool = 0;
// 								}

// 								stringUnitResult.Status = functions.UnitStatus.Standby;	
// 								updateRedis (stringHUnit,unitID,stringUnitResult);
// 								var stringUpdate = "UPDATE `s"+server_ID+"_unit` SET `Attack_Unit_ID` = NULL, `Status`='"+functions.UnitStatus.Standby+"',`AttackedBool`='"+stringUnitResult.AttackedBool+"' WHERE `Attack_Unit_ID`='"+ID_User_Defend+"'";
// 								db_position.query(stringUpdate,function (error,result) {
// 									if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'AttackFunc.js clearInterAttackUpdate stringUpdate',[stringUpdate]);}	
// 								});							
// 							}
// 							if (i == (resultUnitAttack.length-1)) {
// 								resolve();
// 							}					
// 						}					
// 					}				
// 				})
// 			}
// 			resolve();


// 		})
// 	}).then(()=>{
// 		return new Promise((resolve,reject)=>{
// 			functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js clearInterAttackUpdate del stringInterval,stringHAttack,ID_User_Defend',[stringInterval,stringHAttack,ID_User_Defend]);
// 			if (DictTimeAttack[stringInterval]!=undefined) {
// 				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js clearInterAttackUpdate clearInterval1 stringInterval,DictTimeAttack[stringInterval]',[stringInterval,DictTimeAttack[stringInterval]]);
// 				clearInterval(DictTimeAttack[stringInterval]);			
// 				delete DictTimeAttack[stringInterval];
// 				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js clearInterAttackUpdate clearInterval2 stringInterval,DictTimeAttack[stringInterval]',[stringInterval,DictTimeAttack[stringInterval]]);									
// 			}
// 			client.hdel(stringHAttack,ID_User_Defend);
// 			resolve();
// 		})
// 	})

// }