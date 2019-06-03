'use strict';
var getInfo 				= require("./../Info/GetInfo.js");
var positionRemove 			= require('./../Redis/Position/Position_Remove.js'); 
// positionRemove.Test(5)
// var move 					= require('./../Redis/Move/Move.js');
// var moving_Attack 			= require('./../Unit/Moving_Attack.js');
var attackFunc 				= require('./AttackFunc.js')

var position_Check			= require('./../Redis/Position/Position_Check.js');

var db_position 			= require('./../Util/Database/Db_position.js');

var Promise 				= require('promise');

var functions 				= require('./../Util/Functions.js');

var redis 					= require("redis"),
client 						= redis.createClient();
client.select(functions.RedisData.TestUnit);

var stringHAttack, stringHUnit;


exports.CheckPositionAfterAttack = function checkPositionAfterAttack2(io,server_ID,dataAttack){
	checkPositionAfterAttack(io,server_ID,dataAttack);
}
function checkPositionAfterAttack(io,server_ID,dataAttack){
	var stringHPos = "s"+server_ID+"_pos";
	var stringHUnit = "s"+server_ID+"_unit";
	var resultUnit;	
	var arrayUnit = {};
	var arrayUnitPos = [];
	var posUnit =[]
	var resultUnitPos;
	var unit;
	var dataDefend;
	var unitCanAttackBool=false;
	// lấy rangePos từ dataAttack
	var addAttackBool = true;
	var checkBoolFriendData = false, checkBoolGuildData = false;

	new Promise((resolve,reject)=>{
		client.hmget(stringHUnit,dataAttack,function (error,rows) {
			arrayUnit = rows;//nhung Unit da tan cong unit cũ
			// console.log(arrayUnit)
			for (var i = 0; i < rows.length; i++) {
				arrayUnitPos.push(JSON.parse(rows[i]).Position_Cell)
			}
			// console.log(arrayUnitPos);//[ '299,4,0', '298,3,0', '297,4,0' ]
			resolve();
		})
	}).then(()=> new Promise((resolve,reject)=>{
		client.hmget(stringHPos,arrayUnitPos,function(error,rowsPos){
			// console.log(rowsPos);
			/* lấy vị trí pos của những Unit đó để tìm những Unit đang trỏ về vị trí đó
			*/
			for (var i = 0; i < rowsPos.length; i++) {
				posUnit.push(rowsPos[i].split("/").filter(String));
			}
			// dtAttack = ['1_16_44_150','1_16_43_147','1_16_43_144']
			// [ '1_16_44_150/1_16_44_148/',
			// '1_16_43_147/1_16_43_144/',
			// '1_16_43_147/1_16_43_144/' ]
			// console.log(posUnit)
			// [ [ '1_16_44_150', '1_16_44_148' ],
			// [ '1_16_43_147', '1_16_43_144' ],
			// [ '1_16_43_147', '1_16_43_144' ] ]
			resolve();
		});
	}).then(()=> new Promise((resolve,reject)=>{
		for (var i = 0; i < posUnit.length; i++) {
			unit = dataAttack[i];
			var posUnitElement;
			var posArray=[]

			if (posUnit[i].length>1) {
				for (var j = 0;j < posUnit[i].length; j++) {
					posUnitElement =posUnit[i][j];
					
					if (unit.split("_")[2]!=posUnitElement.split("_")[2]) {
						if (unit.split("_")[1]==posUnitElement.split("_")[1]) {
							unitCanAttackBool =true;
						}else {
							new Promise((resolve,reject)=>{
								position_Check.GetPosition(unit,function (returnPosArray) {
									posArray = returnPosArray;
									resolve();
								})
							}).then(()=>new Promise((resolve,reject)=>{
								client.hget(stringHUnit,posUnitElement,function (error,rows) {
									var resultUnitElement = JSON.parse(rows);
									if (posArray.includes(resultUnitElement.Position_Cell)) {
										unitCanAttackBool = true 
									}
									resolve();
								})

							}).then(()=> new Promise((resolve,reject)=>{
								if (unitCanAttackBool==true) {
									checkAndGetDataAttack (io,unit,posUnitElement);
								}
							}))
							)							
						}
					}
				}				
			}		
		}
		resolve();		
	})
	)
	)
	
}
function checkAndGetDataAttack (io,unit,posUnitElement) {
	new Promise((resolve,reject)=>{
		client.hget(stringHUnit,unit,function (error,rows) {
			var result = JSON.parse(rows);
			if (result.Attack_Unit_ID!=null) {
				addAttackBool = false;
			}
			resolve();
		})

	}).then(()=> new Promise((resolve,reject)=>{
		if (addAttackBool == true) {
			friendData.CheckFriendData (unit.split("_")[2],posUnitElement.split("_")[2],function (returnBool) {
				checkBoolFriendData = returnBool;
				resolve();
			});
		}
	}).then(()=> new Promise((resolve,reject)=>{
		if (addAttackBool == true) {
			guildData.CheckSameGuildID (unit.split("_")[2],posUnitElement.split("_")[2],function (returnBool) {
				checkBoolGuildData = returnBool;
				resolve();
			});
		}						
	}).then(()=>new Promise((resolve,reject)=>{
		console.log(checkBoolFriendData,checkBoolGuildData,addAttackBool)
		if ((checkBoolFriendData==false&&checkBoolGuildData==false)&&addAttackBool==true) {
			// console.log(checkBoolFriendData,checkBoolGuildData)
			// add Data
			setAttackData (server_ID,posUnitElement,unit);
		}
		resolve();
	}).then(()=>new Promise((resolve,reject)=>{
		if ((checkBoolFriendData==false&&checkBoolGuildData==false)&&addAttackBool==true) {
			attackFunc.AttackInterval(io,Server_ID,posUnitElement);
		}
	})
	)
	)
	)
	)
}

function setAttackData (Server_ID,ID_Defend,ID_Attack) {
	stringHAttack = "s"+Server_ID+"_attack";
	stringHUnit = "s"+Server_ID+"_unit";
	// console.log(Server_ID,ID_Defend,ID_Attack)
	client.hget(stringHUnit,ID_Defend,function (error,rows) {
		var result = JSON.parse(rows)
		result.Attack_Unit_ID = ID_Attack;
		client.hset(stringHUnit,ID_Defend,JSON.stringify(result))		
	});
	
	client.hexists(stringHAttack,ID_Defend,function (error,resultBool) {
		console.log('AttackGetPos.js setAttackData')
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
	});

	var stringUpdate = "UPDATE `s"+Server_ID+"_unit` SET `Attack_Unit_ID` ='"+ID_Defend+"' WHERE `ID`='"+ID_Attack.split("_")[3]+"'; "+
	"UPDATE `s"+Server_ID+"_unit` SET`AttackedBool` = '1' WHERE `ID` = '"+ID_Defend.split("_")[3]+"'"
	db_position.query(stringUpdate,function (error,result) {
		if (!!error) {console.log('AttackGetPos.js setAttackData '+stringUpdate);}
	})
}