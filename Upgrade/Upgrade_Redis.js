var redis = require("redis")

var dataTest={
	default: 		0,
	dataTraining: 	1,
	dataUnit: 		2,
}
exports.UpdateRedis_UnitInMap = function updateRedis_UnitInMap (data,levelUpgrade,dataUnitUpgrade,dataID) {
	var client = redis.createClient();

	client.select(dataTest.dataUnit);

	client.on("error", function (err) {
		console.log("Error " + err);
	});

	var stringHkey = "s"+data.Server_ID+"_unit";
	var stringKey = data.Server_ID+"_"+data.ID_Upgrade+"_"+data.ID_User+"_"+dataID;

	client.hget(stringHkey,stringKey, function (error,rows) {
		var result = JSON.parse(rows);
		result.Level = levelUpgrade;
		result.Health = dataUnitUpgrade.Health;
		result.Attack = dataUnitUpgrade.Attack;
		result.Defend = dataUnitUpgrade.Defend;

		clientRedis.hset(stringHkey,stringKey,JSON.stringify(result));
		client.quit();
	});
}