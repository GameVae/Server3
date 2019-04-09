'use strict';
var GetIO 					= require('./../../GetIO.js');
var db_position				= require('./../../Util/Database/Db_position.js');
// var db_all_user				= require('./../../Util/Database/Db_all_user.js');

var functions 				= require('./../../Util/Functions.js');
var Promise 				= require('promise');


var redis = require("redis"),
client = redis.createClient();
client.select(functions.RedisData.TestUnit);

var counter = 1.2;
var DictTimeOut ={};
var DictTimeInterval = {};
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
// var attack = ["1_16_9_9","1_16_9_10"];
// //var attack = "1_16_9_8"
// var defend = "1_16_9_11";

exports.Test = function test (argument) {
	console.log(argument)
}
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
var stringHAttack,stringHUnit;

exports.SetAttackData = function setAttackData (Server_ID,ID_Defend,ID_Attack) {
	stringHAttack = "s"+Server_ID+"_attack";
	stringHUnit = "s"+Server_ID+"_unit";
	client.hexists(stringHAttack,ID_Defend,function (error,resultBool) {
		if (resultBool==1) {
			client.hget(stringHAttack,ID_Defend,function (error,result) {
				var resultID = result.split("/").filter(String)
				if (!resultID.includes(ID_Attack)) {
					checkAttacking (Server_ID,ID_Defend,ID_Attack,function (returnBool) {
						// console.log("returnBool: "+returnBool);
						if (returnBool) {addValue (stringHAttack,ID_Defend,result,ID_Attack);}
					});
				}
			});
		}else{
			checkAttacking (Server_ID,ID_Defend,ID_Attack,function (returnBool) {
				// console.log("returnBool: "+returnBool);
				if (returnBool) {addValue (stringHAttack,ID_Defend,"",ID_Attack);}
			});
		}
	})
}

function addValue (stringHkey,ID_Defend,data,ID_Attack) {
	client.hset(stringHkey,ID_Defend,data+ID_Attack+"/");
	
	// console.log(stringHkey,ID_Defend,data,ID_Attack)
	// client.hset(stringHkey,ID_Defend,data+ID_Attack+"/",function (error,rows) {
	// 	//run interval
	// });
}

// checkAttacking (1,'1_16_9_10',function (returnBool) {
// 	console.log(returnBool)
// })

function checkAttacking (Server_ID,ID_Defend,ID_Attack,returnBool) {
	var stringHkey = "s"+Server_ID+"_unit";
	var checkBool = false;
	// console.log(stringHkey,ID_Attack)
	var defend = ID_Defend.split("_")[2];
	var attack = ID_Attack.split("_")[2];
	// console.log(defend,attack)
	// if (defend==attack) {
	// 	console.log('same User')
	// 	return returnBool(checkBool);
	// }
	client.hget(stringHkey,ID_Attack, function (error,rows) {
		var result = JSON.parse(rows);
		if (result.Status==functions.UnitStatus.Standby||
			(result.Status==functions.UnitStatus.Attack_Unit && result.Attack_Unit_ID == ID_Defend)) 
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
	var stringHUnit = "s"+server_ID+"_unit";
	var def = {};
	var Attack = 0, Hea_Lost = 0;
	var CounterMul = [];
	// console.log(dataAttack,dataDefend)
	
	new Promise((resolve,reject)=>{
		client.hget(stringHUnit,dataDefend,function (error,rows) {
			var result = JSON.parse(rows);
			def = result;
			// console.log(def)
			resolve();
		});
	}).then(()=> new Promise((resolve,reject)=>{
		//console.log(def)
		client.hmget(stringHUnit,dataAttack,function (error,rows) {
			// console.log(rows)
			for (var i = 0; i < rows.length; i++) {
				var result = JSON.parse(rows[i]);
				// console.log(result)
				
				CounterMul[i] = checkCounter(result,def);
				// console.log(result)			
				Attack = Attack + (result.Attack * (result.Quality/def.Quality)*CounterMul[i]);
			}			
			Hea_Lost = parseFloat(Attack - def.Defend).toFixed(2);
			// console.log(def.Hea_Lost);
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
					//update database
				}
			}
			def.Hea_cur = Number(def.Hea_cur);
			// console.log(def)
			resolve();
		});
	}).then(()=>{
		// console.log(stringHAttack,stringHUnit,dataDefend)
		// console.log(def)
		if (def.Quality == 0) {
			client.hdel(stringHAttack,dataDefend);
			client.hdel(stringHUnit,dataDefend);
			updateAttackData (dataAttack);

		}else{
			client.hset(stringHUnit,dataDefend,JSON.stringify(def));

		}	
		checkSocketClient (GetIO.IO,dataDefend);
		updateDataBase(server_ID,def);
	})
	);
}

function checkSocketClient (io,dataDefend) {
	var stringHSocket = "s"+dataDefend.Server_ID+"_socket";

	client.hvals(stringHSocket,function (error,rowsSocket) {
		if (rowsSocket.length>0) {
			clearTimeout((DictTimeOut['sendNewPos']));
			delete DictTimeOut['sendNewPos'];
			for (var i = 0; i < rowsSocket.length; i++) {
				sendToClient (io,rowsSocket[i],dataDefend);
			}
		}else{
			// không cần send thông tin
			console.log("all user offline");

			// sendGetNewPos2(io,data)
			// sendGetNewPos2(index.IO,data);		
			// DictTimeOut['sendNewPos'] = setTimeout(function (io,data) {
			// 	// console.log(rowsSocket[0])
			// 	sendToClient (io,dataDefend)
			// }, 1000, io,dataDefend);
		}
	});	
	// socket.emit("R_ATTACK",{R_ATTACK: Unit})
}

function sendToClient (io,socketID,dataDefend) {
	io.to(socketID).emit('R_ATTACK',{R_ATTACK:dataDefend});
}

function updateDataBase (server_ID,dataUpdate) {
	var stringUpdate;
	// var Unit = {
	// 	ID : dataUpdate.ID,
	// 	ID_Unit : dataUpdate.ID_Unit,
	// 	Level : dataUpdate.Level,
	// 	ID_User : dataUpdate.ID_User,
	// 	BaseNumber : dataUpdate.BaseNumber,
	// 	Quality : dataUpdate.Quality,
	// 	Hea_cur : dataUpdate.Hea_cur,
	// }
	if (dataUpdate.Quality==0) {
		stringUpdate = "DELETE FROM `s"+server_ID+"_unit` WHERE `ID`='"+dataUpdate.ID+"'";
		
		// LogChange		
	}else{
		stringUpdate = "UPDATE `s"+server_ID+"_unit` SET `Quality`= '"+dataUpdate.Quality+"', `Hea_cur`='"+dataUpdate.Hea_cur
		+"' WHERE `ID`='"+dataUpdate.ID+"'";

		// LogChange		
	}
	console.log(stringUpdate)	
	
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

exports.AttackInterval = function attackInterval (Server_ID,ID_User_Defend) {

	stringHAttack = "s"+Server_ID+"_attack";
	stringHUnit = "s"+Server_ID+"_unit";
	// console.log(ID_User_Defend)

	DictTimeInterval[ID_User_Defend] = setInterval(function (ID_User_Defend) {
		client.hexists(stringHAttack,ID_User_Defend,function (error,rows) {
			if (rows==0) {
				// new Promise((resolve,reject)=>{
				// 	//check position
				// })
				clearInterval(ID_User_Defend);
				delete DictTimeInterval[ID_User_Defend];
			}else{
				client.hget(stringHAttack,ID_User_Defend,function (error,rows) {			
					var dataAttack = rows.split("/").filter(String);
					getAttackCalc (Server_ID,dataAttack,ID_User_Defend);			
				});					
			}
		})
	}, 1000, ID_User_Defend)
}

// test (1,'1_16_42_25')

function test (Server_ID,ID_User_Defend) {
	stringHAttack = "s"+Server_ID+"_attack";
	stringHUnit = "s"+Server_ID+"_unit";
	client.hget(stringHAttack,ID_User_Defend,function (error,rows) {
		// console.log(rows)
		var result = rows.split("/");
		var ID_User_Attack = result.filter(String);
		console.log(ID_User_Attack)
		// getAttackCalc(Server_ID,ID_User_Attack,ID_User_Defend);
	});
}
// var dataA = [ '1_16_9_12', '1_16_9_10' ]
// updateAttackData (dataA)
function updateAttackData (data) {
	for (var i = 0; i < data.length; i++) {
		checkDataAttack (data[i])	
	}
}

function checkDataAttack (dataCheck) {
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
					client.hset(stringHUnit,dataCheck,JSON.stringify(result))
				});
			}else{
				stringUpdate = "UPDATE `s"+dataCheck.toString().split("_")[0]+"_unit` SET "
				+"`Status`='"+functions.UnitStatus.Attacked
				+"',`Attack_Unit_ID`= NULL"
				+" WHERE `ID`='"+dataCheck.toString().split("_")[3]+"'";
				checkAttackedUnit(dataCheck);
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
		}
		// console.log(stringUpdate)
		// db_position.query(stringUpdate,function(error,result){
		// 	if (!!error) {console.log(error);}
		// })
	})
}
// var data= [ { ID: 25,
//     ID_Unit: 16,
//     ID_User: 42,
//     BaseNumber: 1,
//     Level: 2,
//     Quality: 1,
//     Hea_cur: 5.45,
//     Health: 5.45,
//     Attack: 2.3,
//     Defend: 1.15,
//     Position_Cell: '2,5,0',
//     Next_Cell: '2,6,0',
//     End_Cell: '5,8,0',
//     TimeMoveNextCell: '2019-03-28T00:05:01.000Z',
//     TimeFinishMove: '2019-03-28T00:05:12.000Z',
//     ListMove: '[{"Position_Cell":"2,6,0","Next_Cell":"3,7,0","TimeMoveNextCell":"2019-03-28T07:05:04.474"},{"Position_Cell":"3,7,0","Next_Cell":"4,7,0","TimeMoveNextCell":"2019-03-28T07:05:07.274"},{"Position_Cell":"4,7,0","Next_Cell":"4,8,0","TimeMoveNextCell":"2019-03-28T07:05:09.798"},{"Position_Cell":"4,8,0","Next_Cell":"5,8,0","TimeMoveNextCell":"2019-03-28T07:05:12.598"}]',
//     Status: 1,
//     Attack_Base_ID: null,
//     Attack_Unit_ID: null,
//     AttackedBool: 0 } ]
// //
// var json = data[0]
// console.log(json.Attack)

// checkAttackedUnit ('1_16_42_25')

// function checkAttackedUnit (data) {
// 	console.log(data)

// }