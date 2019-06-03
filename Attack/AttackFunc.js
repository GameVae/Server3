'use strict';
var getInfo 				= require("./../Info/GetInfo.js");
var positionRemove 			= require('./../Redis/Position/Position_Remove.js'); 
// positionRemove.Test(5)
var move 					= require('./../Redis/Move/Move.js');
var moving_Attack 			= require('./../Unit/Moving_Attack.js');

var position_Check			= require('./../Redis/Position/Position_Check.js');

var db_position 			= require('./../Util/Database/Db_position.js');

var attackGetPos 			= require('./AttackGetPos.js');

var Promise 				= require('promise');

var functions 				= require('./../Util/Functions.js');

var redis 					= require("redis"),
client 						= redis.createClient();
client.select(functions.RedisData.TestUnit);

var counter = 1.2;

var stringHAttack, stringHUnit;
var DictTimeInterval={};

//#begin SetData
exports.SetAttackDataList = function setAttackDataList2(Server_ID,stringKeyDefend,listAttack) {
	// console.log(Server_ID,stringKeyDefend,stringKeyAttack)
	// console.log(listAttack.length)
	setAttackDataList(Server_ID,stringKeyDefend,listAttack);
}
function setAttackDataList (Server_ID,stringKeyDefend,listAttack) {
	stringHAttack = "s"+Server_ID+"_attack";
	stringHUnit = "s"+Server_ID+"_unit";
	// console.log(Server_ID,ID_Defend,ID_Attack)
	// for (var i = 0; i < listAttack.length; i++) {
	// 	console.log(listAttack[i])
	// 	setAttackData (Server_ID,ID_Defend,listAttack[i])
	// }
	// var length = 0;
	// while (length<listAttack.length) {
	// 	setAttackData(Server_ID,stringKeyDefend,listAttack[length]);
	// 	length++;
	// }
	listAttack.forEach(function (unit) {
		new Promise((resolve,reject)=>{
			setAttackData (Server_ID,stringKeyDefend,unit);
			resolve();
		})
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
	client.hexists(stringHAttack,ID_Defend,function (error,resultBool) {
		console.log(resultBool,ID_Defend,ID_Attack)
		if (resultBool==1) {
			client.hget(stringHAttack,ID_Defend,function (error,result) {
				var resultID = result.split("/").filter(String)
				// console.log("resultID: "+resultID);
				if (!resultID.includes(ID_Attack)) {
					addValue (stringHAttack,ID_Defend,result,ID_Attack);
				}
			});
		}else{
			addValue (stringHAttack,ID_Defend,"",ID_Attack);
		}
	})

	client.hget(stringHUnit,ID_Defend,function (error,rows) {
		var result = JSON.parse(rows)
		result.Attack_Unit_ID = ID_Attack;
		client.hset(stringHUnit,ID_Defend,JSON.stringify(result))		
	});

	var stringUpdate = "UPDATE `s"+Server_ID+"_unit` SET `Attack_Unit_ID` ='"+ID_Defend+"' WHERE `ID`='"+ID_Attack.split("_")[3]+"'; "+
	"UPDATE `s"+Server_ID+"_unit` SET`AttackedBool` = '1' WHERE `ID` = '"+ID_Defend.split("_")[3]+"'"
	db_position.query(stringUpdate,function (error,result) {
		if (!!error) {console.log('AttackFunc.js setAttackData '+stringUpdate);}
	})
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
	// console.log(ID_User_Defend)
	if (DictTimeInterval[ID_User_Defend]!=undefined) {
		client.hexists(stringHUnit,ID_User_Defend,function (error,rows) {
			if (rows==0) {
				clearIntervalAttack (ID_User_Defend);
			}	
		});

		client.hexists(stringHAttack,ID_User_Defend,function (error,rows) {
			if (rows==0) {
				clearIntervalAttack (ID_User_Defend);
				// new Promise((resolve,reject)=>{
				// 	//check position
				// })
				
			}
		}
		);
	}else {
		DictTimeInterval[ID_User_Defend] = setInterval(function (ID_User_Defend) {
			
			client.hexists(stringHUnit,ID_User_Defend,function (error,rows) {
				if (rows==0) {
					clearIntervalAttack (ID_User_Defend);					
				}
			});
			client.hexists(stringHAttack,ID_User_Defend,function (error,rows) {
				if (rows==0) {
					// new Promise((resolve,reject)=>{
					// 	//check position
					// })
					clearIntervalAttack (ID_User_Defend);
				}else{
					client.hget(stringHAttack,ID_User_Defend,function (error,rows) {			
						var dataAttack = rows.split("/").filter(String);
						getAttackCalc (io,Server_ID,dataAttack,ID_User_Defend);			
					});					
				}
			})
		}, 1000, ID_User_Defend);
	}
}

exports.ClearIntervalAttack = function clearIntervalAttack2 (ID_User_Defend) {
	clearIntervalAttack (ID_User_Defend);
}

function clearIntervalAttack (ID_User_Defend) {
	if (DictTimeInterval[ID_User_Defend]!=undefined) {
		clearInterval(DictTimeInterval[ID_User_Defend]);
		delete DictTimeInterval[ID_User_Defend];
		
		new Promise((resolve,reject)=>{
			client.hget(stringHAttack,ID_User_Defend, function (error,rows) {
				if (rows!=null) {

					var result = JSON.parse(rows).split("/").filter(String);
					client.hmget(stringHUnit,result,function (error,resultUnitAttack) {
						for (var i = 0; i < resultUnitAttack.length; i++) {
							var stringUnitResult =  JSON.parse(resultUnitAttack[i]);
							var unitID = result[i];
							if (stringUnitResult!=null) {
								stringUnitResult.Attack_Unit_ID = null;
								client.hset(stringHUnit,unitID,JSON.stringify(stringUnitResult))

							}

						}
						resolve();
					});

				}
			})
		}).then(()=>new Promise((resolve,reject)=>{
			client.hdel(stringHAttack,ID_User_Defend);
			resolve();
		}));
		
		
	}
	// var stringClearUnitMoving = "Unit_Moving_"+ID_User_Defend
	// move.ClearMoveTimeout(ID_User_Defend);
	// moving_Attack.ClearMoveTimeout(stringClearUnitMoving);

	// if (DictTimeInterval[ID_User_Defend]!=undefined) {
	// 	clearInterval(DictTimeInterval[ID_User_Defend]);
	// 	delete DictTimeInterval[ID_User_Defend];
	// 	stringHAttack = "s"+ID_User_Defend.split("_")[0]+"_attack"
	// 	client.hdel(stringHAttack ,ID_User_Defend);
	// 	// move.ClearMoveTimeout(ID_User_Defend);
	// 	// moving_Attack.ClearMoveTimeout(ID_User_Defend);

	// 	// stringHAttack = "s"+ID_User_Defend.split("_")[0]+"_attack";

	// 	// removeRedisData(stringHkey,ID_User_Defend,ID_Attack)

	// }
}

// getAttackCalc (null,1,[ '1_16_9_43' ],'1_16_42_54');

function getAttackCalc (io,server_ID,dataAttack,dataDefend) {
	// console.log(io,server_ID,dataAttack,dataDefend);
	stringHUnit = "s"+server_ID+"_unit";
	stringHAttack = "s"+server_ID+"_attack";
	var def = {};
	var Attack = 0, Hea_Lost = 0;
	var CounterMul = [];
	var QualityLost = 0;
	var tempObj={};
	// console.log(dataAttack,dataDefend)
	
	new Promise((resolve,reject)=>{
		client.hget(stringHUnit,dataDefend,function (error,rows) {
			def = JSON.parse(rows);
			resolve();
		});
	}).then(()=> new Promise((resolve,reject)=>{
		client.hmget(stringHUnit,dataAttack,function (error,rows) {
			for (var i = 0; i < rows.length; i++) {
				if (rows[i]!=null) {
					var result = JSON.parse(rows[i]);
					CounterMul[i] = checkCounter(result,def);
					// console.log(result)			
					Attack = Attack + (result.Attack * (result.Quality/def.Quality)*CounterMul[i]);

					checkSocketAttack (io,dataAttack[i],result,dataDefend);

				}else{
					Attack = Attack + 0;
					removeRedisData (stringHAttack,dataDefend,dataAttack[i]);
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
			}

			else if (Hea_Lost >= def.Hea_cur) {
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
				for (var i = 0; i < rows.length; i++) {
					var resultAttack = JSON.parse(rows[i]);
					resultAttack.Status = 6;
					resultAttack.Attack_Unit_ID = null;
					var stringAttack = server_ID+"_"+resultAttack.ID_Unit+"_"+resultAttack.ID_User+"_"+resultAttack.ID;
					client.hset(stringHUnit,stringAttack,JSON.stringify(resultAttack));
				}
			}
			def.Hea_cur = Number(def.Hea_cur);
			
			resolve();
		});
	}).then(()=> new Promise((resolve,reject)=>{
		// console.log(def)
		updateDataBaseQuality(server_ID,def);
		// console.log(dataDefend,def);
		checkSocketClient (io,dataDefend,def);
		if (def.Quality > 0) {
			client.hset(stringHUnit,dataDefend,JSON.stringify(def));
		}else{
			client.hdel(stringHAttack,dataDefend);
			client.hdel(stringHUnit,dataDefend);
			//remove pos khi chet
			positionRemove.PostionRemove(dataDefend);

			updateAttackData (io,dataAttack);			
			clearIntervalAttack (ID_User_Defend);
			
			attackGetPos.CheckPositionAfterAttack (io,server_ID,dataAttack);
			move.ClearMoveTimeout(ID_User_Defend);
			moving_Attack.ClearMoveTimeout(stringClearUnitMoving);
		}
		resolve();
	}).then(()=>new Promise((resolve,reject)=>{
		
		// console.log("QualityLost: "+QualityLost);
		if (QualityLost>0) {
			updateMight_Kill (QualityLost,dataAttack,dataDefend);
		}
	}))
	)
	);
}
// function checkPositionAfterAttack (io,server_ID,dataAttack,dataDefend) {
// 	/* dataAttack = []
// 	*/
// 	var stringHPos = "s"+server_ID+"_pos";
// 	var stringHUnit = "s"+server_ID+"_unit";
// 	var caseReturn = functions.CaseUnitAttack.NoneAttack;
// 	var resultUnit;

// 	dataAttack.forEach(function (unitAttack) {

// 		new Promise((resolve,reject)=>{
// 			client.hget(stringHUnit,unitAttack,function (error,rows) {
// 				resultUnit = JSON.parse(rows);
// 				if (resultUnit.AttackedBool==1) {
// 					caseReturn = functions.CaseUnitAttack.Attackted;
// 				}
// 				resolve();
// 			})

// 		}).then(()=>new Promise((resolve,reject)=>{
// 			switch (caseReturn) {
// 				case functions.CaseUnitAttack.NoneAttack:
// 				checkNoneAttackedUnit(io,server_ID,resultUnit,unitAttack);
// 				break;
// 				case functions.CaseUnitAttack.Attackted:
// 				checkAttackedUnit (io,server_ID,unitAttack);
// 				break;
// 			}
// 			resolve();
// 		})
// 		);
// 	});
// }

// function checkNoneAttackedUnit(io,server_ID,resultUnit,unitAttack) {
// // lấy pos của unit => ra mảng pos => đi tìm mảng unit
// /* lấy pos của unit => tìm mảng Unit đối ứng range => chạy vòng for lấy unit
// */

// }

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
function checkSocketAttack (io,dataAttack,att,dataDefend) {
	var Server_ID = dataAttack.split("_")[0]
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
		if (rows[0].Status!=functions.UnitStatus.Base){
			
			if (rows[0].AttackedBool!=1) {
				stringUpdate = "UPDATE `s"+dataCheck.toString().split("_")[0]+"_unit` SET "
				+"`Status`='"+functions.UnitStatus.Standby
				+"',`Attack_Unit_ID`= NULL"
				+" WHERE `ID`='"+dataCheck.toString().split("_")[3]+"'";

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

				checkAttackedUnit (io,dataCheck.toString().split("_")[0],dataCheck);

				// checkAttackedUnit(rows[0],dataCheck);
			}
		}else {
			stringUpdate = "UPDATE `s"+dataCheck.toString().split("_")[0]+"_unit` SET "
			+"`Status`='"+functions.UnitStatus.Base
			+"',`Attack_Unit_ID`= NULL"
			+" WHERE `ID`='"+dataCheck.toString().split("_")[3]+"'";

			client.hget(stringHUnit,dataCheck,function (error,rows) {
				if (!!error) {console.log(error);}
				var result = JSON.parse(rows);
				result.Status = functions.UnitStatus.Base;
				result.Attack_Unit_ID = null;
				client.hset(stringHUnit,dataCheck,JSON.stringify(result));
			});
			checkAttackedUnit (io,dataCheck.toString().split("_")[0],dataCheck);
			// checkAttackedUnit(io,Server_ID,rows[0],dataCheck);
			// checkAttackedData(io,Server_ID,rows[0],dataCheck);
		}
		// console.log(stringUpdate)
		db_position.query(stringUpdate,function(error,result){
			if (!!error) {console.log(error);}
		})
	})
}
exports.CheckAttackedUnit = function checkAttackedUnit2 (io,Server_ID,dataCheck) {
	checkAttackedUnit (io,Server_ID,dataCheck);
}

// checkAttackedUnit (null,1,'1_16_43_113')

function checkAttackedUnit (io,Server_ID,dataCheck) {
	// console.log("checkAttackedUnit: "+dataCheck)
	var posArray = [];
	var dataAttack = dataCheck;

	var dataDefendArray = [];
	var dataDefend;

	var attackBool = false;
	var attackDataBool = false;

	stringHUnit = "s"+Server_ID+"_unit";
	stringHAttack = "s"+Server_ID+"_attack";
	
	position_Check.GetPosition(dataCheck,function (returnPosArray) {
		posArray = returnPosArray;
		// console.log(posArray)
		new Promise((resolve,reject)=>{
			client.hget(stringHAttack,dataCheck,function (error,rows) {
				if (rows!=null) {
					attackDataBool=true;
					var result = rows.split("/").filter(String);
					dataDefendArray = result;
					resolve();
				}				
			})
		}).then(()=>new Promise((resolve,reject)=>{
			if (attackDataBool==true) {
				client.hmget(stringHUnit,dataDefendArray,function (error,rows) {
					for (var i = 0; i < rows.length; i++) {
						var result = JSON.parse(rows[i]);
						if (posArray.includes(result.Position_Cell)) {
							attackBool = true;
							dataDefend = dataDefendArray[i];
							setAttackData (Server_ID,dataDefend,dataAttack);
							updateDataBaseAttack (Server_ID,dataAttack,dataDefend);							
							break;
						}
					}
					resolve();
				});
			}
		}).then(()=>new Promise((resolve,reject)=>{
			if (attackBool==true) {			
				attackInterval(io,Server_ID,dataDefend);
			}
			resolve();
		})
		)
		)
	});

}
function updateDataBaseAttack (Server_ID,dataAttack,dataDefend) {
	// console.log(dataAttack,dataDefend)
	var ID = dataAttack.split("_")[3];
	var stringUpdate = "UPDATE `s"+Server_ID+"_unit` SET `Attack_Unit_ID` ='"+dataDefend+"', `Status`='"+functions.UnitStatus.Attack_Unit+"' WHERE `ID`='"+ID+"'"
	db_position.query(stringUpdate,function (error,result) {
		if (!!error) {console.log(error);}
	});
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
// #end: removeRedisData