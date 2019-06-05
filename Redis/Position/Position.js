'use strict';

var db_position				= require('./../../Util/Database/Db_position.js');

var functions 				= require('./../../Util/Functions.js');
var Promise 				= require('promise');

var redis = require('redis');
var client = redis.createClient();
client.select(functions.RedisData.TestUnit);

// exports.Test = function Test (server_ID){
// 	console.log(server_ID);
// }
exports.GetPosition = function getPosition2 (server_ID){
	getPosition (server_ID);
}
exports.AddPosition = function addPosition (data) {
	getRangeUnit (data,data.Server_ID)
}
function getPosition (server_ID) {
	var stringQuery = "SELECT * FROM `s"+server_ID+"_unit` WHERE `Status`='"+functions.UnitStatus.Standby+"'";
	// console.log(stringQuery)
	db_position.query(stringQuery,function (error,rows) {
		// console.log(rows.length)
		/*lấy vị trí => lấy theo ID_Unit tính range*/
		for (var i = 0; i < rows.length; i++) {
			getRangeUnit (rows[i],server_ID);
		}
	});

	// var dataRows=[];
	// var stringKeyUnit=[];
	// new Promise((resolve,reject)=>{
	// 	db_position.query(stringQuery,function (error,rows) {
	// 		// console.log(rows.length)
	// 		lấy vị trí => lấy theo ID_Unit tính range
	// 		dataRows =rows;
	// 		resolve();
	// 	});
	// }).then(()=>new Promise((resolve,reject)=>{
	// 	for (var i = 0; i < dataRows.length; i++) {
	// 		getRangeUnit (dataRows[i],server_ID);
	// 	}
	// }))
	
}


exports.DeletePosKey = function deleteHashKey2 (server_ID,resolve) {
	deleteHashKey (server_ID,resolve);
}
function deleteHashKey (server_ID,resolve) {
	var stringHkey = "s"+server_ID+"_pos";
	client.del(stringHkey,function (error,result) {
		if (!!error) {console.log(error);}
		resolve()
	});

}
function getRangeUnit (row,server_ID) {
	if (row.ID_Unit>15&&row.ID_Unit<20) {unitRange1 (row,server_ID);}
	if (row.ID_Unit>20&&row.ID_Unit<25) {unitRange2 (row,server_ID);}
	if (row.ID_Unit>25&&row.ID_Unit<30) {unitRange1 (row,server_ID);}
	if (row.ID_Unit>30&&row.ID_Unit<35) {unitRange3 (row,server_ID);}
}

function unitRange1 (row,server_ID) {
	// console.log(row,server_ID)
	var posCenter = row.Position_Cell;
	var posX = parseInt(posCenter.split(",")[0]);
	var posY = parseInt(posCenter.split(",")[1]);

	var stringHkey = "s"+server_ID+"_pos";
	var stringKey=[];
	var ID_Key = server_ID+"_"+row.ID_Unit+"_"+row.ID_User+"_"+row.ID;
	
	stringKey[0] = row.Position_Cell;
	
	if (posY%2==0) {
		//even
		// new Vector3Int(-1, 0, 0),
		// new Vector3Int( 0,-1, 0),
		// new Vector3Int( 0, 1, 0),
		// new Vector3Int( 1,-1, 0),
		// new Vector3Int( 1, 1, 0),
		// new Vector3Int( 1, 0, 0),
		stringKey[1] = (posX-1)+","+(posY)+",0";
		stringKey[2] = (posX)+","+(posY-1)+",0";
		stringKey[3] = (posX)+","+(posY+1)+",0";
		stringKey[4] = (posX+1)+","+(posY-1)+",0";
		stringKey[5] = (posX+1)+","+(posY+1)+",0";
		stringKey[6] = (posX+1)+","+(posY)+",0";

	}else{
		//odd
		// new Vector3Int(-1, 0, 0),
		// new Vector3Int(-1,-1, 0),
		// new Vector3Int(-1, 1, 0),
		// new Vector3Int( 0, 1, 0),
		// new Vector3Int( 0,-1, 0),
		// new Vector3Int( 1, 0, 0),
		stringKey[1] = (posX-1) +","+posY+",0";
		stringKey[2] = (posX-1) +","+(posY-1)+",0";
		stringKey[3] = (posX-1) +","+(posY+1)+",0";
		stringKey[4] = (posX) +","+(posY+1)+",0";
		stringKey[5] = (posX) +","+(posY-1)+",0";
		stringKey[6] = (posX+1) +","+(posY)+",0";
		
	}
	// console.log(stringKey)
	for (var i = 0; i < stringKey.length; i++) {
		checkValue (stringHkey,stringKey[i],ID_Key);
	}
}

//getPosition_test (1)
//checkValue ("s1_pos","488,81,0","1_16_9_10")

function checkValue (stringHkey,stringKey,ID_Key) {
	// console.log(stringHkey,stringKey,ID_Key)
	client.hexists(stringHkey,stringKey,function (error,resultBool) {
		if (resultBool==1) {
			client.hget(stringHkey,stringKey,function (error,rows) {
				// console.log(rows)
				var result = rows.split("/").filter(String);
				if (!result.includes(ID_Key)) {
					// console.log(rows,ID_Key)
					addValue (stringHkey,stringKey,rows,ID_Key);
				}
			});
		}else{
			// console.log('new')
			// console.log(stringHkey,stringKey,ID_Key)
			addValue (stringHkey,stringKey,"",ID_Key);
		}
	});
}

function addValue (stringHkey,stringKey,data,ID_Key) {
	// console.log(stringHkey,stringKey,data,ID_Key)
	client.hset(stringHkey,stringKey,data+ID_Key+"/");
}

function removeValue (stringHkey,stringKey,ID_Key) {
	client.hget(stringHkey,stringKey,function (error,rows) {
		var result = rows.split("/");
		if (result.includes(ID_Key)) {
			var stringReplace = rows.replace(ID_Key+"/","");
			client.hset(stringHkey,stringKey,stringReplace);
			if (stringReplace.length==0) {
				client.hdel(stringHkey,stringKey);
			}
		}
	});
}

function unitRange2 (row,server_ID) {
	var posCenter = row.Position_Cell;
	var posX = parseInt(posCenter.split(",")[0]);
	var posY = parseInt(posCenter.split(",")[1]);

	var stringHkey = "s"+server_ID+"_pos";
	var stringKey=[];
	var ID_Key = server_ID+"_"+row.ID_Unit+"_"+row.ID_User+"_"+row.BaseNumber;
	
	stringKey[0] = row.Position_Cell;

	if (posY%2==0) {
		//even
		stringKey[1] = (posX-1)+","+(posY)+",0";
		stringKey[2] = (posX)+","+(posY-1)+",0";
		stringKey[3] = (posX)+","+(posY+1)+",0";
		stringKey[4] = (posX+1)+","+(posY-1)+",0";
		stringKey[5] = (posX+1)+","+(posY+1)+",0";
		stringKey[6] = (posX+1)+","+(posY)+",0";
		
		stringKey[7] = (posX-2)+","+(posY)+",0";
		stringKey[8] = (posX-1)+","+(posY-1)+",0";
		stringKey[9] = (posX-1)+","+(posY+1)+",0";
		stringKey[10] = (posX-1)+","+(posY-2)+",0";
		stringKey[11] = (posX-1)+","+(posY+2)+",0";
		stringKey[12] = (posX)+","+(posY-2)+",0";
		stringKey[13] = (posX)+","+(posY+2)+",0";
		stringKey[14] = (posX+1)+","+(posY-2)+",0";
		stringKey[15] = (posX+1)+","+(posY+2)+",0";
		stringKey[16] = (posX+2)+","+(posY-1)+",0";
		stringKey[17] = (posX+2)+","+(posY+1)+",0";
		stringKey[18] = (posX+2)+","+(posY)+",0";

	}else {
		// odd
		stringKey[1] = (posX-1) +","+posY+",0";
		stringKey[2] = (posX-1) +","+(posY-1)+",0";
		stringKey[3] = (posX-1) +","+(posY+1)+",0";
		stringKey[4] = (posX) +","+(posY+1)+",0";
		stringKey[5] = (posX) +","+(posY-1)+",0";
		stringKey[6] = (posX-1) +","+(posY)+",0";

		stringKey[7] = (posX-2)+","+(posY)+",0";
		stringKey[8] = (posX-2)+","+(posY-1)+",0";
		stringKey[9] = (posX-2)+","+(posY+1)+",0";
		stringKey[10] = (posX-1)+","+(posY-2)+",0";
		stringKey[11] = (posX-1)+","+(posY+2)+",0";
		stringKey[12] = (posX)+","+(posY-2)+",0";
		stringKey[13] = (posX)+","+(posY+2)+",0";
		stringKey[14] = (posX+1)+","+(posY+2)+",0";
		stringKey[15] = (posX+1)+","+(posY-2)+",0";
		stringKey[16] = (posX+1)+","+(posY-1)+",0";
		stringKey[17] = (posX+1)+","+(posY+1)+",0";
		stringKey[18] = (posX+2)+","+(posY)+",0";
	}

	for (var i = 0; i < stringKey.length; i++) {
		checkValue (stringHkey,stringKey[i],ID_Key);
	}
}

function unitRange3 (row,server_ID) {
	var posCenter = row.Position_Cell;
	var posX = parseInt(posCenter.split(",")[0]);
	var posY = parseInt(posCenter.split(",")[1]);

	var stringHkey = "s"+server_ID+"_pos";
	var stringKey=[];
	var ID_Key = server_ID+"_"+row.ID_Unit+"_"+row.ID_User+"_"+row.BaseNumber;
	
	if (posY%2==0) {
		//odd		
		stringKey[0] = (posX-2)+","+(posY)+",0";
		stringKey[1] = (posX-1)+","+(posY-1)+",0";
		stringKey[2] = (posX-1)+","+(posY+1)+",0";
		stringKey[3] = (posX-1)+","+(posY-2)+",0";
		stringKey[4] = (posX-1)+","+(posY+2)+",0";
		stringKey[5] = (posX)+","+(posY-2)+",0";
		stringKey[6] = (posX)+","+(posY+2)+",0";
		stringKey[7] = (posX+1)+","+(posY-2)+",0";
		stringKey[8] = (posX+1)+","+(posY+2)+",0";
		stringKey[9] = (posX+2)+","+(posY-1)+",0";
		stringKey[10] = (posX+2)+","+(posY+1)+",0";
		stringKey[11] = (posX+2)+","+(posY)+",0";

		stringKey[12] = (posX-3)+","+(posY)+",0";
		stringKey[13] = (posX-2)+","+(posY+1)+",0";
		stringKey[14] = (posX-2)+","+(posY-1)+",0";
		stringKey[15] = (posX-2)+","+(posY+2)+",0";
		stringKey[16] = (posX-2)+","+(posY-2)+",0";
		stringKey[17] = (posX-1)+","+(posY+3)+",0";
		stringKey[18] = (posX-1)+","+(posY-3)+",0";
		stringKey[19] = (posX)+","+(posY+3)+",0";
		stringKey[20] = (posX)+","+(posY-3)+",0";
		stringKey[21] = (posX+1)+","+(posY+3)+",0";
		stringKey[22] = (posX+1)+","+(posY-3)+",0";
		stringKey[23] = (posX+2)+","+(posY+3)+",0";
		stringKey[24] = (posX+2)+","+(posY-3)+",0";
		stringKey[25] = (posX+2)+","+(posY+2)+",0";
		stringKey[26] = (posX+2)+","+(posY-2)+",0";
		stringKey[27] = (posX+3)+","+(posY+1)+",0";
		stringKey[28] = (posX+3)+","+(posY-1)+",0";
		stringKey[29] = (posX+3)+","+(posY)+",0";
	}else {		
		//even
		stringKey[0] = (posX-2)+","+(posY)+",0";
		stringKey[1] = (posX-2)+","+(posY-1)+",0";
		stringKey[2] = (posX-2)+","+(posY+1)+",0";
		stringKey[3] = (posX-1)+","+(posY-2)+",0";
		stringKey[4] = (posX-1)+","+(posY+2)+",0";
		stringKey[5] = (posX)+","+(posY-2)+",0";
		stringKey[6] = (posX)+","+(posY+2)+",0";
		stringKey[7] = (posX+1)+","+(posY+2)+",0";
		stringKey[8] = (posX+1)+","+(posY-2)+",0";
		stringKey[9] = (posX+1)+","+(posY-1)+",0";
		stringKey[10] = (posX+1)+","+(posY+1)+",0";
		stringKey[11] = (posX+2)+","+(posY)+",0";

		stringKey[12] = (posX-3)+","+(posY)+",0";
		stringKey[13] = (posX-3)+","+(posY+1)+",0";
		stringKey[14] = (posX-3)+","+(posY-1)+",0";
		stringKey[15] = (posX-2)+","+(posY+2)+",0";
		stringKey[16] = (posX-2)+","+(posY-2)+",0";
		stringKey[17] = (posX-2)+","+(posY+3)+",0";
		stringKey[18] = (posX-2)+","+(posY-3)+",0";
		stringKey[19] = (posX-1)+","+(posY+3)+",0";
		stringKey[20] = (posX-1)+","+(posY-3)+",0";
		stringKey[21] = (posX)+","+(posY+3)+",0";
		stringKey[22] = (posX)+","+(posY-3)+",0";
		stringKey[23] = (posX+1)+","+(posY+3)+",0";
		stringKey[24] = (posX+1)+","+(posY-3)+",0";
		stringKey[25] = (posX+2)+","+(posY+2)+",0";
		stringKey[26] = (posX+2)+","+(posY-2)+",0";
		stringKey[27] = (posX+2)+","+(posY+1)+",0";
		stringKey[28] = (posX+2)+","+(posY-1)+",0";
		stringKey[29] = (posX+3)+","+(posY)+",0";
	}

	for (var i = 0; i < stringKey.length; i++) {
		checkValue (stringHkey,stringKey[i],ID_Key);
	}
}