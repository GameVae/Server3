'use strict';
// var db_s1_base_info			= require('./../../Util/Database/Db_s1_base_info.js');
// var db_s1_base_defend		= require('./../../Util/Database/Db_s1_base_defend.js');

// var db_s2_base_info			= require('./../../Util/Database/Db_s2_base_info.js');
// var db_s2_base_defend		= require('./../../Util/Database/Db_s2_base_defend.js');

// var db_training				= require('./../../Util/Database/Db_training.js');
var db_position				= require('./../../Util/Database/Db_position.js');
// var db_all_user				= require('./../../Util/Database/Db_all_user.js');

// var functions 				= require('./../../Util/Functions.js');
// var Promise 				= require('promise');
var redis = require('redis');
var client = redis.createClient();
client.select(2);

var unitStatus ={
	Base: 			0,
	Move: 			1,
	Attack_Unit: 	2,
	Attack_Base: 	3,
	Attacked: 		4,
	Gathering: 		5,
	Standby: 		6,
}

exports.GetPosition = function getPosition (server_ID){
	getPosition_test (server_ID);
}


function deleteHashKey (server_ID) {
	var stringHkey = "s"+server_ID+"_pos";
	client.del(stringHkey);
}

function getPosition_test (server_ID) {
	deleteHashKey (server_ID);
	var stringQuery = "SELECT * FROM `s"+server_ID+"_unit` WHERE `Status`='"+unitStatus.Standby+"'";
	//console.log(stringQuery)
	db_position.query(stringQuery,function (error,rows) {
		/*lấy vị trí => lấy theo ID_Unit tính range*/
		for (var i = 0; i < rows.length; i++) {
			getRangeUnit (rows[i],server_ID)
		}
	});
}

function getRangeUnit (row,server_ID) {
	if (row.ID_Unit>15&&row.ID_Unit<20) {unitRange1 (row,server_ID);}
	if (row.ID_Unit>20&&row.ID_Unit<25) {unitRange2 (row,server_ID);}
	if (row.ID_Unit>25&&row.ID_Unit<30) {unitRange1 (row,server_ID);}
	if (row.ID_Unit>30&&row.ID_Unit<35) {unitRange3 (row,server_ID);}
}

function unitRange1 (row,server_ID) {
	var posCenter = row.Position_Cell;;
	var posX = parseInt(posCenter.split(",")[0]);
	var posY = parseInt(posCenter.split(",")[1]);

	var stringHkey = "s"+server_ID+"_pos";
	var stringKey=[];
	var ID_Key = server_ID+"_"+row.ID_Unit+"_"+row.ID_User+"_"+row.ID;
	
	stringKey[0] = row.Position_Cell;
	
	if (posY%2==0) {
		//even
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
		stringKey[6] = (posX-1) +","+(posY)+",0";
	}else{
		//odd
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
	}
	
	for (var i = 0; i < stringKey.length; i++) {
		checkValue (stringHkey,stringKey[i],ID_Key)
	 // removeValue (stringHkey,stringKey[i],ID_Key)
	}
}

function checkValue (stringHkey,stringKey,ID_Key) {
	client.hexists(stringHkey,stringKey,function (error,resultBool) {
		if (resultBool==1) {
			client.hget(stringHkey,stringKey,function (error,rows) {
				var result = rows.split("/");
				if (!result.includes(ID_Key)) {
					addValue (stringHkey,stringKey,rows,ID_Key);
				}
			});
		}else{
			addValue (stringHkey,stringKey,"",ID_Key);
		}
	});
}
function addValue (stringHkey,stringKey,rows,ID_Key) {
	client.hset(stringHkey,stringKey,rows+ID_Key+"/");
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
	var posCenter = row.Position_Cell;;
	var posX = parseInt(posCenter.split(",")[0]);
	var posY = parseInt(posCenter.split(",")[1]);

	var stringHkey = "s"+server_ID+"_pos";
	var stringKey=[];
	var ID_Key = server_ID+"_"+row.ID_Unit+"_"+row.ID_User+"_"+row.BaseNumber;
	
	stringKey[0] = row.Position_Cell;

	if (posY%2==0) {
		//even
		// new Vector3Int(-2, 0, 0),
		// new Vector3Int(-2,-1, 0),
		// new Vector3Int(-2, 1, 0),
		// new Vector3Int(-1,-2, 0),
		// new Vector3Int(-1, 2, 0),
		// new Vector3Int( 0,-2, 0),
		// new Vector3Int( 0, 2, 0),
		// new Vector3Int( 1, 2, 0),
		// new Vector3Int( 1,-2, 0),
		// new Vector3Int( 1,-1, 0),
		// new Vector3Int( 1, 1, 0),
		// new Vector3Int( 2, 0, 0),
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

	}else {
		//odd
		// new Vector3Int(-2, 0, 0),
		// new Vector3Int(-1,-1, 0),
		// new Vector3Int(-1, 1, 0),
		// new Vector3Int(-1,-2, 0),
		// new Vector3Int(-1, 2, 0),
		// new Vector3Int( 0,-2, 0),
		// new Vector3Int( 0, 2, 0),
		// new Vector3Int( 1,-2, 0),
		// new Vector3Int( 1, 2, 0),
		// new Vector3Int( 2,-1, 0),
		// new Vector3Int( 2, 1, 0),
		// new Vector3Int( 2, 0, 0),
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
	}

	for (var i = 0; i < stringKey.length; i++) {
		checkValue (stringHkey,stringKey[i],ID_Key);
	}
}

function unitRange3 (row,server_ID) {
	var posCenter = row.Position_Cell;;
	var posX = parseInt(posCenter.split(",")[0]);
	var posY = parseInt(posCenter.split(",")[1]);

	var stringHkey = "s"+server_ID+"_pos";
	var stringKey=[];
	var ID_Key = server_ID+"_"+row.ID_Unit+"_"+row.ID_User+"_"+row.BaseNumber;
	
	if (posY%2==0) {
		//even
		// new Vector3Int( -3, 0, 0),
		// new Vector3Int( -3, 1, 0),
		// new Vector3Int( -3,-1, 0),
		// new Vector3Int( -2, 2, 0),
		// new Vector3Int( -2,-2, 0),
		// new Vector3Int( -2, 3, 0),
		// new Vector3Int( -2,-3, 0),
		// new Vector3Int( -1, 3, 0),
		// new Vector3Int( -1,-3, 0),
		// new Vector3Int(  0, 3, 0),
		// new Vector3Int(  0,-3, 0),
		// new Vector3Int(  1, 3, 0),
		// new Vector3Int(  1,-3, 0),
		// new Vector3Int(  2, 2, 0),
		// new Vector3Int(  2,-2, 0),
		// new Vector3Int(  2, 1, 0),
		// new Vector3Int(  2,-1, 0),
		// new Vector3Int(  3, 0, 0),
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
	}else {
		//odd
		// new Vector3Int( -3, 0, 0),
		// new Vector3Int( -2, 1, 0),
		// new Vector3Int( -2,-1, 0),
		// new Vector3Int( -2, 2, 0),
		// new Vector3Int( -2,-2, 0),
		// new Vector3Int( -1, 3, 0),
		// new Vector3Int( -1,-3, 0),
		// new Vector3Int(  0, 3, 0),
		// new Vector3Int(  0,-3, 0),
		// new Vector3Int(  1, 3, 0),
		// new Vector3Int(  1,-3, 0),
		// new Vector3Int(  2, 3, 0),
		// new Vector3Int(  2,-3, 0),
		// new Vector3Int(  2, 2, 0),
		// new Vector3Int(  2,-2, 0),
		// new Vector3Int(  3, 1, 0),
		// new Vector3Int(  3,-1, 0),
		// new Vector3Int(  3, 0, 0),
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
	}

	for (var i = 0; i < stringKey.length; i++) {
		checkValue (stringHkey,stringKey[i],ID_Key);
	}
}