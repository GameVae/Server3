'use strict';

// var db_position				= require('./../../Util/Database/Db_position.js');

var functions 				= require('./../../Util/Functions.js');
var Promise 				= require('promise');

var redis = require('redis');
var client = redis.createClient();
client.select(functions.RedisData.TestUnit);

exports.GetPosition = function getPosition2 (stringKeyCheck,returnPosArray){
	getPosition (stringKeyCheck,function (returnArrayPos) {
		returnPosArray(returnArrayPos);
	});
}

function getPosition (stringKeyCheck,returnArrayPos) {
	var ID_Unit = stringKeyCheck.split("_")[1]
	var server_ID = stringKeyCheck.split("_")[0];
	var stringHUnit = "s"+server_ID+"_unit";
	// console.log(ID_Unit,server_ID,stringHUnit)
	client.hget(stringHUnit, stringKeyCheck,function (error,rowsUnit) {
		var row = JSON.parse(rowsUnit);
		// console.log(stringKeyCheck)
		if (ID_Unit>15&&ID_Unit<20) {unitRange1 (row,function (returnArray) {
			returnArrayPos(returnArray);
		});}
		if (ID_Unit>20&&ID_Unit<25) {unitRange2 (row,function (returnArray) {
			returnArrayPos(returnArray);
		});}
		if (ID_Unit>25&&ID_Unit<30) {unitRange1 (row,function (returnArray) {
			returnArrayPos(returnArray);
		});}
		if (ID_Unit>30&&ID_Unit<35) {unitRange3 (row,function (returnArray) {
			returnArrayPos(returnArray);
		});}	
	})
}

// function unitRange1 (row,returnArray) {
// 	console.log(row)
// 	var posCenter = row.Position_Cell;
// 	var posX = parseInt(posCenter.split(",")[0]);
// 	var posY = parseInt(posCenter.split(",")[1]);
// 	var stringKey=[];	
// 	stringKey[0] = row.Position_Cell;
	
// 	if (posY%2==0) {
// 		stringKey[1] = (posX-1)+","+(posY)+",0";
// 		stringKey[2] = (posX)+","+(posY-1)+",0";
// 		stringKey[3] = (posX)+","+(posY+1)+",0";
// 		stringKey[4] = (posX+1)+","+(posY-1)+",0";
// 		stringKey[5] = (posX+1)+","+(posY+1)+",0";
// 		stringKey[6] = (posX+1)+","+(posY)+",0";
// 	}else{
// 		//odd		
// 		stringKey[1] = (posX-1) +","+posY+",0";
// 		stringKey[2] = (posX-1) +","+(posY-1)+",0";
// 		stringKey[3] = (posX-1) +","+(posY+1)+",0";
// 		stringKey[4] = (posX) +","+(posY+1)+",0";
// 		stringKey[5] = (posX) +","+(posY-1)+",0";
// 		stringKey[6] = (posX+1) +","+(posY)+",0";
		
// 	}
// 	// console.log(stringKey)
// 	returnArray(stringKey)
// }

function unitRange1 (row,returnArray) {
	// console.log(row)
	var posCenter = row.Position_Cell;
	// console.log(row)
	// if (row.TimeMoveNextCell==null) {posCenter = row.End_Cell;}
	var posX = parseInt(posCenter.split(",")[0]);
	var posY = parseInt(posCenter.split(",")[1]);
	var stringKey=[];	
	stringKey[0] = row.Position_Cell;
	
	if (posY%2==0) {
		stringKey[1] = (posX-1)+","+(posY)+",0";
		stringKey[2] = (posX)+","+(posY-1)+",0";
		stringKey[3] = (posX)+","+(posY+1)+",0";
		stringKey[4] = (posX+1)+","+(posY-1)+",0";
		stringKey[5] = (posX+1)+","+(posY+1)+",0";
		stringKey[6] = (posX+1)+","+(posY)+",0";
	}else{
		//odd		
		stringKey[1] = (posX-1) +","+posY+",0";
		stringKey[2] = (posX-1) +","+(posY-1)+",0";
		stringKey[3] = (posX-1) +","+(posY+1)+",0";
		stringKey[4] = (posX) +","+(posY+1)+",0";
		stringKey[5] = (posX) +","+(posY-1)+",0";
		stringKey[6] = (posX+1) +","+(posY)+",0";
		
	}
	// console.log(stringKey)
	returnArray(stringKey)
}

function unitRange2 (row,returnArray) {
	// console.log(row,server_ID)
	var posCenter = row.Position_Cell;
	var posX = parseInt(posCenter.split(",")[0]);
	var posY = parseInt(posCenter.split(",")[1]);
	var stringKey=[];	
	stringKey[0] = row.Position_Cell;
	
	if (posY%2==0) {
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
	}else{
		//odd		
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
	// console.log(stringKey)
	returnArray(stringKey)
}

function unitRange3 (row,returnArray) {
	// console.log(row,server_ID)
	var posCenter = row.Position_Cell;
	var posX = parseInt(posCenter.split(",")[0]);
	var posY = parseInt(posCenter.split(",")[1]);
	var stringKey=[];	
		
	if (posY%2==0) {
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
	}else{
		//odd		
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
	// console.log(stringKey)
	returnArray(stringKey)
}