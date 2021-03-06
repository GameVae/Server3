'use strict';
// var getInfo 				= require("./../Info/GetInfo.js");

// var positionRemove 			= require('./../Redis/Position/Position_Remove.js'); 
// positionRemove.Test(5)
// var move 					= require('./../Redis/Move/Move.js');
// var moving_Attack 			= require('./../Unit/Moving_Attack.js');

var attackFunc 				= require('./AttackFunc.js')
var friendData 				= require('./../Redis/Friend/FriendData.js');
var guildData 				= require('./../Redis/Guild/GuildData.js');
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
// var data =[ '1_16_44_197/1_16_44_149/1_16_43_204/1_16_43_205/'  ]
// var data = ['1_16_44_203/1_16_44_202/1_16_44_192/']
// checkPositionAfterAttack(null,1,data)

function checkPositionAfterAttack(io,server_ID,dataAttackString){
	// console.log('AttackGetPos.js')
	// 
	stringHUnit = "s"+server_ID+"_unit";
	var dataAttack = dataAttackString.toString().split("/").filter(String);

	var stringHPos = "s"+server_ID+"_pos";
	
	var resultUnit;	
	var arrayUnit = {};
	var arrayPos = [];
	var posUnit =[]
	var resultUnitPos;
	var unit;
	var dataDefend;
	var unitCanAttackBool=false;
	// lấy rangePos từ dataAttack
	
	var checkBoolFriendData = false, checkBoolGuildData = false;

	new Promise((resolve,reject)=>{
		client.hmget(stringHUnit,dataAttack,function (error,rows) {			
			arrayUnit = rows;//nhung Unit da tan cong unit cũ
			for (var i = 0; i < arrayUnit.length; i++) {
				if (arrayUnit[i]!=null) {
					arrayPos.push(JSON.parse(arrayUnit[i]).Position_Cell)						
				}else {
					dataAttack.splice(dataAttack.indexOf(dataAttack[i]),1)				
				}
			}
			// console.log(arrayPos);//['299,3,0']	
			// console.log(dataAttack);//['1_16_44_149']
			resolve();
		});
	}).then(()=>new Promise((resolve,reject)=>{
		if (arrayPos!=null) {
			client.hmget(stringHPos,arrayPos,function(error,rowsUnitReturn){
				if (rowsUnitReturn!=null) {
					for (var i = 0; i < rowsUnitReturn.length; i++) {
						posUnit.push(rowsUnitReturn[i].split("/").filter(String));
					}
				}					
			// console.log(rowsUnitReturn);
			// console.log(posUnit)
			resolve();
		});
		}
		
	}).then(()=>new Promise((resolve,reject)=>{
		var posUnitElement;
		var posArray=[];
		var unitElement=[];
		var unitAliveBool = false;
		for (var i = 0; i < posUnit.length; i++) {
			unit = dataAttack[i];			
			unitElement = posUnit[i]
			if (unitElement.length>1) {
				for (var j = 0; j < unitElement.length; j++) {
					
					posUnitElement = unitElement[j];
					console.log('unit,posUnitElement1')
					console.log(unit);
					console.log(posUnitElement)

					if (unit!=posUnitElement) {

						if (unit.split("_")[1]==posUnitElement.split("_")[1]) {
							client.hget(stringHUnit,posUnitElement,function (error,rows) {
								console.log('case 1')
								if (rows!=null) {
									checkAndGetDataAttack (io,unit,posUnitElement);
								}
								resolve();
							});

						}else{

							new Promise((resolve,reject)=>{
								client.hget(stringHUnit,posUnitElement,function (error,rows) {
									if (rows!=null) {unitAliveBool=true};
								})
							}).then(()=>new Promise((resolve,reject)=>{
								// console.log(stringHUnit,posUnitElement)
								if (unitAliveBool==true) {
									position_Check.GetPosition(unit,function (returnPosArray) {
										posArray = returnPosArray;
										resolve();
									})
								}
							}).then(()=>new Promise((resolve,reject)=>{
								if (unitAliveBool==true) {
									client.hget(stringHUnit,posUnitElement,function (error,rows) {
										var resultUnitElement = JSON.parse(rows);
										if (posArray.includes(resultUnitElement.Position_Cell)) {
											unitCanAttackBool = true 
										}
										resolve();
									})
								}

							}).then(()=>new Promise((resolve,reject)=>{
								if (unitCanAttackBool==true&&unitAliveBool==true) {
									console.log('unit,posUnitElement2')
									console.log(unit,posUnitElement)
									checkAndGetDataAttack (io,unit,posUnitElement);
								}
								resolve();
							}))
							)
							)
						}

					}
					
				}

			}else{
				// chỉ có 1 element => position không cần query
			}

		}
		resolve();
	})
	)
	)
	
}



function checkAndGetDataAttack (io,unit,posUnitElement) {
	var addAttackBool = false;
	var checkBoolFriendData = false;
	var checkBoolGuildData = false;

	new Promise((resolve,reject)=>{
		client.hget(stringHUnit,unit,function (error,rows) {
			var result = JSON.parse(rows);
			// console.log(result.Attack_Unit_ID)
			if (result.Attack_Unit_ID==null) {
				addAttackBool = true;
			}
			resolve();
		})

	}).then(()=> new Promise((resolve,reject)=>{
		if (addAttackBool == true) {
			friendData.CheckFriendData (unit,posUnitElement,function (returnBool) {
				checkBoolFriendData = returnBool;
				resolve();
			});
		}
	}).then(()=> new Promise((resolve,reject)=>{
		if (addAttackBool == true) {
			guildData.CheckSameGuildID (unit,posUnitElement,function (returnBool) {
				checkBoolGuildData = returnBool;
				resolve();
			});
		}						
	}).then(()=>new Promise((resolve,reject)=>{
		console.log(checkBoolFriendData,checkBoolGuildData,addAttackBool)
		if ((checkBoolFriendData==false&&checkBoolGuildData==false)&&addAttackBool==true) {
			// console.log(checkBoolFriendData,checkBoolGuildData)
			// add Data
			setAttackData (unit.split("_")[0],posUnitElement,unit);
		}
		resolve();
	}).then(()=>new Promise((resolve,reject)=>{
		if ((checkBoolFriendData==false&&checkBoolGuildData==false)&&addAttackBool==true) {
			attackFunc.AttackInterval(io,Server_ID,posUnitElement);
		}
		resolve();
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
	client.hget(stringHUnit,ID_Attack,function (error,rows) {
		var result = JSON.parse(rows)
		result.Attack_Unit_ID = ID_Defend;
		client.hset(stringHUnit,ID_Attack,JSON.stringify(result))		
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

function addValue (stringHkey,ID_Defend,data,ID_Attack) {
	client.hset(stringHkey,ID_Defend,data+ID_Attack+"/");
}

function checkPositionAfterAttack3(io,server_ID,dataAttackString){
	// console.log('AttackGetPos.js')
	// 
	var dataAttack = dataAttackString.toString().split("/").filter(String);

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
				console.log(arrayUnit)
				for (var i = 0; i < arrayUnit.length; i++) {
					if (arrayUnit[i]!=null) {
						arrayUnitPos.push(JSON.parse(arrayUnit[i]).Position_Cell)						
					}else {
						dataAttack.splice(dataAttack.indexOf(dataAttack[i]),1)				
					}
				}
				console.log(arrayUnitPos);//['299,3,0']	
				console.log(dataAttack);//['1_16_44_149']
				resolve();
			})
	}).then(()=> new Promise((resolve,reject)=>{
		client.hmget(stringHPos,arrayUnitPos,function(error,rowsPos){
			console.log(stringHPos,arrayUnitPos)
			// console.log("dataAttack "+dataAttack)
			console.log('rowsPos');
			console.log(rowsPos);
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
									// console.log('io,unit,posUnitElement')
									// console.log(io,unit,posUnitElement)
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