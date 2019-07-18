'use strict';
var getInfo 				= require("./../Info/GetInfo.js");
var positionRemove 			= require('./../Redis/Position/Position_Remove.js'); 
// positionRemove.Test(5)
var moving 					= require('./../Unit/Moving.js');
var moving_Attack 			= require('./../Unit/Moving_Attack.js');

var position_Check			= require('./../Redis/Position/Position_Check.js');
var positionCheckPos		= require('./../Redis/Position/Position_CheckPos.js');
var db_position 			= require('./../Util/Database/Db_position.js');

var attackGetPos 			= require('./AttackGetPos.js');

var functions 				= require('./../Util/Functions.js');

var Promise 				= require('promise');
var redis 					= require("redis"),
client 						= redis.createClient();
client.select(functions.RedisData.TestUnit);

var counter = 1.2;

var stringHAttack,stringHUnit,stringHPos;
var DictTimeInterval={};
var stringInterval;

exports.StopIntervalAttack =function (ID_User_Defend) {
	stopIntervalAttack (ID_User_Defend);
}
function stopIntervalAttack (ID_User_Defend) {
	functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js stopIntervalAttack ID_User_Defend',[ID_User_Defend]);
	var server_ID = ID_User_Defend.split("_")[0];
	var ID_Unit = ID_User_Defend.split("_")[3];
	stringHAttack ="s"+server_ID+"_attack";
	stringHUnit ="s"+server_ID+"_unit";
	stringInterval = "Attacking_"+ID_User_Defend;

	if (DictTimeInterval[stringInterval]!=undefined) {
		functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js stopIntervalAttack DictTimeInterval[stringInterval]',[DictTimeInterval[stringInterval]]);
		clearInterval(DictTimeInterval[stringInterval]);			
		delete DictTimeInterval[stringInterval];			
	}
	functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js stopIntervalAttack stringHAttack,ID_User_Defend',[stringHAttack,ID_User_Defend]);
	client.hdel(stringHAttack,ID_User_Defend);

	new Promise((resolve,reject)=>{
		functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js stopIntervalAttack hget stringHUnit,stringKey',[stringHUnit,stringKey]);
		client.hget(stringHUnit,stringKey,function (error,rows) {
			if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'AttackFunc.js stopIntervalAttack hget stringHUnit,stringKey',[stringHUnit,stringKey]);}
			var unitResult = JSON.parse(rows);
			unit.AttackedBool = 0;
			client.hset(stringHUnit,stringKey,JSON.stringify(unitResult))
			resolve();
		})
	}).then(()=>{
		return new Promise((resolve,reject)=>{
			var stringUpdate = "UPDATE `s"+server_ID+"_unit` SET `AttackedBool`='0' WHERE `ID`='"+ID_Unit+"';"
			db_position.query(stringUpdate,function(error,result){
				if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'AttackFunc.js stopIntervalAttack stringUpdate',[stringUpdate]);}
				resolve();
			})

		})
	})
}


exports.ClearInterAttackUpdate = function clearInterAttackUpdate2 (io,ID_User_Defend){
	clearInterAttackUpdate (io,ID_User_Defend);
}

function clearInterAttackUpdate (io,ID_User_Defend) {
	stringInterval = "Attacking_"+ID_User_Defend;
	var server_ID = ID_User_Defend.split("_")[0]
	stringHAttack ="s"+server_ID+"_attack";
	stringHUnit = "s"+server_ID+"_unit";
	var resultArrayUnit = [];
	var arrayAttacking = [];

	functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js clearInterAttackUpdate ID_User_Defend,stringInterval,server_ID,stringHAttack,stringHUnit',[ID_User_Defend,stringInterval,server_ID,stringHAttack,stringHUnit]);

	new Promise((resolve,reject)=>{
		functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js clearInterAttackUpdate hget stringHAttack,ID_User_Defend',[stringHAttack,ID_User_Defend]);
		client.hget(stringHAttack,ID_User_Defend, function (error,rows){
			if (rows!=null) {
				resultArrayUnit = rows.split("/").filter(String);				
			}
			resolve();
		})
	}).then(()=>{
		return new Promise((resolve,reject)=>{
			if (resultArrayUnit.length>0) {
				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js clearInterAttackUpdate hmget sstringHAttack,resultArrayUnit',[stringHAttack,resultArrayUnit]);
				client.hmget(stringHAttack,resultArrayUnit,function (error,rowsAttack) {
					if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'AttackFunc.js clearInterAttackUpdate hmget stringHAttack,resultArrayUnit',[stringHAttack,resultArrayUnit]);}
					arrayAttacking = rowsAttack;
					resolve();
				})
			}else{
				resolve();
			}
		})
	}).then(()=>{
		return new Promise((resolve,reject)=>{
			if (resultArrayUnit.length>0) {
				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js clearInterAttackUpdate hmget stringHUnit,resultArrayUnit',[stringHUnit,resultArrayUnit]);
				client.hmget(stringHUnit,resultArrayUnit,function (error,resultUnitAttack){
					if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'AttackFunc.js clearInterAttackUpdate hmget stringHUnit,resultArrayUnit',[stringHUnit,resultArrayUnit]);}
					if (resultUnitAttack!=null) {

						for (var i = 0; i < resultUnitAttack.length; i++) {		
							if (resultUnitAttack[i]!=null) {
								var stringUnitResult =  JSON.parse(resultUnitAttack[i]);
								var unitID = resultArrayUnit[i];
								stringUnitResult.Attack_Unit_ID = null;
								if (arrayAttacking[i]==null) {
									stringUnitResult.AttackedBool = 0;
								}

								stringUnitResult.Status = functions.UnitStatus.Standby;	
								updateRedis (stringHUnit,unitID,stringUnitResult);
								var stringUpdate = "UPDATE `s"+server_ID+"_unit` SET `Attack_Unit_ID` = NULL, `Status`='"+functions.UnitStatus.Standby+"',`AttackedBool`='"+stringUnitResult.AttackedBool+"' WHERE `Attack_Unit_ID`='"+ID_User_Defend+"'";
								db_position.query(stringUpdate,function (error,result) {
									if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'AttackFunc.js clearInterAttackUpdate stringUpdate',[stringUpdate]);}	
								});							
							}
							if (i == (resultUnitAttack.length-1)) {
								resolve();
							}					
						}					
					}				
				})
			}
			resolve();


		})
	}).then(()=>{
		return new Promise((resolve,reject)=>{
			functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js clearInterAttackUpdate del stringInterval,stringHAttack,ID_User_Defend',[stringInterval,stringHAttack,ID_User_Defend]);
			if (DictTimeInterval[stringInterval]!=undefined) {
				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js clearInterAttackUpdate clearInterval1 stringInterval,DictTimeInterval[stringInterval]',[stringInterval,DictTimeInterval[stringInterval]]);
				clearInterval(DictTimeInterval[stringInterval]);			
				delete DictTimeInterval[stringInterval];
				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js clearInterAttackUpdate clearInterval2 stringInterval,DictTimeInterval[stringInterval]',[stringInterval,DictTimeInterval[stringInterval]]);									
			}
			client.hdel(stringHAttack,ID_User_Defend);
			resolve();
		})
	})

}

function updateRedis(stringHkey,stringUnit,data) {
	functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js updateRedis stringHkey,stringUnit,data]',[stringHkey,stringUnit,data]);
	client.hset(stringHkey,stringUnit,JSON.stringify(data));
}

exports.SetListAttackData = function setListAttackData2(io,Server_ID,stringKeyDefend,listStringKeyAttack,listCurrentAttack){
	setListAttackData (io,Server_ID,stringKeyDefend,listStringKeyAttack,listCurrentAttack)
}
function setListAttackData (io,Server_ID,stringKeyDefend,listStringKeyAttack,listCurrentAttack) {
	
	functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js setListAttackData Server_ID,stringKeyDefend,listStringKeyAttack,listCurrentAttack]',[Server_ID,stringKeyDefend,listStringKeyAttack,listCurrentAttack]);
	stringHUnit = "s"+Server_ID+"_unit";
	stringHAttack = "s"+Server_ID+"_attack";
	var defendAliveBool = false;
	var attackAliveBool = false;
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
				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js setListAttackData hset stringHUnit,stringKeyDefend,result]',[stringHUnit,stringKeyDefend]); 
				client.hset(stringHUnit,stringKeyDefend,JSON.stringify(result));
			}else{
				// functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js setListAttackData clearInterAttackUpdate stringKeyDefend]',[stringKeyDefend]); 
				clearInterAttackUpdate(io,stringKeyDefend);
				return null;
			}
			resolve();
		})
	}).then(()=>{
		return new Promise((resolve,reject)=>{
			functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js setListAttackData currentAttack,listStringKeyAttack]',[currentAttack,listStringKeyAttack]); 
			if (currentAttack.length>0&&listStringKeyAttack.length>0) {
				listClearUnit = compareArray (currentAttack,listStringKeyAttack);				
				if (listClearUnit.length>0) {
					functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js setListAttackData listClearUnit',[listClearUnit]); 
					updateClearUnit (Server_ID,listClearUnit,stringKeyDefend);
				}
			}

			resolve();
		})

	}).then(()=>{

		return new Promise((resolve,reject)=>{
			var stringListAttack="";
			if (listStringKeyAttack.length>0) {
				for (var i = 0; i < listStringKeyAttack.length; i++) {
					stringListAttack = stringListAttack + listStringKeyAttack[i]+"/";
				}
				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js setListAttackData hset stringHAttack,stringKeyDefend,stringListAttack',[stringHAttack,stringKeyDefend,stringListAttack]); 

				client.hset(stringHAttack,stringKeyDefend,stringListAttack,function (error) {
					resolve();
				});
			}else{
				// functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js setListAttackData clearInterAttackUpdate hset stringKeyDefend',[stringKeyDefend]); 
				clearInterAttackUpdate(io,stringKeyDefend);
				console.log('AttackFunc.js setListAttackData listStringKeyAttack empty');
				return null;
			}
		})

	}).then(()=>{

		return new Promise((resolve,reject)=>{
			attackInterval(io,Server_ID,stringKeyDefend);
			resolve();
		})	

	}).then(()=>{
		listStringKeyAttack.forEach(function (unit){
			new Promise((resolve,reject)=>{
				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js setListAttackData UpdateData hget stringHUnit,unit',[stringHUnit,unit]); 
				client.hget(stringHUnit,unit,function (error,rows) {
					if (rows!=null) {
						var result = JSON.parse(rows);
						result.Attack_Unit_ID = stringKeyDefend;
						result.Status = functions.UnitStatus.Attack_Unit;
						client.hset(stringHUnit,unit,JSON.stringify(result),function (error) {
							resolve();
						})
					}
				})
			}).then(()=>{
				return new Promise((resolve,reject)=>{
					var stringUpdate = "UPDATE `s"+Server_ID+"_unit` SET `Attack_Unit_ID` ='"+stringKeyDefend+"', `Status`='"+functions.UnitStatus.Attack_Unit+"' WHERE `ID`='"+unit.split("_")[3]+"'";
					db_position.query(stringUpdate,function (error,result) {
						if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'AttackFunc.js setListAttackData UpdateData stringUpdate',[stringUpdate]);}
						resolve();
					})
				})
			})
		})


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
	functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js compareArray uniqueArray',[uniqueArray]);
	return uniqueArray;
}

function updateClearUnit (Server_ID,listUnit,stringKeyDefend) {
	stringHUnit = "s"+Server_ID+"_unit";
	stringHAttack = "s"+Server_ID+"_attack";

	functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js updateClearUnit Server_ID,listUnit,stringKeyDefend',[Server_ID,listUnit,stringKeyDefend]);
	listUnit.forEach(function (unit) {
		new Promise((resolve,reject)=>{
			functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js updateClearUnit hget stringHUnit,unit',[stringHUnit,unit]);
			client.hget(stringHUnit,unit,function (error,rows) {
				if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'AttackFunc.js updateClearUnit hget stringHUnit,unit',[stringHUnit,unit]);}
				if (rows!=null) {
					var result = JSON.parse(rows);					
					result.Attack_Unit_ID = null;
					result.Status = functions.UnitStatus.Standby;
					functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js updateClearUnit hset result',[result]);
					client.hset(stringHUnit,unit,JSON.stringify(result))	
				}
				resolve();
			})
		}).then(()=>{
			return new Promise((resolve,reject)=>{
				var stringUpdate = "UPDATE `s"+server_ID+"_unit` SET `Attack_Unit_ID` = NULL, `Status`='"+functions.UnitStatus.Standby+"' WHERE `ID`='"+unit.split("_")[3]+"'";
				db_position.query(stringUpdate,function (error,result) {
					if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'AttackFunc.js updateClearUnit stringUpdate',[stringUpdate]);}
					resolve();
				});	

			})
		})
	})

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

exports.CheckMovePos = function (io,data,stringKey) {
	checkMovePos (io,data,stringKey)
}

function checkMovePos (io,data,stringKey) {
	functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js checkMovePos data,stringKey',[data,stringKey]);
	var posCheck = data.Position_Cell;
	var timeNext = 0, timeOut = 0;
	var Position_Cell_X,Position_Cell_Y,Next_Cell_X,Next_Cell_Y;
	var Server_ID = data.Server_ID;
	stringMoveAttack = "Moving_Attack_"+stringKey;

	functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js checkMovePos=>checkCurrentPos data,stringKey',[data,stringKey,posCheck,Server_ID]);
	checkCurrentPos (io,data,stringKey,posCheck,Server_ID);
	
	if (data.TimeMoveNextCell!=null) {
		Position_Cell_X = data.Position_Cell.toString().split(",")[0];
		Position_Cell_Y = data.Position_Cell.toString().split(",")[1];
		Next_Cell_X = data.Next_Cell.toString().split(",")[0];
		Next_Cell_Y = data.Next_Cell.toString().split(",")[1];
		var caseMove = functions.CaseMove.Straight;	

		if (Position_Cell_X!=Next_Cell_X&&Position_Cell_Y!=Next_Cell_Y) {caseMove = functions.CaseMove.Diagonal;}

		timeNext = functions.ExportTimeDatabase(data.TimeMoveNextCell) - functions.GetTime();

		switch (caseMove) {
			case functions.CaseMove.Straight:
			if (timeNext == functions.TimeMove.Straight) {
				// console.log('timeNext == functions.TimeMove.Straight');
				timeOut = functions.TimeMove.Straight*0.5;
			}else{
				// console.log('timeNext != functions.TimeMove.Straight');
				timeOut =  timeNext - (functions.TimeMove.Straight*0.5);
			}
			break;

			case functions.CaseMove.Diagonal:
			// console.log('functions.CaseMove.Diagonal');
			if (timeNext == functions.TimeMove.Diagonal) {
				// console.log('timeNext == functions.TimeMove.Diagonal');
				timeOut = functions.TimeMove.Diagonal*0.5;
			}else{
				// console.log('timeNext != functions.TimeMove.Diagonal');
				timeOut =  timeNext - (functions.TimeMove.Diagonal*0.5);
			}
			break;
		}
		if (timeOut<0) {console.log('AttackFunc.js checkMovePos Moving Attack timeOut<0');console.log(timeOut); return null;}

		functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js checkMovePos timeOut,data,stringKey,stringMoveAttack',[timeOut,data,stringKey,stringMoveAttack]);
		if (data.TimeMoveNextCell!=data.TimeFinishMove) {
			DictMoveAttack[stringMoveAttack]=setTimeout(function (io,data,stringKey) {
				var updateData = data;

				if (data.ListMove.length>0) {
					updateData.Position_Cell = data.Next_Cell;
					updateData.Next_Cell = data.ListMove[0].Next_Cell;
					updateData.TimeMoveNextCell = data.ListMove[0].TimeMoveNextCell;
					updateData.ListMove.shift();
				}else{
					updateData.Position_Cell = data.End_Cell;
					updateData.Next_Cell = null;
					updateData.TimeMoveNextCell = null;
					updateData.TimeFinishMove = null;
				}
				checkMovePos (io,updateData,stringKey);
			}, timeOut,io,data,stringKey);
		}
	}
}

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
			functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js checkCurrentPos listIDUnitAttack',[listIDUnitAttack]);
			if (listIDUnitAttack.length==0) {
				// attackFunc.ClearInterAttack(stringKey,functions.CaseClearAttack.Full);		
				clearInterAttackUpdate(io,stringKey);		
				return null;
			}
			resolve();
		})
	}).then(()=>{
		return new Promise((resolve,reject)=>{
			// console.log('listIDUnitAttack')
			// console.log(listIDUnitAttack);
			functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js checkCurrentPos friendData.CheckListFriendData listIDUnitAttack,stringKey',[listIDUnitAttack,stringKey]);
			friendData.CheckListFriendData(listIDUnitAttack,stringKey.split("_")[2],function (returnListUnit) {
				// console.log('returnListUnit')
				// console.log(returnListUnit);
				listIDUnitAttack = returnListUnit;
				resolve();
			})
		})
	}).then(()=>{
		return new Promise((resolve,reject)=>{

			functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js checkCurrentPos guildData.CheckListGuildData listIDUnitAttack,stringKey',[listIDUnitAttack,stringKey]);
			guildData.CheckListGuildData(listIDUnitAttack,stringKey.split("_")[2],function (returnListUnit) {
				listIDUnitAttack = returnListUnit;
				resolve();
			})
		})
	}).then(()=>{
		return new Promise((resolve,reject)=>{
			
			if (listIDUnitAttack.length==0) {
				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js checkCurrentPos listIDUnitAttack=0=>attackFunc.ClearInterAttackUpdate',[stringKey]);
				clearInterAttackUpdate(io,stringKey);
				return null;
			}else{
				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js checkCurrentPos hmget stringHUnit,listIDUnitAttack',[stringHUnit,listIDUnitAttack]);
				client.hmget(stringHUnit,listIDUnitAttack,function (error,rows) {
					if (rows!=null) {
						for (var i = 0; i < rows.length; i++) {
							if(rows[i]!=null){
								var unitResult = JSON.parse(rows[i]);
								var attackBool = false;
								
								if (unitResult.Status==6&&unitResult.Attack_Unit_ID==null) {
									attackBool = true;	
								}
								if (unitResult.Attack_Unit_ID==stringKey){
									attackBool = true;
								}
								if (unitResult.Status==6&&unitResult.Attack_Unit_ID=='null') {
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
						clearInterAttackUpdate(io,stringKey);
						return null;
					}
					resolve();
				})
			}
		})

	}).then(()=>{
		return new Promise((resolve,reject)=>{
			functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js checkCurrentPos hget stringHAttack,stringKey',[stringHAttack,stringKey]);
			client.hget(stringHAttack,stringKey,function (error,rows) {
				if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'AttackFunc.js checkCurrentPos hget stringHAttack,stringKey',[stringHAttack,stringKey]);}
				if (rows!=null) {
					listCurrentAttack = rows.split("/").filter(String);
				}
				resolve();
			})

		})
		
	}).then(()=>{
		return new Promise((resolve,reject)=>{

			if (listIDUnitAttack.length>0) {
				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js checkCurrentPos hget stringHAttack,stringKey',[stringHAttack,stringKey]);
				setListAttackData(io,Server_ID,stringKey,listIDUnitAttack,listCurrentAttack);
			}
			if(listIDUnitAttack.length==0&&listCurrentAttack.length==0){
				clearInterAttackUpdate(io,stringKey);
				return null;
			}
			resolve();
			
		})
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
	stringHAttack = "s"+Server_ID+"_attack";
	stringHUnit = "s"+Server_ID+"_unit";
	stringInterval = "Attacking_"+ID_Defend;

	if (DictTimeInterval[stringInterval]!=null) {
		
	}else{
		DictTimeInterval[stringInterval] = setInterval(function (stringHUnit,stringHAttack,io,Server_ID,ID_Defend) {
			var defendAliveBool = true;
			functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js attackInterval stringHUnit,stringHAttack,Server_ID,ID_Defend',[stringHUnit,stringHAttack,Server_ID,ID_Defend]);
			new Promise((resolve,reject)=>{
				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js attackInterval hget1 stringHUnit,ID_Defend',[stringHUnit,ID_Defend]);
				client.hget(stringHUnit,ID_Defend,function (error,rows) {
					if (rows==null) {
						defendAliveBool = false;
						functions.ShowLog(functions.ShowLogBool.Off,'AttackFunc.js attackInterval clearInterAttackUpdate1 ID_Defend',[ID_Defend]);
						clearInterAttackUpdate(io,ID_Defend);			
					}
					if (rows==undefined) {
						defendAliveBool = false;
						functions.ShowLog(functions.ShowLogBool.Off,'AttackFunc.js attackInterval clearInterAttackUpdate2 ID_Defend',[ID_Defend]);
						clearInterAttackUpdate(io,ID_Defend);
					}
					resolve();
				});
			}).then(()=>{

				return new Promise((resolve,reject)=>{
					if (defendAliveBool==true) {
						functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js attackInterval hget2 stringHAttack,ID_Defend',[stringHAttack,ID_Defend]);
						client.hget(stringHAttack,ID_Defend,function (error,rows) {	
							if (rows!=null) {
								var dataAttack = rows.split("/").filter(String);						
								if (dataAttack.length>0) {
									functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js attackInterval getAttackCalc Server_ID,dataAttack,ID_Defend',[Server_ID,dataAttack,ID_Defend]);
									getAttackCalc (io,Server_ID,dataAttack,ID_Defend);
								}
							}else {
								functions.ShowLog(functions.ShowLogBool.Off,'AttackFunc.js attackInterval clearInterAttackUpdate3 ID_Defend',[ID_Defend]);
								clearInterAttackUpdate(io,ID_Defend);
							}	
						});
					}
					resolve();
				})
			})

		}, 1000, stringHUnit,stringHAttack,io,Server_ID,ID_Defend);

	}
	
}

exports.ClearAttackUnit = function clearAttackUnit2 (io,ID_User_Attack) {
	functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js ClearAttackUnit ID_User_Attack',[ID_User_Attack]);
	
	var Server_ID = ID_User_Attack.split("_")[0]
	stringHUnit ="s"+Server_ID+"_unit";
	stringHAttack ="s"+Server_ID+"_attack";
	var ID_User_Defend;
	var stringReplace;
	
	var resultUnit={};
	new Promise((resolve,reject)=>{
		functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js ClearAttackUnit hget stringHUnit,ID_User_Attack',[stringHUnit,ID_User_Attack]);

		client.hget(stringHUnit,ID_User_Attack,function (error,rows) {
			if (rows!=null) {
				resultUnit = JSON.parse(rows)				
				ID_User_Defend = resultUnit.Attack_Unit_ID;
				stringInterval = "Attacking_"+ID_User_Defend;
			}
			resolve();
		})
	}).then(()=>{
		return new Promise((resolve,reject)=>{

			if (DictTimeInterval[stringInterval]!=undefined) {
				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js ClearAttackUnit hget stringHUnit,ID_User_Attack',[stringHUnit,ID_User_Attack]);
				client.hget(stringHAttack,ID_User_Defend, function (error,rows) {
					if (rows!=null) {

						var result = rows.split("/").filter(String);
						if (result.includes(ID_User_Attack)) {
							stringReplace = rows.replace(ID_User_Attack+"/","");
							functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js ClearAttackUnit hset stringReplace',[stringReplace]);
							client.hset(stringHAttack,ID_User_Defend,stringReplace)
							if (stringReplace.length==0) {
								clearInterval(DictTimeInterval[stringInterval]);			
								delete DictTimeInterval[stringInterval];
								client.hdel(stringHAttack,ID_User_Defend);
							}
						}
					}				
					resolve();
				})		
			}
		})
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

	functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js getAttackCalc server_ID,dataAttack,dataDefend',[server_ID,dataAttack,dataDefend]);
	
	new Promise((resolve,reject)=>{

		functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js getAttackCalc hget stringHUnit,ID_User_Attack',[stringHUnit,ID_User_Attack]);
		client.hget(stringHUnit,dataDefend,function (error,rows) {
			if (rows!=null) {
				def = JSON.parse(rows);
				if ((def.Attack_Unit_ID==null&&def.Status==functions.UnitStatus.Standby)||(def.Attack_Unit_ID=='null'&&def.Status==functions.UnitStatus.Standby)) {
					functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js getAttackCalc moving_Attack.CheckCurrentPos',[def,dataDefend,def.Position_Cell,server_ID]);
					moving_Attack.CheckCurrentPos(io,def,dataDefend,def.Position_Cell,server_ID);
				}
				defendAliveBool = true;
			}else{
				functions.ShowLog(functions.ShowLogBool.Off,'AttackFunc.js getAttackCalc clearInterAttackUpdate dataDefend',[dataDefend]);
				clearInterAttackUpdate(io,dataDefend)
			}	
			resolve();
		});

	}).then(()=>{
		return new Promise((resolve,reject)=>{
			functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js ClearAttackUnit hmget stringHUnit,dataAttack',[stringHUnit,dataAttack]);
			client.hmget(stringHUnit,dataAttack,function (error,rows){
				rowsUnit = rows;
				if (rows!=null) {					
					for (var i = 0; i < rows.length; i++) {
						if (rows[i]!=null&&defendAliveBool==true) {
							var result = JSON.parse(rows[i]);
							CounterMul[i] = checkCounter(result,def);
							Attack = Attack + (result.Attack * (result.Quality/def.Quality)*CounterMul[i]);
							checkSocketAttack (io,server_ID,dataAttack[i],result,dataDefend);
						}else {
							Attack = Attack + 0;
							if (dataDefend==null) {functions.ShowLog(functions.ShowLogBool.Error,'AttackFunc.js ClearAttackUnit removeRedisData dataDefend null',[dataDefend]);}
							else{
								functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js ClearAttackUnit removeRedisData dataDefend,dataAttack[i]',[dataDefend,dataAttack[i]]);
								removeRedisData (stringHAttack,dataDefend,dataAttack[i]);}							
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
						if (def.Quality <= 0) {
							def.Quality = 0;
							functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js ClearAttackUnit def.Quality=0',[def]);

							for (var i = 0; i < rows.length; i++) {
								if (rows[i]!=null) {						
									var resultAttack = JSON.parse(rows[i]);
									resultAttack.Status = 6;
									resultAttack.Attack_Unit_ID = null;
									var stringAttack = server_ID+"_"+resultAttack.ID_Unit+"_"+resultAttack.ID_User+"_"+resultAttack.ID;
									
									functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js ClearAttackUnit CheckCurrentPos def.Quality=0,resultAttack,stringAttack,resultAttack.Position_Cell,server_ID ',[def,resultAttack,stringAttack,resultAttack.Position_Cell,server_ID]);
									// if (resultAttack.Server_ID==undefined) {resultAttack.Server_ID = server_ID;}
									
									moving_Attack.CheckCurrentPos(io,resultAttack,stringAttack,resultAttack.Position_Cell,server_ID);
									client.hset(stringHUnit,stringAttack,JSON.stringify(resultAttack));
									checkAttackedUnit (io,server_ID,stringAttack)
								}
							}
							client.hdel(stringHAttack,dataDefend);
							client.hdel(stringHUnit,dataDefend);
							updateAttackData (io,dataAttack);
							updateRemoveDefendData (server_ID,dataDefend);
							
						}

					}

					def.Hea_cur = Number(def.Hea_cur);
					resolve();
				});

		});

	}).then(()=>{
		
		return new Promise((resolve,reject)=>{
			updateDataBaseQuality(server_ID,def);
			
			checkSocketClient (io,dataDefend,def);
			if (def.Quality > 0) {
				client.hset(stringHUnit,dataDefend,JSON.stringify(def));
			}else{			
				//remove pos khi chet
				positionRemove.PostionRemove(dataDefend);
				moving.ClearMoveTimeout(io,dataDefend,def)
				moving_Attack.ClearMovingAttack(dataDefend);
				// functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js ClearAttackUnit clearInterAttackUpdate dataDefend',[def,resultAttack,stringAttack,resultAttack.Position_Cell,server_ID]);
				clearInterAttackUpdate(io,dataDefend);
			}
			resolve();
		})

	}).then(()=>{
		
		return new Promise((resolve,reject)=>{
			if (QualityLost>0) {
				updateMight_Kill (QualityLost,dataAttack,dataDefend);
			}
			
			resolve();
		})

	})

}

function checkAttackedUnit (io,Server_ID,dataCheck) {

	// console.log("checkAttackedUnit: "+dataCheck)
	// var posArray = [];
	// var dataAttack = dataCheck;

	// var dataDefendArray = [];
	// var dataDefend;

	// var attackBool = false;
	// var attackDataBool = false;

	stringHUnit = "s"+Server_ID+"_unit";
	stringHAttack = "s"+Server_ID+"_attack";
	var attackedBool=false;
	functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js checkAttackedUnit stringHUnit,stringHAttack,dataCheck,',[stringHUnit,stringHAttack,dataCheck]);

	client.hget(stringHUnit,dataCheck,function (error,rows) {
		if (rows!=null) {
			var result = JSON.parse(rows);
			
			functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js checkAttackedUnit stringHUnit,dataCheck,',[stringHUnit,dataCheck]);
			checkAttackPosition(io,dataCheck,result.Position_Cell);
			
		}else{
			functions.ShowLog(functions.ShowLogBool.Error,'AttackFunc.js checkAttackedUnit dataCheck null',[dataCheck]);
			return null;
		}
	})
}


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

	client.hget(stringHAttack,stringUnit,function (error,rows) {
		if (rows!=null) {
			listUnitAttacking = rows.split("/").filter(String);
			getAttackedUnit(io,stringUnit,pos,listUnitAttacking,returnPosArray)
		}else {
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
		functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js getAttackedUnit hmget stringHUnit,listUnitAttacking',[stringHUnit,listUnitAttacking]);
		return new Promise((resolve,reject)=>{
			if (getAttackBool==true) {
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
				functions.ShowLog(functions.ShowLogBool.Off,'AttackFunc.js getUnitAttackInPos not found any unit',[]);
				clearInterAttackUpdate(io,stringUnit)
				return null;
			}
			resolve();
		})

	}).then(()=>{

		return new Promise((resolve,reject)=>{
			if (tempListUnitInPos.length==0) {console.log('tempListUnitInPos length 0');}
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

				if (getAttackBool == false) {
					
					return null;}
					resolve();
				})

		})

	}).then(()=>{
		
		return new Promise((resolve,reject)=>{
			if (getAttackBool==true) {
				setAttackData(Server_ID,defendingUnit,stringUnit);					
			}
			resolve();
		})

	}).then(()=>{
		return new Promise((resolve,reject)=>{
			if (getAttackBool==true) {
				attackInterval(io,Server_ID,defendingUnit);
				resolve();
			}
		})
	})

}

function updateRemoveDefendData (server_ID,stringDefend) {
	functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js updateRemoveDefendData server_ID,stringDefend',[server_ID,stringDefend]);
	stringHUnit ="s"+server_ID+"_unit";
	stringHAttack ="s"+server_ID+"_attack";
	var stringQuery ="SELECT `Attack_Unit_ID` FROM `s"+server_ID+"_unit` WHERE `ID` ='"+stringDefend.split("_")[3]+"'"
	db_position.query(stringQuery,function (error,rows) {
		if (!!error) {console.log('AttackFunc.js updateRemoveDefendData '+ stringQuery);}
		if (rows[0].Attack_Unit_ID!=null) {
			removeRedisData (stringHAttack,rows[0].Attack_Unit_ID,stringDefend);
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
// #begin: updateMight_Kill
function updateMight_Kill (QualityLost,dataAttack,dataDefend) {
	functions.ShowLog(functions.ShowLogBool.Off,'AttackFunc.js updateMight_Kill QualityLost,dataAttack,dataDefend',[QualityLost,dataAttack,dataDefend]);
	getInfo.UpdateMight_Kill(QualityLost,dataAttack,dataDefend);
}
// #end: updateMight_Kill

//#begin: updateAttackData
function updateAttackData (io,data) {
	functions.ShowLog(functions.ShowLogBool.Off,'AttackFunc.js updateAttackData data',[data]);
	for (var i = 0; i < data.length; i++) {
		checkDataAttack (io,data[i])
	}
}
function checkDataAttack (io,dataCheck) {
	var stringHUnit;
	functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js checkDataAttack dataCheck',[dataCheck]);
	
	for (var i = 0; i < dataCheck.length; i++) {
		var stringUpdate,stringQuery;
		stringHUnit = "s"+dataCheck[i].toString().split("_")[3]+"_unit"
		stringQuery = "SELECT * FROM `s"+dataCheck.toString().split("_")[0]+"_unit` WHERE "+
		"`ID`='"+dataCheck[i].toString().split("_")[3]+"'";

		functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js checkDataAttack dataCheck',[dataCheck]);
		db_position.query(stringQuery,function(error,rows){
			if (!!error) {functions.ShowLog(functions.ShowLogBool.Error,'AttackFunc.js checkDataAttack stringQuery',[stringQuery]);}

			if (rows!=null) {
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

exports.CheckAttackedUnit = function (io,Server_ID,dataCheck) {
	checkAttackedUnit (io,Server_ID,dataCheck);
}

// checkAttackedUnit (null,1,'1_16_43_113')

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