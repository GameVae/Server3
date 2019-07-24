// var st = '1_16_44_527/1_16_44_505/1_16_44_504/1_16_43_575/'
// var result = st.split("/").filter(String)
// console.log(result)

var redis = require("redis"),
client = redis.createClient();
client.select(2)

// client.hmget('s1_unit','1_16_43_824',function (error,rows) {
// 	console.log(rows)
// })
var functions = require('./Util/Functions.js')
var Promise = require('promise');
var dataAttacka = ['1_16_44_678','1_16_43_824']
var dataDefendb = '1_16_42_552'

console.log(functions.RedisData.TestUnit)
// getAttackCalc (1,dataAttacka,dataDefendb)
function getAttackCalc (server_ID,dataAttack,dataDefend) {
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
		functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js getAttackCalc hget stringHUnit,dataDefend',[stringHUnit,dataDefend]);

		client.hget(stringHUnit,dataDefend,function (error,rows) {
			console.log(rows)
			if (rows!=null) {
				def = JSON.parse(rows);

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
		})

	}).then(()=>{

		if (clearBool==false) {
			new Promise((resolve,reject)=>{
				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js getAttackCalc hmget stringHUnit,dataAttack',[stringHUnit,dataAttack]);			
				client.hmget(stringHUnit,dataAttack,function (error,rows){
					rowsUnit = rows;

					if (rows!=null) {
						for (var i = 0; i < rows.length; i++) {
							if (rows[i]!=null&&defendAliveBool==true) {
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
									resultAttack.Status = 6;
									resultAttack.Attack_Unit_ID = null;
									
									var stringAttack = server_ID+"_"+resultAttack.ID_Unit+"_"+resultAttack.ID_User+"_"+resultAttack.ID;									
									client.hset(stringHUnit,stringAttack,JSON.stringify(resultAttack));
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
		}
		

	}).then(()=>{
		if (clearBool==false) {
			new Promise((resolve,reject)=>{
				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js getAttackCalc=>updateDataBaseQuality server_ID,def',[server_ID,def]);
				updateDataBaseQuality(server_ID,def);
				functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js getAttackCalc=>checkSocketClient dataDefend,def',[dataDefend,def]);
				checkSocketClient (io,dataDefend,def);

				if (def.Quality>0) {
					functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js getAttackCalc=>hset def.Quality>0 def',[def]);
					client.hset(stringHUnit,dataDefend,JSON.stringify(def));
				}else{
					functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js getAttackCalc=>positionRemove.PostionRemove dataDefend',[dataDefend]);
					positionRemove.PostionRemove(dataDefend);

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
				resolve();

			})
		}
	}).then(()=>{
		
		if (QualityLost>0) {
			functions.ShowLog(functions.ShowLogBool.On,'AttackFunc.js getAttackCalc=>updateMight_Kill QualityLost,dataAttack,dataDefend',[QualityLost,dataAttack,dataDefend]);
			updateMight_Kill (QualityLost,dataAttack,dataDefend);
		}

	})

}
// client.hmget("s1_attack",result,function (error,rows) {
// 	console.log(rows[0])
// 	if (rows[1]==null) {console.log('ok')}
// })
// console.log('\n2')
// console.log('2')
// var testObj ={}
// var test = []
// console.log(test)
// console.log('\x1b[36m%s\x1b[0m', 'info');
// var functions = require('./Util/Functions.js')
// var stringThis1="1,23"
// var stringThis2= stringThis1+"3,23"

// functions.ShowLog(1,"here",[stringThis1,stringThis2])
//test ()
// function test () {
// 	var k=0;
// 	new Promise((resolve,reject)=>{

// 		test1(k++);//0
// 		test1(k++);//1
// 		test1(k++);//2
// 		test1(k++);//3
// 		test1(k++);//4
// 		// test1(k++);//5
// 		// test1(k++);//6
// 		// test1(k++);//7
// 		// test1(k++);//8
// 		// test1(k++);//9

// 		resolve();

// 	}).then(()=>{
// 		return new Promise((resolve,reject)=>{
// 			if (k>5) {				
// 				return null;
// 			}else{
// 				test1(k++);
// 				test1(k++);
// 				test1(k++);
// 				return null;
// 			}
// 			resolve();
// 		})
// 	}).then(()=>{
// 		return new Promise((resolve,reject)=>{
// 			test1(k++);
// 			test1(k++);
// 			test1(k++);
// 			resolve();
// 		})
// 	})
// }

// function test1 (argument) {
// 	console.log(new Date()+argument)
// }
// var arrayUnitInPos2 = [ '1_16_44_527', '1_16_44_526', '1_16_43_580' ]
// client.hget('s1_attack','1_16_43_656',function (error,rows) {
// 	// console.log(rows)
// 	if (rows!=null) {console.log('here');}
// 	else{
// 		console.log('2')
// 	}
// })


//  test (arrayUnitInPos2)
// function test (arrayUnitInPos) {

// 	for (var i = 0; i < arrayUnitInPos.length; i++) {
// 		if (arrayUnitInPos[i].split("_")[2] == 43) {
// 			console.log('arrayUnitInPos[i]')
// 			console.log(arrayUnitInPos[i])
// 			arrayUnitInPos.splice(arrayUnitInPos.indexOf(arrayUnitInPos[i], 1))
// 		}
// 	}	
// 	console.log(arrayUnitInPos)
// }
// var data = { ID: 506,
//   ID_Unit: 16,
//   ID_User: 44,
//   BaseNumber: 1,
//   Level: 1,
//   Quality: 6,
//   Hea_cur: 5.2,
//   Health: 5.2,
//   Attack: 2.15,
//   Defend: 1.1,
//   Position_Cell: '299,9,0',
//   Next_Cell: null,
//   End_Cell: null,
//   TimeMoveNextCell: null,
//   TimeFinishMove: null,
//   ListMove: null,
//   Status: 6,
//   Attack_Base_ID: null,
//   Attack_Unit_ID: null,
//   AttackedBool: 0 }
// if(data.Attack_Unit_ID==null){console.log('here')}

// listIDUnitAttack = arrayUnitInPos;
// console.log('listIDUnitAttack1')
// console.log(listIDUnitAttack)

// if (listIDUnitAttack.length==0) {
// 	attackFunc.ClearInterAttack(stringKey,functions.CaseClearAttack.Full);
// }
// resolve();

// var list_ID_User = ['1_16_44_510','1_16_44_531','1_16_43_579']
// testProMise (list_ID_User)
// function testProMise (para) {
// 	var stringGet;
// 	new Promise((resolve,reject)=>{
// 		test(list_ID_User,function (callbackHere) {
// 			stringGet = callbackHere;
// 			resolve();
// 		})
// 	}).then(()=>new Promise((resolve,reject)=>{
// 		console.log(stringGet)
// 	}))
// }

// function test (para,callbackHere) {
// 	var stringHkey = "Htest";
// 	var stringKey = "test_"+para;
// 	client.hset(stringHkey,stringKey,para.toString(),function (error) {
// 		// console.log('here: '+para)
// 		callbackHere(para)
// 	})
// }
// checkListFriendData (list_ID_User,43,function (returnListUnit) {
// 	console.log(returnListUnit)	
// })
// // function checkListFriendData (List_ID_User,ID_Player,returnListBool) {
// // 	var checkBool = false;
// // 	var stringHkey = "all_friends";
// // 	var listBoolFriend=[];
// // 	client.hmget(stringHkey,List_ID_User,function (error,rows) {
// // 		// console.log(rows)		
// // 		for (var i = 0; i < rows.length; i++) {
// // 			if (rows[i]!=null) {
// // 				var result = rows[i].split("/").filter(String);
// // 				if (result.includes(ID_Player)) {checkBool=true;}	
// // 			}
// // 			listBoolFriend.push(checkBool);
// // 		}
// // 		returnListBool(listBoolFriend);
// // 	});
// // }
// function checkListFriendData (List_ID_User,ID_Player,returnListUnit) {
// 	// var checkBool = false;
// 	var stringHkey = "s1_unit";
// 	var listUnitIDAttack = [];
// 	var listUnitAttck  = [];
// 	for (var i = 0; i < List_ID_User.length; i++) {
// 		listUnitIDAttack.push(List_ID_User[i].split("_")[2]);
// 	}

// 	console.log (listUnitIDAttack)

// 	client.hmget(stringHkey,listUnitIDAttack,function (error,rows) {
// 		if (rows!=null) {			
// 			for (var i = 0; i < rows.length; i++) {

// 				if (rows[i]!=null) {
// 					var result = rows[i].split("/").filter(String);
// 					if (!result.includes(ID_Player)) {						
// 						listUnitAttck.push(List_ID_User[i]);
// 					}
// 				}else{
// 					listUnitAttck.push(List_ID_User[i]);
// 				}
// 			}

// 		}
// 		returnListUnit(listUnitAttck);
// 	});
// 	// console.log(listCheck.length)
// 	// client.hmget(stringHkey,listCheck,function (error,rows) {
// 	// 	console.log(rows)		
// 	// 	for (var i = 0; i < rows.length; i++) {
// 	// 		if (rows[i]!=null) {
// 	// 			var result = rows[i].split("/").filter(String);
// 	// 			if (result.includes(ID_Player)) {
// 	// 				checkBool=true;}	
// 	// 		}
// 	// 		listBoolFriend.push(checkBool);
// 	// 	}
// 	// 	returnListBool(listBoolFriend);
// 	// });
// }
