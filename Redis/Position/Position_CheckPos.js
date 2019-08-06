'use strict';

// var db_position				= require('./../../Util/Database/Db_position.js');

var functions 				= require('./../../Util/Functions.js');
var Promise 				= require('promise');

var redis = require('redis');
var client = redis.createClient();
client.select(functions.RedisData.TestUnit);

exports.CheckPostion = function (stringKeyCheck,positionCheck){
	return  checkPostion (stringKeyCheck,positionCheck)
}
// var strinkey = '1_16_44_528';
// var pos = '296,7,0';
// var thisArr = getPosition (strinkey,pos)
// console.log(thisArr)

function checkPostion (stringKeyCheck,positionCheck) {

	var ID_Unit = stringKeyCheck.split("_")[1]
	var arrayPosition = [];
	console.log('stringKeyCheck')
	console.log(stringKeyCheck)
	console.log('positionCheck')
	console.log(positionCheck)

	if (ID_Unit>15&&ID_Unit<20) {
		arrayPosition = unitRange1Check (positionCheck);
	}
	if (ID_Unit>20&&ID_Unit<25) {
		arrayPosition = unitRange2Check (positionCheck);
	}
	if (ID_Unit>25&&ID_Unit<30) {
		arrayPosition = unitRange1Check (positionCheck);
	}
	if (ID_Unit>30&&ID_Unit<35) {
		arrayPosition = unitRange3Check (positionCheck);
	}
	return arrayPosition;
}

function unitRange1Check (positionCheck) {
	var posCenter = positionCheck.toString();
	var posX = parseInt(posCenter.split(",")[0]);
	var posY = parseInt(posCenter.split(",")[1]);
	var stringKey=[];	
	stringKey[0] = positionCheck;
	
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
	return stringKey;
}

function unitRange2Check (positionCheck) {
	// console.log(row,server_ID)
	var posCenter = positionCheck.toString();
	var posX = parseInt(posCenter.split(",")[0]);
	var posY = parseInt(posCenter.split(",")[1]);
	var stringKey=[];	
	stringKey[0] = positionCheck;
	
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
		stringKey[6] = (posX+1) +","+(posY)+",0";

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
	return stringKey;
}

function unitRange3Check (positionCheck) {
	// console.log(row,server_ID)
	var posCenter = positionCheck.toString();
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
	return stringKey;
}

exports.GetPosition = function getPosition2 (stringKeyCheck,positionCheck,returnPosArray){



	getPosition (stringKeyCheck,positionCheck,function (returnArrayPos) {
		returnPosArray(returnArrayPos);
	});
}

function getPosition (stringKeyCheck,positionCheck,returnArrayPos) {
	var ID_Unit = stringKeyCheck.split("_")[1]
	if (ID_Unit>15&&ID_Unit<20) {
		unitRange1 (positionCheck,function (returnArray) {
			returnArrayPos(returnArray);
		});
	}
	if (ID_Unit>20&&ID_Unit<25) {
		unitRange2 (positionCheck,function (returnArray) {
			returnArrayPos(returnArray);
		});
	}
	if (ID_Unit>25&&ID_Unit<30) {
		unitRange1 (positionCheck,function (returnArray) {
			returnArrayPos(returnArray);
		});
	}
	if (ID_Unit>30&&ID_Unit<35) {
		unitRange3 (positionCheck,function (returnArray) {
			returnArrayPos(returnArray);
		});
	}
}

function unitRange1 (positionCheck,returnArray) {
	var posCenter = positionCheck.toString();
	var posX = parseInt(posCenter.split(",")[0]);
	var posY = parseInt(posCenter.split(",")[1]);
	var stringKey=[];	
	stringKey[0] = positionCheck;

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

function unitRange2 (positionCheck,returnArray) {
	// console.log(row,server_ID)
	var posCenter = positionCheck.toString();
	var posX = parseInt(posCenter.split(",")[0]);
	var posY = parseInt(posCenter.split(",")[1]);
	var stringKey=[];	
	stringKey[0] = positionCheck;

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

function unitRange3 (positionCheck,returnArray) {
	// console.log(row,server_ID)
	var posCenter = positionCheck.toString();
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