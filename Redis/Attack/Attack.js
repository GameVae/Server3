'use strict';
var db_position				= require('./../../Util/Database/Db_position.js');
// var db_all_user				= require('./../../Util/Database/Db_all_user.js');

var functions 				= require('./../../Util/Functions.js');
var Promise 				= require('promise');


var redis = require("redis"),
client = redis.createClient();
client.select(functions.RedisData.TestUnit);

var counter = 1.2;
// var dataA ={
// 	"ID":9,"ID_Unit":16,"Level":1,"ID_User":9,"BaseNumber":1,"Quality":3,"Hea_cur":5.2,"Health":5.2,"Attack":2.15,"Defend":1.1,"Position_Cell":"489,80,0","Next_Cell":null,"End_Cell":null,"TimeMoveNextCell":null,"ListMove":null,"Status":0,"Attack_Base_ID":null,"Attack_Unit_ID":null,"Attacked_ID":0
// }

// var dataB={
// 	"ID":10,"ID_Unit":16,"Level":1,"ID_User":9,"BaseNumber":1,"Quality":2,"Hea_cur":5.2,"Health":5.2,"Attack":2.15,"Defend":1.1,"Position_Cell":"489,81,0","Next_Cell":null,"End_Cell":null,"TimeMoveNextCell":null,"ListMove":null,"Status":6,"Attack_Base_ID":null,"Attack_Unit_ID":null,"Attacked_ID":0
// }

// AttackCalc (dataA,dataB,function (returnValue) {
// 	console.log(returnValue);
// });

//AttackCalc (dataA,dataB)
var attack = ["1_16_9_9","1_16_9_10"];
//var attack = "1_16_9_8"
var defend = "1_16_9_11";
var DictTimeInterval = {};
// exports.Test = function test (argument) {
// 	console.log(argument)
// }
var S_MOVE_data = { Server_ID: 1,
	ID: 13,
	ID_Unit: 16,
	ID_User: 42,
	Position_Cell: '489,82,0',
	Next_Cell: '10,11,0',
	End_Cell: '10,9,0',
	TimeMoveNextCell: '2019-03-06T03:33:19.686',
	TimeFinishMove: '2019-03-05T01:25:22.210',
	ListMove:[ { CurrentCell: '10,11,0',	NextCell: '10,10,0',TimeMoveNextCell: '2019-03-05T01:25:19.686' } ] };
//
// setAttackData (1,'1_16_42_13','1_16_9_9')
exports.SetAttackData = function setAttackData (Server_ID,ID_Defend,ID_Attack) {
	var stringHkey = "s"+Server_ID+"_attack";
	client.hexists(stringHkey,ID_Defend,function (error,resultBool) {
		if (resultBool==1) {
			client.hget(stringHkey,ID_Defend,function (error,result) {
				if (!result.includes(ID_Attack)) {
					checkAttacking (Server_ID,ID_Defend,ID_Attack,function (returnBool) {
						if (returnBool) {addValue (stringHkey,ID_Defend,result,ID_Attack);}
					});
				}
			});
		}else{
			checkAttacking (Server_ID,ID_Defend,ID_Attack,function (returnBool) {
				if (returnBool) {addValue (stringHkey,ID_Defend,"",ID_Attack);}
			});
		}
	})
}

function addValue (stringHkey,ID_Defend,data,ID_Attack) {
	// console.log(stringHkey,ID_Defend,data,ID_Attack)
	client.hset(stringHkey,ID_Defend,data+ID_Attack+"/",function (error,rows) {
		//run interval
	});
}

// checkAttacking (1,'1_16_9_10',function (returnBool) {
// 	console.log(returnBool)
// })
function checkAttacking (Server_ID,ID_Defend,ID_Attack,returnBool) {
	var stringHkey = "s"+Server_ID+"_unit";
	var checkBool = false;
	client.hget(stringHkey,ID_Attack, function (error,rows) {
		var result = JSON.parse(rows);
		if (result.Status==functions.UnitStatus.Standby||
			(result.Status==functions.UnitStatus.Attack_Unit && result.Attack_Unit_ID ==ID_Defend)) 
		{
			checkBool = true;
		}
		returnBool(checkBool);
	});
}

function checkUnitDef (server_ID,dataAttack,dataDefend) {
	var stringHkey = "s"+server_ID+"_unit";	
	client.hexists(stringHkey,dataDefend, function (error, result) {
		if (result==1) {
			getAttackCalc (server_ID,dataAttack,dataDefend);
		}else{
			console.log('error Get Attack Info Defend');
		}
	});
}

function getAttackCalc (server_ID,dataAttack,dataDefend) {
	var stringHkey = "s"+server_ID+"_unit";
	var def = {};
	var Attack = 0, Hea_Lost = 0;
	var CounterMul = [];
	new Promise((resolve,reject)=>{
		client.hget(stringHkey,dataDefend,function (error,rows) {
			var result = JSON.parse(rows);
			def = result;
			resolve();
		});
	}).then(()=> new Promise((resolve,reject)=>{
		client.hmget(stringHkey,dataAttack,function (error,rows) {
			for (var i = 0; i < rows.length; i++) {
				var result = JSON.parse(rows[i]);
				CounterMul[i] = checkCounter(result,def);
				Attack = Attack + (result.Attack * (result.Quality/def.Quality)*CounterMul[i]);
			}
			Hea_Lost = parseFloat(Attack - def.Defend).toFixed(2);
			if (Hea_Lost < 0) {Hea_Lost = 1;}
			if (Hea_Lost < def.Hea_cur){
				def.Hea_cur = parseFloat(def.Hea_cur - Hea_Lost).toFixed(2);
			}
			else if (Hea_Lost >= def.Hea_cur) {
				def.Hea_cur = parseFloat(def.Health - parseInt((Hea_Lost - def.Hea_cur)%def.Health)).toFixed(2);
				def.Quality = def.Quality -(parseInt((Hea_Lost - def.Hea_cur)/def.Health) +1);
			}
			if (def.Quality <= 0) {
				def.Quality = 0;
				for (var i = 0; i < rows.length; i++) {
					var resultAttack = JSON.parse(rows[i]);
					resultAttack.Status = 6;
					resultAttack.Attack_Unit_ID = null;
					var stringAttack = server_ID+"_"+resultAttack.ID_Unit+"_"+resultAttack.ID_User+"_"+resultAttack.ID;
					// console.log(stringAttack);
					client.hset(stringHkey,stringAttack,JSON.stringify(resultAttack));
				}
			}
			def.Hea_cur = Number(def.Hea_cur);
			resolve();
		});
	}).then(()=>{
		// console.log(def);
		if (def.Quality == 0) {
			client.hdel(stringHkey,defend);
		}else{
			client.hset(stringHkey,defend,JSON.stringify(def));
		}		
		//updateDataBase(server_ID,def);
	})
	);
}
function updateDataBase (server_ID,dataUpdate) {
	var stringUpdate;
	var Unit = {
		ID : dataUpdate.ID,
		ID_Unit : dataUpdate.ID_Unit,
		Level : dataUpdate.Level,
		ID_User : dataUpdate.ID_User,
		BaseNumber : dataUpdate.BaseNumber,
		Quality : dataUpdate.Quality,
		Hea_cur : dataUpdate.Hea_cur,
	}
	if (dataUpdate.Quality==0) {
		stringUpdate = "DELETE FROM `s"+server_ID+"_unit` WHERE `ID`='"+dataUpdate.ID+"'";
		// LogChange		
	}else{
		stringUpdate = "UPDATE `s"+server_ID+"_unit` SET `Quality`= '"+dataUpdate.Quality+"', `Hea_cur`='"+dataUpdate.Hea_cur
		+"' WHERE `ID`='"+dataUpdate.ID+"'";
		// LogChange		
	}
	// socket.emit("R_UNIT",{R_UNIT: Unit})
	db_position.query(stringUpdate,function (error,result) {
		if (!!error) {console.log(error);}
	});
}

function checkCounter (dataAtt,dataDef) {
	var counterAB=1;
	
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

function returnCaseUnit (dataUnit) {
	var returnCase=0;
	if (dataUnit>15&&dataUnit<20) {returnCase=1;}
	else if (dataUnit>20&&dataUnit<25) {returnCase=2;}
	else if (dataUnit>25&&dataUnit<30) {returnCase=3;}
	else {returnCase = 4;}
	return returnCase;
}

// checkPostionAttackUnit (S_MOVE_data,S_MOVE_data.Position_Cell)

// function checkPostionAttackUnit (data,stringPos) {
// 	// console.log(data);
// 	var stringHkey = "s"+data.Server_ID+"_pos";
// 	client.hexists(stringHkey,stringPos,function (error,rows) {
// 		if (rows==1) {
// 			getListUnit (stringHkey,stringPos)
// 		}
// 		// console.log(rows);
// 	});	
// }

// function getListUnit (data,stringHkey,stringPos) {
// 	client.hget(stringHkey,stringPos,function (error,rows) {
// 		var listUnit = rows.split("/").filter(String);
// 		console.log(listUnit)
// 	});
// }
// lấy listUnit?
// var listUnit = [ '1_16_9_11', '1_16_9_10' ]

//checkUnitAttack (S_MOVE_data,listUnit)
// function checkUnitAttack (data,listUnitAttack) {
// 	var ID_User_Attack=0;
// 	for (var i = 0; i < listUnitAttack.length; i++) {
// 		ID_User_Attack = listUnitAttack[i].split("_")[2];
// 		console.log(ID_User_Attack)
// 	}
// }
// //updateRedisAttackDatabase (1)
// function updateRedisAttackDatabase (server_ID) {
	
// }

//checkUnitDef (1,attack,defend);
//getAttackCalc (1,attack,defend)
// AttackFun () 
// function AttackFun () {
// 	var stringHkey ="test";
// 	var stringKey ="this";
// 	client.hset(stringHkey,stringKey,"value",function (error,rows) {
// 			console.log(error)
// 		console.log(rows)
// 	})
// }