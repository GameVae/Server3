var armyData 		= require("./Redis/Data/ArmyData.js");
var unitData 		= require("./Redis/Unit/Unit.js");

var redis = require("redis"),
client = redis.createClient();

// if you'd like to select database 3, instead of 0 (default), call
// client.select(3, function() { /* ... */ });

var dataTest={
	default: 		0,
	dataTraining: 	1,
	dataUnit: 		2,
}
client.select(dataTest.dataUnit);

client.on("error", function (err) {
	console.log("Error " + err);
});

//armyData.SetLevelData(client,dataTest.dataTraining);//chỉ cần chạy 1 lần để lấy dữ liệu
//armyData.GetLevelData(client,dataTest.dataTraining);
//armyData.SetHLvData(client,dataTest.dataTraining);
// unitData.GetUnitData(client,1)
//unitData.UpdateData(client)

var dataUnit ={
	Server_ID: 	1,
	ID: 		4,
	ID_Unit: 	16,
	ID_User: 	9
}
// unitData.GetUnitValue(client,dataUnit)
unitData.GetAvgUnit(client);



// client.set("string key", "string val", redis.print);
 // client.hset("unit", "hashtest", "some value");
// client.hset(["hash key", "hashtest 2", "some other value"], redis.print);
// client.hkeys("hash key", function (err, replies) {
//     console.log(replies.length + " replies:");
//     replies.forEach(function (reply, i) {
//         console.log("    " + i + ": " + reply);
//     });
//     client.quit();
// });