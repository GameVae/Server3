var armyData 		= require("./Redis/Data/ArmyData.js");
var unitData 		= require("./Redis/Unit/Unit.js");

var db_training 	= require("./Util/Database/Db_training.js");

var functions 		= require('./Util/Functions.js');
var Promise 		= require('promise');

var redis = require("redis"),
client = redis.createClient();
client.select(functions.RedisData.TestUnit);

var positionData 	= require("./Redis/Position/Position.js");

// positionData.DeletePosKey(1)
// positionData.DeletePosKey(1);
getUnitDataPos (1);

getUnitMight (client);
unitData.GetUnitData(client,1);

clearMovingAttackData (1)
clearMoveData(1)
function clearMovingAttackData (server_ID) {
	var stringHMovingAttack = "s"+server_ID+"_movingAttack";
	client.del(stringHMovingAttack,function (error) {
		if(!!error){console.log(error);}
	});
}
function clearMoveData (server_ID) {
	var stringHMove = "s"+server_ID+"_move";
	client.del(stringHMove,function (error) {
		if(!!error){console.log(error);}
	});
}

function getUnitDataPos (server_ID) {
	// console.log('server_ID: '+server_ID)
	// for (var i = 0; i < 36; i++) {
	// 	positionData.GetPosition(server_ID);
	// }
	
	new Promise((resolve,reject)=>{
		positionData.DeletePosKey(server_ID,resolve);
		
	}).then(()=>new Promise((resolve,reject)=>{
		for (var i = 0; i < 36; i++) {
			positionData.GetPosition(server_ID);
		}
	}))
}

function getUnitMight (client) {
	var stringQuery = "SELECT * FROM `unit`";
	var stringHkey = "unit_Might";
	db_training.query(stringQuery,function (error,rows) {
		for (var i = 0; i < rows.length; i++) {
			var stringKUnit = rows[i].ID_Unit;
			client.hset(stringHkey,stringKUnit,JSON.stringify(rows[i]));
		}
	});
}

// exports.UpdateUnitData = function updateUnitData (server_ID) {
// 	unitData.GetUnitData(client,server_ID)
// }
// function updateUnitData (client,server_ID) {
// 	unitData.GetUnitData(client,server_ID)
// }

// getPositionData (1);
// function getPositionData (server_ID) {
// 	positionData.DeletePosKey(server_ID);

// 	setTimeout(function (argument) {
// 		positionData.GetPosition(server_ID);
// 	}, 1000,server_ID)
// }



// // if you'd like to select database 3, instead of 0 (default), call
// // client.select(3, function() { /* ... */ });


// client.select(functions.RedisData.TestUnit);

// client.on("error", function (err) {
// 	console.log("Error " + err);
// });

// //armyData.SetLevelData(client,dataTest.dataTraining);//chỉ cần chạy 1 lần để lấy dữ liệu
// //armyData.GetLevelData(client,dataTest.dataTraining);
// //armyData.SetHLvData(client,dataTest.dataTraining);

// //unitData.UpdateData(client)




// // getRedisData (1);

// function getRedisData (server_ID) {
// 	new Promise((resolve,reject)=>{
// 		positionData.GetPosition(server_ID);
// 		resolve();
// 	}).then(()=>{
// 		console.log('finish get postion');
// 	})
// }

//  // unitData.GetUnitData(client,1)


// // test('489.80,0',function (returnBool) {
// // 	console.log(returnBool)
// // })
// // function test(Position,returnBool){
// // 	var checkBool = false;
// // 	var stringHkey = "s1_unit"
// // 	client.hvals(stringHkey,function (error,rows) {
// // 		// console.log(rows)
// // 		var result = JSON.parse(rows)

// // 		// for (var i = 0; i < result.length; i++) {
// // 		// 	if (result[i].Position_Cell==Position&&result[i].Status ==0) {
// // 		// 		checkBool = true;
// // 		// 		break;
// // 		// 	}
// // 		// }
// // 		// returnBool(checkBool);
// // 	})
// // }

// // var dataUnit ={
// // 	Server_ID: 	1,
// // 	ID: 		4,
// // 	ID_Unit: 	16,
// // 	ID_User: 	9
// // }
// // unitData.GetUnitValue(client,dataUnit)
// //unitData.GetAvgUnit(client);



// // client.set("string key", "string val", redis.print);
//  // client.hset("unit", "hashtest", "some value");
// // client.hset(["hash key", "hashtest 2", "some other value"], redis.print);
// // client.hkeys("hash key", function (err, replies) {
// //     console.log(replies.length + " replies:");
// //     replies.forEach(function (reply, i) {
// //         console.log("    " + i + ": " + reply);
// //     });
// //     client.quit();
// // });