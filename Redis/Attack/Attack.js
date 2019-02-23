'use strict';
var db_s1_base_info			= require('./../../Util/Database/Db_s1_base_info.js');
var db_s1_base_defend		= require('./../../Util/Database/Db_s1_base_defend.js');

var db_s2_base_info			= require('./../../Util/Database/Db_s2_base_info.js');
var db_s2_base_defend		= require('./../../Util/Database/Db_s2_base_defend.js');

var db_training				= require('./../../Util/Database/Db_training.js');
var db_position				= require('./../../Util/Database/Db_position.js');
var db_all_user				= require('./../../Util/Database/Db_all_user.js');

var functions 				= require('./../../Util/Functions.js');
var Promise 				= require('promise');

var counter = 1.2;
var dataA ={
	"ID":9,"ID_Unit":16,"Level":1,"ID_User":9,"BaseNumber":1,"Quality":3,"Hea_cur":5.2,"Health":5.2,"Attack":2.15,"Defend":1.1,"Position_Cell":"489,80,0","Next_Cell":null,"End_Cell":null,"TimeMoveNextCell":null,"ListMove":null,"Status":0,"Attack_Base_ID":null,"Attack_Unit_ID":null,"Attacked_ID":0
}

var dataB={
	"ID":10,"ID_Unit":16,"Level":1,"ID_User":9,"BaseNumber":1,"Quality":2,"Hea_cur":5.2,"Health":5.2,"Attack":2.15,"Defend":1.1,"Position_Cell":"489,81,0","Next_Cell":null,"End_Cell":null,"TimeMoveNextCell":null,"ListMove":null,"Status":6,"Attack_Base_ID":null,"Attack_Unit_ID":null,"Attacked_ID":0
}


// AttackCalc (dataA,dataB,function (returnValue) {
// 	console.log(returnValue);
// });


AttackCalc (dataA,dataB)

function AttackCalc (dataA,dataB) {
	var returnDataB = dataB;
	var returnData ={};
	var CounterAB =  checkCounter (dataA,dataB);
	var Dif = parseFloat(dataA.Quality/dataB.Quality).toFixed(2);
	var Hea_Lost_B = parseFloat((Dif * dataA.Attack * CounterAB) - dataB.Defend).toFixed(2);
	if (Hea_Lost_B<1) {Hea_Lost_B=1; }
	if (Hea_Lost_B < dataB.Hea_cur){dataB.Hea_cur -= Hea_Lost_B;}
	else if (Hea_Lost_B >= dataB.Hea_cur) {
		dataB.Hea_cur = parseFloat(dataB.Health - parseInt((Hea_Lost_B - dataB.Hea_cur)%dataB.Health)).toFixed(2);
		dataB.Quality = dataB.Quality -(parseInt((Hea_Lost_B - dataB.Hea_cur)/dataB.Health) +1);
	}
	if (dataB.Quality<0) {dataB.Quality = 0;}
	/*update Database*/
}

function checkCounter (dataA,dataB) {
	var counterAB=1;
	var unitA = returnCaseUnit (dataA.ID_Unit);
	var unitB = returnCaseUnit (dataB.ID_Unit);

	if (unitA==1 && unitB == 3) {counterAB = counter;}
	else if (unitA==3 && unitB == 2) {counterAB = counter;}
	else if (unitA==2 && unitB == 1) {counterAB = counter;}

	else if (unitA==3 && unitB == 1) {counterAB = parseFloat(1/counter).toFixed(2);}
	else if (unitA==2 && unitB == 3) {counterAB = parseFloat(1/counter).toFixed(2);}
	else if (unitA==1 && unitB == 2) {counterAB = parseFloat(1/counter).toFixed(2);}
	return counterAB;	
}

function returnCaseUnit (dataUnit) {
	var returnCase=0;
	if (dataUnit>15&&dataUnit<20) {returnCase=1;}
	else if (dataUnit>20&&dataUnit<25) {returnCase=2;}
	else if (dataUnit>25&&dataUnit<30) {returnCase=3;}
	else {returnCase = 4;}
	return returnCase;
}