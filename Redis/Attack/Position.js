'use strict';

var funcAttack  		= require('./Attack.js')

var functions 			= require('./../../Util/Functions.js');
var Promise 			= require('promise');

var redis = require('redis');
var client = redis.createClient();
client.select(functions.RedisData.TestUnit);

var stringHUnit,stringHAttack;
checkAttackedUnit ('1_16_42_25')

function checkAttackedUnit (data) {
	// console.log(data)
	var server_ID = data.split("_")[0];
	stringHUnit = "s"+server_ID+"_unit";
	stringHAttack = "s"+server_ID+"_attack";
	// console.log(stringHUnit,stringHAttack);
	var ID_Defend;
	var arrayPos = [],returnPos= [],arrayUnitAttack=[];
	var canAttackBool = false;

	new Promise((resolve,reject)=>{	
		getRangeUnit (data,function (returnPosArray) {
			arrayPos = returnPosArray;
			//console.log(returnPosArray)
			resolve();
		});
	}).then(()=>new Promise((resolve,reject)=>{
		// console.log(arrayPos)
		getListPosAttack (data,function (returnUnitAttack) {
			arrayUnitAttack=returnUnitAttack;
			client.hmget(stringHUnit,returnUnitAttack,function (error,rows) {
				for (var i = 0; i < rows.length; i++) {
					returnPos.push(JSON.parse(rows[i]).Position_Cell)
				}
				resolve();
			});
		})
	}).then(()=>new Promise((resolve,reject)=>{	
		for (var i = 0; i < returnPos.length; i++) {
			if (arrayPos.includes(returnPos[i])) {
				canAttackBool= true;
				// console.log(i)
				ID_Defend = arrayUnitAttack[i];
				break;
			}
		}
		if (canAttackBool==true) {
			// console.log(ID_Defend)
			// funcAttack.SetAttackData(server_ID,ID_Defend,data)
		}else{
			console.log('not found unit to attack')
		}
		resolve();
	}).then(()=>new Promise((resolve,reject)=>{
		if (canAttackBool==true) {
			// funcAttack.AttackInterval(server_ID,ID_Defend);
		}
	})))
	);
}

function getListPosAttack (data,returnUnitAttack) {
	client.hget(stringHAttack,data,function (error,rows) {
		var result = rows.split("/").filter(String);
		// console.log(result)
		returnUnitAttack(result);
	});
}

function getRangeUnit (data,returnPosArray) {
	var ID_Unit = data.split("_")[1];
	if (ID_Unit>15&&ID_Unit<20) {
		unitRange1 (data,function (returnArray) {
			// console.log(returnArray)
			returnPosArray(returnArray)
		})
	}

	if (ID_Unit>20&&ID_Unit<25) {
		unitRange2 (data,function (returnArray) {
			// console.log(returnArray)
			returnPosArray(returnArray)
		})
	}

	if (ID_Unit>25&&ID_Unit<30) {
		unitRange1 (data,function (returnArray) {
			// console.log(returnArray)
			returnPosArray(returnArray)
		})
	};
	if (ID_Unit>30&&ID_Unit<35) {
		unitRange3 (data,function (returnArray) {
			// console.log(returnArray)
			returnPosArray(returnArray)
		})
	};

}

function unitRange1 (data,returnArray) {
	client.hget(stringHUnit,data,function (error,rows) {
		var result = JSON.parse(rows);

		var posCenter = result.Position_Cell;
		var posX = parseInt(posCenter.split(",")[0]);
		var posY = parseInt(posCenter.split(",")[1]);

		var stringKey=[];

		stringKey[0] = result.Position_Cell;

		if (posY%2==0) {
			//even
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
			stringKey[6] = (posX-1) +","+(posY)+",0";			
		}
		
		returnArray(stringKey)
	})
}

function unitRange2 (data,returnArray) {
	client.hget(stringHUnit,data,function (error,rows) {
		var result = JSON.parse(rows);

		var posCenter = result.Position_Cell;
		var posX = parseInt(posCenter.split(",")[0]);
		var posY = parseInt(posCenter.split(",")[1]);

		var stringKey=[];

		stringKey[0] = result.Position_Cell;
		
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
		returnArray(stringKey);
	});
}

function unitRange3 (data,returnArray) {
	client.hget(stringHUnit,data,function (error,rows) {
		var result = JSON.parse(rows);

		var posCenter = result.Position_Cell;
		var posX = parseInt(posCenter.split(",")[0]);
		var posY = parseInt(posCenter.split(",")[1]);

		var stringKey=[];
		if (posY%2==0) {
			//even
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
		returnArray(stringKey);		
	});	
}