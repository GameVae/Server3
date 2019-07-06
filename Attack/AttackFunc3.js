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

exports.SetListAttackData = function setListAttackData2 (io,Server_ID,stringKeyDefend,listStringKeyAttack,listCurrentAttack) {
	// console.log('Server_ID,stringKeyDefend,listStringKeyAttack')
	// console.log(Server_ID,stringKeyDefend,listStringKeyAttack)
	stringHUnit = "s"+Server_ID+"_unit";
	stringHAttack = "s"+Server_ID+"_attack";
	var defendAliveBool = false;
	var attackAliveBool = false;
	var currentAttack = listCurrentAttack;
	var listClearUnit = [];
	new Promise((resolve,reject)=>{
		hgetConsole ('SetListAttackData,stringHUnit,stringKeyDefend',stringHUnit,stringKeyDefend);	
		client.hget(stringHUnit,stringKeyDefend,function (error,rows) {
			if (rows!=null) {
				defendAliveBool = true;
				var result = JSON.parse(rows);
				result.AttackedBool = 1; 
				client.hset(stringHUnit,stringKeyDefend,JSON.stringify(result));
			}else{
				// clearInterAttack(stringKeyDefend,functions.CaseClearAttack.Full);
				clearInterAttackUpdate(io,stringKeyDefend);
				return null;
			}
			resolve();
		})
	}).then(()=>{
		return new Promise((resolve,reject)=>{
			// console.log('currentAttack')
			// console.log(currentAttack)
			// console.log('listStringKeyAttack')
			// console.log(listStringKeyAttack)
			if (currentAttack.length>0&&listStringKeyAttack.length>0) {
				listClearUnit = compareArray (currentAttack,listStringKeyAttack);
				console.log('listClearUnit')
				console.log(listClearUnit)
				if (listClearUnit.length>0) {
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
				// console.log('stringListAttack')
				// console.log(stringListAttack)
				hgetConsole ('SetListAttackData,stringHAttack,stringKeyDefend',stringHAttack,stringKeyDefend);	
				client.hset(stringHAttack,stringKeyDefend,stringListAttack,function (error) {
					resolve();
				});
			}else{
				// clearInterAttack(stringKeyDefend,functions.CaseClearAttack.Full);
				clearInterAttackUpdate(io,stringKeyDefend);
				console.log('AttackFunc.js setListAttackData listStringKeyAttack empty');
				reject();
				return null;
			}
		})

	}).then(()=>{
		
		return new Promise((resolve,reject)=>{
			attackInterval(io,Server_ID,stringKeyDefend);
			resolve();
		})	

	}).then(()=>{

		listStringKeyAttack.forEach(function (unit) {
			new Promise((resolve,reject)=>{
				hgetConsole ('SetListAttackData,stringHUnit,unit',stringHUnit,unit);	
				client.hget(stringHUnit,unit,function (error,rows) {
					if (rows!=null) {
						var result = JSON.parse(rows);
						result.Attack_Unit_ID = stringKeyDefend;
						result.Status = functions.UnitStatus.Attack_Unit;
						client.hset(stringHUnit,unit,JSON.stringify(result),function (error) {
							resolve();
						})
					}else{
						return null;
					}
				})
			}).then(()=>{
				return new Promise((resolve,reject)=>{
					var stringUpdate = "UPDATE `s"+Server_ID+"_unit` SET `Attack_Unit_ID` ='"+stringKeyDefend+"', `Status`='"+functions.UnitStatus.Attack_Unit+"' WHERE `ID`='"+unit.split("_")[3]+"'";
					db_position.query(stringUpdate,function (error,result) {
						if (!!error) {console.log('AttackFunc.js updateData '+ stringUpdate);}
						resolve();
					})
				})
			})

			// new Promise((resolve,reject)=>{
			// 	hgetConsole (SetListAttackData,'stringHUnit,unit',stringHUnit,unit);	
			// 	client.hget(stringHUnit,unit,function (error,rows) {
			// 		if (rows!=null) {
			// 			var result = JSON.parse(rows);
			// 			result.Attack_Unit_ID = stringKeyDefend;
			// 			result.Status = functions.UnitStatus.Attack_Unit;
			// 			client.hset(stringHUnit,unit,JSON.stringify(result),function (error) {
			// 				resolve();
			// 			})
			// 		}else{
			// 			return null;
			// 		}
			// 	})

			// }).then(()=>new Promise((resolve,reject)=>{
			// 	var stringUpdate = "UPDATE `s"+Server_ID+"_unit` SET `Attack_Unit_ID` ='"+stringKeyDefend+"', `Status`='"+functions.UnitStatus.Attack_Unit+"' WHERE `ID`='"+unit.split("_")[3]+"'";
			// 	db_position.query(stringUpdate,function (error,result) {
			// 		if (!!error) {console.log('AttackFunc.js updateData '+ stringUpdate);}
			// 		resolve();
			// 	})
			// }))

		})

	})

}
function compareArray (arrayOldPos,arrayNewPos) {
	var finalArray = [];
	arrayOldPos.forEach( function(unit,index) {
		if(!arrayNewPos.includes(arrayOldPos[index])){
			finalArray.push(arrayOldPos[index]);
		}
	});	
	var uniqueArray = finalArray.filter(function(item, pos) {
		return finalArray.indexOf(item) == pos;
	})
	return uniqueArray;
}
function updateClearUnit (Server_ID,listUnit,stringKeyDefend) {
	stringHUnit = "s"+Server_ID+"_unit";
	stringHAttack = "s"+Server_ID+"_attack";

	listUnit.forEach(function (unit) {
		new Promise((resolve,reject)=>{
			hgetConsole ('updateClearUnit,stringHUnit,unit',stringHUnit,unit);	
			client.hget(stringHUnit,unit,function (error,rows) {
				if (rows!=null) {
					var result = JSON.parse(rows);					
					result.Attack_Unit_ID = null;
					result.Status = functions.UnitStatus.Standby;
					client.hset(stringHUnit,unit,JSON.stringify(result))	
				}
				resolve();
			})
		}).then(()=>{
			return new Promise((resolve,reject)=>{
				var stringUpdate = "UPDATE `s"+server_ID+"_unit` SET `Attack_Unit_ID` = NULL, `Status`='"+functions.UnitStatus.Standby+"' WHERE `ID`='"+unit.split("_")[3]+"'";
				db_position.query(stringUpdate,function (error,result) {
					if (!!error) {console.log('AttackFunc.js updateClearUnit'+error);}	
					resolve();
				});	

			})
		})
	})

}
function updateRedisData (stringKeyDefend) {
	Server_ID = stringKey.split("_")[0];
	stringHUnit = "s"+Server_ID+"_unit";
	stringHAttack = "s"+Server_ID+"_attack";

	var arrayUnitAttack = [];
	hgetConsole (updateRedisData,'stringHAttack,stringKey',stringHAttack,stringKey);	
	client.hget(stringHAttack,stringKey,function (error,rows) {
		if (rows!=null) {
			arrayUnitAttack = rows.split("/").filter(String);
			if (arrayUnitAttack.length>0) {
				listStringKeyAttack.forEach(function (unit) {
					hgetConsole ('updateRedisData,stringHUnit,unit',stringHUnit,unit);	
					client.hget(stringHUnit,unit,function (error,rowsUnit) {
						if (rowsUnit!=null) {
							var result = JSON.parse(rowsUnit);
							result.Attack_Unit_ID = null;
							result.Status = functions.Status.Standby;
							client.hset(stringHUnit,unit,JSON.stringify(result))
						}
					})
				})
			}
		}
	})
}

exports.SetAttackData = function setAttackData2(Server_ID,stringKeyDefend,stringKeyAttack) {
	// console.log(Server_ID,stringKeyDefend,stringKeyAttack)
	setAttackData(Server_ID,stringKeyDefend,stringKeyAttack);
}

function setAttackData (Server_ID,ID_Defend,ID_Attack) {
	stringHAttack = "s"+Server_ID+"_attack";
	stringHUnit = "s"+Server_ID+"_unit";
	// console.log(Server_ID,ID_Defend,ID_Attack)
	var defendAliveBool = false;
	var attackAliveBool = false;
	new Promise((resolve,reject)=>{
		hgetConsole ('setAttackData,stringHUnit,ID_Defend',stringHUnit,ID_Defend);	
		client.hget(stringHUnit,ID_Defend,function (error,rows){
			if (rows!=null) {
				defendAliveBool = true;
				var result = JSON.parse(rows);
				result.AttackedBool = 1; 
				client.hset(stringHUnit,ID_Defend,JSON.stringify(result));
			}
			resolve();
		})
	}).then(()=>new Promise((resolve,reject)=>{
		hgetConsole ('setAttackData,stringHAttack,ID_Defend',stringHAttack,ID_Defend);	
		client.hget(stringHAttack,ID_Defend,function (error,result){
			if (defendAliveBool==true) {
				if (result!=null) {
					var resultID = result.split("/").filter(String)
					// console.log("resultID: "+resultID);
					if (!resultID.includes(ID_Attack)) {
						addValue (stringHAttack,ID_Defend,result,ID_Attack);
					}
				}else {
					addValue (stringHAttack,ID_Defend,"",ID_Attack);
				}
			}
			resolve();
		})
	}).then(()=>new Promise((resolve,reject)=>{
		hgetConsole ('setAttackData,stringHUnit,ID_Attack',stringHUnit,ID_Attack);	
		client.hget(stringHUnit,ID_Attack,function (error,rows) {
			if (rows!=null) {
				attackAliveBool = true;
				var result = JSON.parse(rows);
				result.Attack_Unit_ID = ID_Defend;
				result.Status = functions.UnitStatus.Attack_Unit;

				client.hset(stringHUnit,ID_Attack,JSON.stringify(result))	
			}
			resolve();	
		});
	}).then(()=>new Promise((resolve,reject)=>{
		if (defendAliveBool==true&&attackAliveBool==true) {
			var stringUpdate = "UPDATE `s"+Server_ID+"_unit` SET `Status`='"+functions.UnitStatus.Attack_Unit+"',`Attack_Unit_ID` ='"+ID_Defend+"' WHERE `ID`='"+ID_Attack.split("_")[3]+"'; "+
			"UPDATE `s"+Server_ID+"_unit` SET`AttackedBool` = '1' WHERE `ID` = '"+ID_Defend.split("_")[3]+"'"
			db_position.query(stringUpdate,function (error,result) {
				if (!!error) {console.log('AttackFunc.js setAttackData '+stringUpdate);}
				resolve();
			});
		}
	}))
	)
	)	
}

function addValue (stringHkey,ID_Defend,data,ID_Attack) {
	client.hset(stringHkey,ID_Defend,data+ID_Attack+"/");
}
//#end: Set Data

//#begin: Attack Interval
exports.AttackInterval = function attackInterval2(io,Server_ID,stringKeyDefend) {
	attackInterval(io,Server_ID,stringKeyDefend);
}

function attackInterval (io,Server_ID,ID_User_Defend){
	stringHAttack = "s"+Server_ID+"_attack";
	stringHUnit = "s"+Server_ID+"_unit";
	stringInterval = "Attacking_"+ID_User_Defend;

	if (DictTimeInterval[stringInterval]!=undefined) {
		return null;
	}else{		
		DictTimeInterval[stringInterval] = setInterval(function (stringHUnit,stringHAttack,io,Server_ID,ID_User_Defend) {		
			hgetConsole ('AttackInterval,stringHUnit,ID_User_Defend',stringHUnit,ID_User_Defend);	
			client.hget(stringHUnit,ID_User_Defend,function (error,rows) {
				if (rows==null) {
					// clearInterAttack (ID_User_Defend,functions.CaseClearAttack.Full);
					clearInterAttackUpdate(io,ID_User_Defend);			
				}
				if (rows==undefined) {
					// clearInterAttack (ID_User_Defend,functions.CaseClearAttack.Full);
					clearInterAttackUpdate(io,ID_User_Defend);
					client.hdel(stringHAttack,ID_User_Defend,function (error) {
						if (!!error) {console.log('AttackFunc.js clear hdel '+ID_User_Defend)}
					});
				}
			});
			hgetConsole ('AttackInterval,stringHAttack,ID_User_Defend',stringHAttack,ID_User_Defend);	
			client.hget(stringHAttack,ID_User_Defend,function (error,rows) {	
				if (rows!=null) {
					var dataAttack = rows.split("/").filter(String);
					if ((ID_User_Defend!=null&&dataAttack!=null)||(ID_User_Defend!=null&&dataAttack.length>0)) {getAttackCalc (io,Server_ID,dataAttack,ID_User_Defend);}
					
				}else {
					clearInterAttackUpdate(io,ID_User_Defend);
					// clearInterAttack (ID_User_Defend,functions.CaseClearAttack.Full);
				}	
			});	

		}, 1000, stringHUnit,stringHAttack,io,Server_ID,ID_User_Defend);
	}
	
}

exports.ClearAttackUnit = function clearAttackUnit2 (io,ID_User_Attack) {
	var Server_ID = ID_User_Attack.split("_")[0]
	stringHUnit ="s"+Server_ID+"_unit";
	stringHAttack ="s"+Server_ID+"_attack";
	var ID_User_Defend;
	var stringReplace;

	var resultUnit={};
	new Promise((resolve,reject)=>{
		hgetConsole ('ClearAttackUnit,stringHUnit,ID_User_Attack',stringHUnit,ID_User_Attack);	
		client.hget(stringHUnit,ID_User_Attack,function (error,rows) {
			if (rows!=null) {
				resultUnit = JSON.parse(rows)
				// console.log('AttackFunc.js resultUnit')
				// console.log(resultUnit)
				ID_User_Defend = resultUnit.Attack_Unit_ID;
				stringInterval = "Attacking_"+ID_User_Defend;
			}
			resolve();
		})
	}).then(()=>{
		return new Promise((resolve,reject)=>{
			if (DictTimeInterval[stringInterval]!=undefined) {
				hgetConsole ('ClearAttackUnit,stringHAttack,ID_User_Defend',stringHAttack,ID_User_Defend);	
				client.hget(stringHAttack,ID_User_Defend, function (error,rows) {
					if (rows!=null) {

						var result = rows.split("/").filter(String);
						if (result.includes(ID_User_Attack)) {
							stringReplace = rows.replace(ID_User_Attack+"/","");
							// console.log('AttackFunc.js stringHAttack,ID_User_Defend,stringReplace');
							// console.log('stringHAttack,ID_User_Defend,stringReplace');
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
exports.ClearInterAttackUpdate = clearInterAttackUpdate;
function clearInterAttackUpdate (io,ID_User_Defend) {
	stringInterval = "Attacking_"+ID_User_Defend;
	var server_ID = ID_User_Defend.split("_")[0]
	stringHAttack ="s"+server_ID+"_attack";
	stringHUnit = "s"+server_ID+"_unit";
	var resultArrayUnit=[];
	var resultUnitInfo=[];

	new Promise((resolve,reject)=>{
		var stringUpdate = "UPDATE `s"+server_ID+"_unit` SET `Attack_Unit_ID` = NULL, `Status`='"+functions.UnitStatus.Standby+"' WHERE `Attack_Unit_ID`='"+ID_User_Defend+"'";
		db_position.query(stringUpdate,function (error,result) {
			if (!!error) {console.log('AttackFunc.js '+error);}	
			resolve();
		});		
	}).then(()=>{
		return new Promise((resolve,reject)=>{
			hgetConsole ('clearInterAttack,stringHAttack,ID_User_Defend',stringHAttack,ID_User_Defend);	
			client.hget(stringHAttack,ID_User_Defend, function (error,rows){
				if (rows!=null) {
					resultArrayUnit = rows.split("/").filter(String);
					resolve();
				}
			})
		})
	}).then(()=>{
		return new Promise((resolve,reject)=>{
			// console.log('ClearInterAttack resultArrayUnit')
			// console.log(resultArrayUnit)
			hgetConsole ('clearInterAttack,stringHUnit,resultArrayUnit',stringHUnit,resultArrayUnit);	
			client.hmget(stringHUnit,resultArrayUnit,function (error,resultUnitAttack){

				if (resultUnitAttack!=null) {
					resultUnitInfo = resultUnitAttack;
					for (var i = 0; i < resultUnitAttack.length; i++) {		
						if (resultUnitAttack[i]!=null) {
							var stringUnitResult =  JSON.parse(resultUnitAttack[i]);
							var unitID = resultArrayUnit[i];
							stringUnitResult.Attack_Unit_ID = null;
							// console.log('ClearInterAttack stringUnitResult.Attack_Unit_ID')
							// console.log(stringUnitResult.Attack_Unit_ID);
							stringUnitResult.Status = functions.UnitStatus.Standby;	
							updateClearIntervalRedis (stringHUnit,unitID,stringUnitResult);								
						}
						if (i == (resultUnitAttack.length-1)) {
							resolve();
						}					
					}					
				}else{
					return null;
				}					
			})
		})
	}).then(()=>{
		return new Promise((resolve,reject)=>{
			if (DictTimeInterval[stringInterval]!=undefined) {
				clearInterval(DictTimeInterval[stringInterval]);			
				delete DictTimeInterval[stringInterval];
				client.hdel(stringHAttack,ID_User_Defend);
				resolve();				
			}
		})
	})

}

exports.ClearInterAttack = clearInterAttack;
function clearInterAttack (ID_User_Defend,caseClearAttack) {
	stringInterval = "Attacking_"+ID_User_Defend;
	var server_ID = ID_User_Defend.split("_")[0]
	stringHAttack ="s"+server_ID+"_attack";
	stringHUnit = "s"+server_ID+"_unit";
	var resultArrayUnit=[];

	new Promise((resolve,reject)=>{
		var stringUpdate = "UPDATE `s"+server_ID+"_unit` SET `Attack_Unit_ID` = NULL, `Status`='"+functions.UnitStatus.Standby+"' WHERE `Attack_Unit_ID`='"+ID_User_Defend+"'";
		db_position.query(stringUpdate,function (error,result) {
			if (!!error) {console.log('AttackFunc.js '+error);}	
			resolve();
		});		
	}).then(()=>{
		return new Promise((resolve,reject)=>{
			hgetConsole ('clearInterAttack,stringHAttack,ID_User_Defend',stringHAttack,ID_User_Defend);	
			client.hget(stringHAttack,ID_User_Defend, function (error,rows){
				if (rows!=null) {
					resultArrayUnit = rows.split("/").filter(String);
					resolve();
				}
			})
		})
	}).then(()=>{
		return new Promise((resolve,reject)=>{
			// console.log('ClearInterAttack resultArrayUnit')
			// console.log(resultArrayUnit)
			hgetConsole ('clearInterAttack,stringHUnit,resultArrayUnit',stringHUnit,resultArrayUnit);	
			client.hmget(stringHUnit,resultArrayUnit,function (error,resultUnitAttack){
				if (resultUnitAttack!=null) {
					for (var i = 0; i < resultUnitAttack.length; i++) {		
						if (resultUnitAttack[i]!=null) {
							var stringUnitResult =  JSON.parse(resultUnitAttack[i]);
							var unitID = resultArrayUnit[i];
							stringUnitResult.Attack_Unit_ID = null;
							// console.log('ClearInterAttack stringUnitResult.Attack_Unit_ID')
							// console.log(stringUnitResult.Attack_Unit_ID);
							stringUnitResult.Status = functions.UnitStatus.Standby;	
							updateClearIntervalRedis (stringHUnit,unitID,stringUnitResult);	
							if (i == (resultUnitAttack.length-1)) {
								resolve();
							}
						}						
					}
					
				}						
			})
		})
	}).then(()=>{
		return new Promise((resolve,reject)=>{
			if (DictTimeInterval[stringInterval]!=undefined) {
				clearInterval(DictTimeInterval[stringInterval]);			
				delete DictTimeInterval[stringInterval];
				client.hdel(stringHAttack,ID_User_Defend);
				resolve();				
			}
		})
	})

}

function updateClearIntervalRedis (stringHkey,stringUnit,data) {
	client.hset(stringHkey,stringUnit,JSON.stringify(data));
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
	// console.log(dataAttack,dataDefend)
	new Promise((resolve,reject)=>{

		hgetConsole ('getAttackCalc,stringHUnit,dataDefend',stringHUnit,dataDefend);
		client.hget(stringHUnit,dataDefend,function (error,rows) {
			if (rows!=null) {
				def = JSON.parse(rows);
				if (def.Attack_Unit_ID==null||def.Attack_Unit_ID=='null') {
					checkAttackPosition(io,dataDefend,def.Position_Cell);
				}
				defendAliveBool = true;
			}else{
				return null;
			}		
			resolve();
		});

	}).then(()=>{
		return new Promise((resolve,reject)=>{
			hgetConsole ('getAttackCalc,stringHUnit,dataAttack',stringHUnit,dataAttack);
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
							if (dataDefend==null) {console.log('getAttackCalc dataDefend==null');}
							else{
								hgetConsole ('removeRedisData,dataDefend,dataAttack[i]',dataDefend,dataAttack[i]);
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

							client.hdel(stringHAttack,dataDefend);
							client.hdel(stringHUnit,dataDefend);
							updateAttackData (io,dataAttack);
							updateDefendData (server_ID,dataDefend);

							clearInterAttackUpdate(io,dataDefend);

							for (var i = 0; i < rows.length; i++) {
								if (rows[i]!=null) {						
									var resultAttack = JSON.parse(rows[i]);
									resultAttack.Status = 6;
									resultAttack.Attack_Unit_ID = null;
									var stringAttack = server_ID+"_"+resultAttack.ID_Unit+"_"+resultAttack.ID_User+"_"+resultAttack.ID;
									
									checkAttackPosition(io,stringAttack,resultAttack.Position_Cell);
									
									client.hset(stringHUnit,stringAttack,JSON.stringify(resultAttack));
									
								}
							}

						}
					}
					def.Hea_cur = Number(def.Hea_cur);
					resolve();
				});

		});

	}).then(()=>{
		
		return new Promise((resolve,reject)=>{
			updateDataBaseQuality(server_ID,def);
			// updateAttackData (io,dataAttack);
			// updateDefendData (server_ID,dataDefend);
			// console.log(dataDefend,def);
			checkSocketClient (io,dataDefend,def);
			if (def.Quality > 0) {
				client.hset(stringHUnit,dataDefend,JSON.stringify(def));
			}else{			
				//remove pos khi chet
				positionRemove.PostionRemove(dataDefend);
				moving.ClearMoveTimeout(dataDefend);
				moving_Attack.ClearMovingAttack(dataDefend);
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
	client.hget(stringHUnit,dataCheck,function (error,rows) {
		if (rows!=null) {
			var result = JSON.parse(rows);
			console.log(result)
			if (result.Attack_Unit_ID==null||
				result.Attack_Unit_ID=='null') {
				checkAttackPosition(io,dataCheck,result.Position_Cell)
		}
	}
})
}


exports.CheckAttackPosition = checkAttackPosition;
function checkAttackPosition (io,stringUnit,pos) {
	console.log('stringUnit,pos')
	console.log(stringUnit,pos)

	// var unitAttack = stringUnit;
	var arrayUnitInPos = [], tempListUnitInPos = [], listUnitAttacking = [];

	var Server_ID = stringUnit.split("_")[0];
	var ID_User = stringUnit.split("_")[2];

	var getAttackBool = false;
	var defendingUnit;

	stringHUnit = "s"+Server_ID+"_unit"
	stringHAttack = "s"+Server_ID+"_attack";
	stringHPos = "s"+Server_ID+"_pos";

	var returnPosArray = positionCheckPos.CheckPostion(stringUnit,pos);


	hgetConsole ('checkAttackPosition,stringHAttack,stringUnit',stringHAttack,stringUnit);
	client.hget(stringHAttack,stringUnit,function (error,rows) {
		// console.log('checkAttackPosition rows')
		// console.log(rows)
		if (rows!=null) {
			listUnitAttacking = rows.split("/").filter(String);
			getAttackedUnit(io,stringUnit,pos,listUnitAttacking,returnPosArray)
		}else {

			getUnitAttackInPos(io,stringUnit,pos,returnPosArray)
		}

	})

}

function getAttackedUnit(io,stringUnit,pos,listUnitAttacking,returnPosArray) {
	var Server_ID = stringUnit.split("_")[0];
	var ID_User = stringUnit.split("_")[2];

	var getAttackBool = false;
	var defendingUnit;

	stringHPos = "s"+Server_ID+"_pos";
	stringHUnit = "s"+Server_ID+"_unit";
	stringHAttack = "s"+Server_ID+"_attack";

	new Promise((resolve,reject)=>{
		hgetConsole ('getAttackedUnit,stringHUnit,listUnitAttacking',stringHUnit,listUnitAttacking);
		
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
		
		return new Promise((resolve,reject)=>{
			if (getAttackBool==true) {
				setAttackData(Server_ID,defendingUnit,stringUnit);
			}
			else {
				getUnitAttackInPos(io,stringUnit,pos,returnPosArray);
			}
			resolve();
		})

	}).then(()=>{
		
		return new Promise((resolve,reject)=>{
			if (getAttackBool==true) {
				attackInterval(io,Server_ID,defendingUnit);	
			}else{
				return null;
			}
			resolve();
		})

	})
}

function getUnitAttackInPos (io,stringUnit,pos,returnPosArray) {
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
		
		console.log('getUnitAttackInPos stringHPos,pos')
		console.log(stringHPos,pos)

		hgetConsole ('getUnitAttackInPos,stringHPos,pos',stringHPos,pos);
		client.hget(stringHPos,pos,function (error,rows){
			if (rows!=null) {
				arrayUnitInPos = rows.split("/").filter(String);
				for (var i = 0; i < arrayUnitInPos.length; i++) {
					if (arrayUnitInPos[i].split("_")[2] != ID_User) {
						tempListUnitInPos.push(arrayUnitInPos[i]);
					}
				}
			}else{
				return null;
			}
			resolve();
		})

	}).then(()=>{

		return new Promise((resolve,reject)=>{
			if (tempListUnitInPos.length==0) {console.log('tempListUnitInPos length 0');}
			hgetConsole ('getUnitAttackInPos,stringHUnit,tempListUnitInPos',stringHUnit,tempListUnitInPos);
			client.hmget(stringHUnit,tempListUnitInPos,function (error,rowsUnit) {
				// console.log('here rowsUnit')
				// console.log(rowsUnit)
				if (rowsUnit!=null) {
					for (var i = 0; i < rowsUnit.length; i++) {
						if (rowsUnit[i]!=null) {
							var resultUnitAttack = JSON.parse(rowsUnit[i])
							if (returnPosArray.includes(resultUnitAttack.Position_Cell)) {
								getAttackBool= true;
								defendingUnit = tempListUnitInPos[i];
								break;
							}
						}
					}
				}
				if (getAttackBool ==false) {return null;}
				resolve();
			})

		})

	}).then(()=>{
		
		return new Promise((resolve,reject)=>{
			if (getAttackBool==true) {
				setAttackData(Server_ID,defendingUnit,stringUnit);					
			}else{
				return null;
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

function updateDefendData (server_ID,stringDefend) {
	// console.log('updateDefendData')
	// console.log(stringDefend)
	stringHUnit ="s"+server_ID+"_unit";
	stringHAttack ="s"+server_ID+"_attack";
	var stringQuery ="SELECT `Attack_Unit_ID` FROM `s"+server_ID+"_unit` WHERE `ID` ='"+stringDefend.split("_")[3]+"'"
	db_position.query(stringQuery,function (error,rows) {
		if (!!error) {console.log('AttackFunc.js updateDefendData '+ stringQuery);}
		if (rows[0]!=undefined) {
			if (stringDefend==null) {console.log('updateDefendData stringDefend');}
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
	db_position.query(stringUpdate,function (error,result) {
		if (!!error) {console.log(error);}
	});
}

// #Begin: checkCounter
function checkCounter (dataAtt,dataDef) {
	var counterAB=1;
	// console.log(dataAtt,dataDef)
	if (dataAtt==null) {return 0;}
	else {
		var unitA = returnCaseUnit (dataAtt.ID_Unit);
		var unitB = returnCaseUnit (dataDef.ID_Unit);

		if (unitA==1 && unitB == 3) {counterAB = counter;}
		else if (unitA==3 && unitB == 2) {counterAB = counter;}
		else if (unitA==2 && unitB == 1) {counterAB = counter;}

		else if (unitA==3 && unitB == 1) {counterAB = parseFloat(1/counter).toFixed(2);}
		else if (unitA==2 && unitB == 3) {counterAB = parseFloat(1/counter).toFixed(2);}
		else if (unitA==1 && unitB == 2) {counterAB = parseFloat(1/counter).toFixed(2);}

		return counterAB;	
	}
}
function returnCaseUnit (dataUnit) {
	var returnCase=0;
	if (dataUnit>15&&dataUnit<20) {returnCase=1;}
	else if (dataUnit>20&&dataUnit<25) {returnCase=2;}
	else if (dataUnit>25&&dataUnit<30) {returnCase=3;}
	else {returnCase = 4;}
	return returnCase;
}
// #end: checkCounter
function checkSocketClient (io,dataDefend,def) {
	var Server_ID = dataDefend.split("_")[0]
	var stringHSocket = "s"+Server_ID+"_socket";
	client.hvals(stringHSocket,function (error,rowsSocket) {	
		for (var i = 0; i < rowsSocket.length; i++) {
			sendToClient (io,rowsSocket[i],def);
		}
	});
}
function checkSocketAttack (io,Server_ID,dataAttack,att,dataDefend) {
	
	var stringHSocket = "s"+Server_ID+"_socket";
	client.hvals(stringHSocket,function (error,rowsSocket) {	
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
	io.to(socketID).emit('R_ATTACK',{R_ATTACK:dataSend});
}
//#end: Attack Interval
// #begin: updateMight_Kill
function updateMight_Kill (QualityLost,dataAttack,dataDefend) {
	getInfo.UpdateMight_Kill(QualityLost,dataAttack,dataDefend);
}
// #end: updateMight_Kill

//#begin: updateAttackData
function updateAttackData (io,data) {
	for (var i = 0; i < data.length; i++) {
		checkDataAttack (io,data[i])
	}
}
function checkDataAttack (io,dataCheck) {
	var stringUpdate,stringQuery;
	// var stringHUnit = "s1_unit"
	stringQuery = "SELECT * FROM `s"+dataCheck.toString().split("_")[0]+"_unit` WHERE "+
	"`ID`='"+dataCheck.toString().split("_")[3]+"'";

	db_position.query(stringQuery,function(error,rows){
		if (!!error) {console.log(error);}
		// console.log(rows[0])
		if (rows!=null) {
			if (rows[0].Status!=functions.UnitStatus.Base){

				if (rows[0].AttackedBool!=1) {
					stringUpdate = "UPDATE `s"+dataCheck.toString().split("_")[0]+"_unit` SET "
					+"`Status`='"+functions.UnitStatus.Standby
					+"',`Attack_Unit_ID`= NULL"
					+" WHERE `ID`='"+dataCheck.toString().split("_")[3]+"'";
					hgetConsole ('checkDataAttack,stringHUnit,dataCheck1',stringHUnit,dataCheck);	
					client.hget(stringHUnit,dataCheck,function (error,rows) {
						if (!!error) {console.log(error);}
						var result = JSON.parse(rows);
						result.Status = functions.UnitStatus.Standby;
						result.Attack_Unit_ID = null;

						client.hset(stringHUnit,dataCheck,JSON.stringify(result));

					});
				}else{
					stringUpdate = "UPDATE `s"+dataCheck.toString().split("_")[0]+"_unit` SET "
					+"`Attack_Unit_ID`= NULL"
					+" WHERE `ID`='"+dataCheck.toString().split("_")[3]+"'";

					// checkAttackedUnit (io,dataCheck.toString().split("_")[0],dataCheck);
// 
					// checkAttackedUnit(rows[0],dataCheck);
				}
			}else {
				stringUpdate = "UPDATE `s"+dataCheck.toString().split("_")[0]+"_unit` SET "
				+"`Status`='"+functions.UnitStatus.Base
				+"',`Attack_Unit_ID`= NULL"
				+" WHERE `ID`='"+dataCheck.toString().split("_")[3]+"'";
				hgetConsole ('checkDataAttack,stringHUnit,dataCheck2',stringHUnit,dataCheck);	
				client.hget(stringHUnit,dataCheck,function (error,rows) {
					if (!!error) {console.log(error);}
					var result = JSON.parse(rows);
					result.Status = functions.UnitStatus.Base;
					result.Attack_Unit_ID = null;
					client.hset(stringHUnit,dataCheck,JSON.stringify(result));
				});			
			}
			// console.log(stringUpdate)
			db_position.query(stringUpdate,function(error,result){
				if (!!error) {console.log(error);}
			});

		}
	})
}
exports.CheckAttackedUnit = function checkAttackedUnit2 (io,Server_ID,dataCheck) {
	checkAttackedUnit (io,Server_ID,dataCheck);
}

// checkAttackedUnit (null,1,'1_16_43_113')


function updateDataBaseAttack (Server_ID,dataAttack,dataDefend) {
	// console.log(dataAttack,dataDefend)
	var ID = dataAttack.split("_")[3];
	var stringUpdate = "UPDATE `s"+Server_ID+"_unit` SET `Attack_Unit_ID` ='"+dataDefend+"', `Status`='"+functions.UnitStatus.Attack_Unit+"' WHERE `ID`='"+ID+"'"
	db_position.query(stringUpdate,function (error,result) {
		if (!!error) {console.log(error);}
	});
	hgetConsole ('updateDataBaseAttack,stringHUnit,dataAttack',stringHUnit,dataAttack);	
	client.hget(stringHUnit,dataAttack,function (error,rows) {
		var result = JSON.parse(rows)
		result.Attack_Unit_ID = dataDefend;
		client.hset(stringHUnit,dataAttack,JSON.stringify(result));
	});
}
// #end: updateAttackData
//#begin: removeRedisData

// xoa trong redis thoi khi di chuyen

exports.RemoveRedisData = function removeRedisData2 (stringHkey,stringKeyDefend,ID_Attack) {
	removeRedisData (stringHkey,stringKeyDefend,ID_Attack);
}
function removeRedisData (stringHkey,stringKeyDefend,ID_Attack) {
	// console.log(stringKeyDefend,ID_Attack);
	if (stringKeyDefend == null) {console.log('removeRedisData stringKeyDefend null');}
	else{
		hgetConsole ('removeRedisData,stringHkey,stringKeyDefend',stringHkey,stringKeyDefend);	
		client.hget(stringHkey,stringKeyDefend,function (error,rows) {				
			if (rows!=null) {
				var result = rows.split("/").filter(String);
				if (result.includes(ID_Attack)) {
					var stringReplace = rows.replace(ID_Attack+"/","");
					client.hset(stringHkey,stringKeyDefend,stringReplace);
					if (stringReplace.length==0) {
						client.hdel(stringHkey,stringKeyDefend);
					}
				}
			}
		})
	}

}
// #end: removeRedisData
function hgetConsole (stringParam,stringHKeyLog,stringKeyLog) {
	if (stringHKeyLog==null||stringKeyLog==null) {console.log(stringParam+"_"+stringHKeyLog+"_"+stringKeyLog);}	
}