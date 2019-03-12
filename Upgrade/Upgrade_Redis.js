var functions = require("./../Util/Functions.js")

var redis = require("redis")
var client = redis.createClient();
client.select(functions.RedisData.TestUnit);

// var dataTest={
// 	default: 		0,
// 	dataTraining: 	1,
// 	dataUnit: 		2,
// }
// console.log(functions.RedisData)

exports.UpdateRedis_UnitInMap = function updateRedis_UnitInMap (data,levelUpgrade,dataUnitUpgrade,dataID) {
	var stringHkey = "s"+data.ID_Server+"_unit";
	var stringKey = data.ID_Server+"_"+data.ID_Upgrade+"_"+data.ID_User+"_"+dataID;

	client.hget(stringHkey,stringKey, function (error,rows) {
		if (!!error){DetailError = ('Upgrade_Redis.js: UpdateRedis_UnitInMap:stringHkey: '+stringHkey+"_stringKey: "+stringKey); functions.WriteLogError(DetailError,2);}
		var result = JSON.parse(rows);		
		result.Level = levelUpgrade;
		result.Health = dataUnitUpgrade.Health;
		result.Attack = dataUnitUpgrade.Attack;
		result.Defend = dataUnitUpgrade.Defend;
		client.hset(stringHkey,stringKey,JSON.stringify(result));
	});
}

// var data = { ID_Server: '1',
//   ID_User: '42',
//   BaseNumber: '1',
//   ID_Upgrade: '16',
//   UpgradeType: '1',
//   Level: '1' }
// var levelUpgrade = 2
// var dataUnitUpgrade = { Health: 5.45, Attack: 2.3, Defend: 1.15 }
// var dataID = 13
// updateRedis_UnitInMap (data,levelUpgrade,dataUnitUpgrade,dataID)

// function updateRedis_UnitInMap (data,levelUpgrade,dataUnitUpgrade,dataID) {
// 	var stringHkey = "s"+data.ID_Server+"_unit";
// 	var stringKey = data.ID_Server+"_"+data.ID_Upgrade+"_"+data.ID_User+"_"+dataID;

// 	client.hget(stringHkey,stringKey, function (error,rows) {
// 		var result = JSON.parse(rows);
		
// 		result.Level = levelUpgrade;
// 		result.Health = dataUnitUpgrade.Health;
// 		result.Attack = dataUnitUpgrade.Attack;
// 		result.Defend = dataUnitUpgrade.Defend;
// 		client.hset(stringHkey,stringKey,JSON.stringify(result));
// 	});
// }