'use strict';
var db_s1_base_info			= require('./../../Util/Database/Db_s1_base_info.js');
var db_s1_base_defend		= require('./../../Util/Database/Db_s1_base_defend.js');

var db_s2_base_info			= require('./../../Util/Database/Db_s2_base_info.js');
var db_s2_base_defend		= require('./../../Util/Database/Db_s2_base_defend.js');

var db_training				= require('./../../Util/Database/Db_training.js');
var db_position				= require('./../../Util/Database/Db_position.js');
var db_all_user				= require('./../../Util/Database/Db_all_user.js');

var functions 				= require('./../../Util/Functions.js');
var Promise 				= require('promise');


var redis = require("redis"),
client = redis.createClient();
client.select(2)

var counter = 1.2;
var dataA ={
	"ID":9,"ID_Unit":16,"Level":1,"ID_User":9,"BaseNumber":1,"Quality":3,"Hea_cur":5.2,"Health":5.2,"Attack":2.15,"Defend":1.1,"Position_Cell":"489,80,0","Next_Cell":null,"End_Cell":null,"TimeMoveNextCell":null,"ListMove":null,"Status":0,"Attack_Base_ID":null,"Attack_Unit_ID":null,"Attacked_ID":0
}

var dataB={
	"ID":10,"ID_Unit":16,"Level":1,"ID_User":9,"BaseNumber":1,"Quality":2,"Hea_cur":5.2,"Health":5.2,"Attack":2.15,"Defend":1.1,"Position_Cell":"489,81,0","Next_Cell":null,"End_Cell":null,"TimeMoveNextCell":null,"ListMove":null,"Status":6,"Attack_Base_ID":null,"Attack_Unit_ID":null,"Attacked_ID":0
}


// AttackCalc (dataA,dataB,function (returnValue) {
// 	console.log(returnValue);
// });


//AttackCalc (dataA,dataB)
var attack = ["1_16_9_8","1_16_9_9"]
//var attack = "1_16_9_8"
var defend = "1_16_9_10"

getAttackCalc (1,attack,defend)

function getAttackCalc (server_ID,dataAttack,dataDefend) {
	var stringHkey = "s"+server_ID+"_unit";
	var def ={}
	var Attack =0, Hea_Lost = 0;
	var CounterMul =[]
	new Promise((resolve,reject)=>{
		client.hget(stringHkey,dataDefend,function (error,rows) {
			var result = JSON.parse(rows);
			def = result;
			def.ID_Unit = result.ID_Unit;
			def.Quality = result.Quality;
			def.Attack = result.Attack;
			def.Defend = result.Defend;
			def.Health = result.Health;
			def.Hea_cur = result.Hea_cur;
			resolve();
		});
	}).then(()=> new Promise((resolve,reject)=>{
		client.hmget(stringHkey,attack,function (error,rows) {
			for (var i = 0; i < rows.length; i++) {
				var result = JSON.parse(rows[i]);
				CounterMul[i] = checkCounter(result,def);
				Attack = Attack + (result.Attack * (result.Quality/def.Quality)*CounterMul[i]);
			}
			Hea_Lost = parseFloat(Attack - def.Defend).toFixed(2);
			if (Hea_Lost<0) {Hea_Lost=1;}
			if (Hea_Lost < def.Hea_cur){
				def.Hea_cur = parseFloat(def.Hea_cur - Hea_Lost).toFixed(2);

			}
			else if (Hea_Lost >= def.Hea_cur) {
				def.Hea_cur = parseFloat(def.Health - parseInt((Hea_Lost - def.Hea_cur)%def.Health)).toFixed(2);
				def.Quality = def.Quality -(parseInt((Hea_Lost - def.Hea_cur)/def.Health) +1);
			}
			if (def.Quality<0) {def.Quality = 0;}
			def.Hea_cur = Number(def.Hea_cur)
			// console.log(Hea_Lost);
			// console.log(def);
			resolve();
		});
	}).then(()=>{
		client.hset(stringHkey,defend,JSON.stringify(def));
		updateDataBase(server_ID,def);
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
		socket.emit("R_UNIT",)
	}else{
		stringUpdate = "UPDATE `s"+server_ID+"_unit` SET `Quality`= '"+dataUpdate.Quality+"', `Hea_cur`='"+dataUpdate.Hea_cur+"' WHERE";
		// LogChange
		socket.emit("R_UNIT",{R_UNIT: Unit})
	}
	db_position.query(stringUpdate,function (error,result) {
		if (!!error) {console.log(error);}
	})
}
function AttackCalc (dataAtt,dataDef) {
	var returnDataB = dataDef;
	var returnData ={};
	var CounterAB =  checkCounter (dataAtt,dataDef);
	var Dif = parseFloat(dataAtt.Quality/dataDef.Quality).toFixed(2);
	var Hea_Lost_B = parseFloat((Dif * dataAtt.Attack * CounterAB) - dataDef.Defend).toFixed(2);
	if (Hea_Lost_B<1) {Hea_Lost_B=1; }
	if (Hea_Lost_B < dataDef.Hea_cur){dataDef.Hea_cur -= Hea_Lost_B;}
	else if (Hea_Lost_B >= dataDef.Hea_cur) {
		dataDef.Hea_cur = parseFloat(dataDef.Health - parseInt((Hea_Lost_B - dataDef.Hea_cur)%dataDef.Health)).toFixed(2);
		dataDef.Quality = dataDef.Quality -(parseInt((Hea_Lost_B - dataDef.Hea_cur)/dataDef.Health) +1);
	}
	if (dataDef.Quality<0) {dataDef.Quality = 0;}
	/*update Database*/
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
	if (dataUnit>15&&dataUnit<20) {returnCase=1}
		else if (dataUnit>20&&dataUnit<25) {returnCase=2}
			else if (dataUnit>25&&dataUnit<30) {returnCase=3}
				else {returnCase = 4;}
			return returnCase;
		}
