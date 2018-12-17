'use strict';
var Promise 			= require('promise'); 

var functions 			= require('./../../Util/Functions.js');

var db_position			= require('./../../Util/Database/Db_position.js');

var dictPos={
	'127,128,0':'128,128,0',
	'127,256,0':'128,256,0',
	'127,384,0':'128,384,0',
	'128,127,0':'128,128,0',
	'128,128,0':'128,128,0',
	'128,129,0':'128,128,0',
	'128,255,0':'128,256,0',
	'128,256,0':'128,256,0',
	'128,257,0':'128,256,0',
	'128,383,0':'128,384,0',
	'128,384,0':'128,384,0',
	'128,385,0':'128,384,0',
	'129,127,0':'128,128,0',
	'129,128,0':'128,128,0',
	'129,129,0':'128,128,0',
	'129,255,0':'128,256,0',
	'129,256,0':'128,256,0',
	'129,257,0':'128,256,0',
	'129,383,0':'128,384,0',
	'129,384,0':'128,384,0',
	'129,385,0':'128,384,0',
	'131,133,0':'128,128,0',
	'131,261,0':'128,256,0',
	'131,389,0':'128,384,0',
	'132,131,0':'128,128,0',
	'132,132,0':'128,128,0',
	'132,134,0':'128,128,0',
	'132,135,0':'128,128,0',
	'132,259,0':'128,256,0',
	'132,260,0':'128,256,0',
	'132,262,0':'128,256,0',
	'132,263,0':'128,256,0',
	'132,387,0':'128,384,0',
	'132,388,0':'128,384,0',
	'132,390,0':'128,384,0',
	'132,391,0':'128,384,0',
	'133,131,0':'128,128,0',
	'133,135,0':'128,128,0',
	'133,259,0':'128,256,0',
	'133,263,0':'128,256,0',
	'133,387,0':'128,384,0',
	'133,391,0':'128,384,0',
	'134,131,0':'128,128,0',
	'134,135,0':'128,128,0',
	'134,259,0':'128,256,0',
	'134,263,0':'128,256,0',
	'134,387,0':'128,384,0',
	'134,391,0':'128,384,0',
	'135,132,0':'128,128,0',
	'135,133,0':'128,128,0',
	'135,134,0':'128,128,0',
	'135,260,0':'128,256,0',
	'135,261,0':'128,256,0',
	'135,262,0':'128,256,0',
	'135,388,0':'128,384,0',
	'135,389,0':'128,384,0',
	'135,390,0':'128,384,0',
	'255,128,0':'256,64,0',
	'255,256,0':'256,256,0',
	'255,448,0':'256,448,0',
	'256,127,0':'256,64,0',
	'256,129,0':'256,64,0',
	'256,255,0':'256,256,0',
	'256,256,0':'256,256,0',
	'256,257,0':'256,256,0',
	'256,447,0':'256,448,0',
	'256,448,0':'256,448,0',
	'256,449,0':'256,448,0',
	'256,64,0':'256,64,0',
	'257,127,0':'256,64,0',
	'257,128,0':'256,64,0',
	'257,129,0':'256,64,0',
	'257,255,0':'256,256,0',
	'257,256,0':'256,256,0',
	'257,257,0':'256,256,0',
	'257,447,0':'256,448,0',
	'257,448,0':'256,448,0',
	'257,449,0':'256,448,0',
	'259,133,0':'256,64,0',
	'259,261,0':'256,256,0',
	'259,453,0':'256,448,0',
	'260,131,0':'256,64,0',
	'260,132,0':'256,64,0',
	'260,134,0':'256,64,0',
	'260,135,0':'256,64,0',
	'260,259,0':'256,256,0',
	'260,260,0':'256,256,0',
	'260,262,0':'256,256,0',
	'260,263,0':'256,256,0',
	'260,451,0':'256,448,0',
	'260,452,0':'256,448,0',
	'260,454,0':'256,448,0',
	'260,455,0':'256,448,0',
	'261,131,0':'256,64,0',
	'261,135,0':'256,64,0',
	'261,259,0':'256,256,0',
	'261,263,0':'256,256,0',
	'261,451,0':'256,448,0',
	'261,455,0':'256,448,0',
	'262,131,0':'256,64,0',
	'262,135,0':'256,64,0',
	'262,259,0':'256,256,0',
	'262,263,0':'256,256,0',
	'262,451,0':'256,448,0',
	'262,455,0':'256,448,0',
	'263,132,0':'256,64,0',
	'263,133,0':'256,64,0',
	'263,134,0':'256,64,0',
	'263,260,0':'256,256,0',
	'263,261,0':'256,256,0',
	'263,262,0':'256,256,0',
	'263,452,0':'256,448,0',
	'263,453,0':'256,448,0',
	'263,454,0':'256,448,0',
	'383,128,0':'384,128,0',
	'383,256,0':'384,256,0',
	'383,384,0':'384,384,0',
	'384,127,0':'384,128,0',
	'384,128,0':'384,128,0',
	'384,129,0':'384,128,0',
	'384,255,0':'384,256,0',
	'384,256,0':'384,256,0',
	'384,257,0':'384,256,0',
	'384,383,0':'384,384,0',
	'384,384,0':'384,384,0',
	'384,385,0':'384,384,0',
	'385,127,0':'384,128,0',
	'385,128,0':'384,128,0',
	'385,129,0':'384,128,0',
	'385,255,0':'384,256,0',
	'385,256,0':'384,256,0',
	'385,257,0':'384,256,0',
	'385,383,0':'384,384,0',
	'385,384,0':'384,384,0',
	'385,385,0':'384,384,0',
	'386,133,0':'384,128,0',
	'387,261,0':'384,256,0',
	'387,389,0':'384,384,0',
	'388,131,0':'384,128,0',
	'388,132,0':'384,128,0',
	'388,134,0':'384,128,0',
	'388,135,0':'384,128,0',
	'388,259,0':'384,256,0',
	'388,260,0':'384,256,0',
	'388,262,0':'384,256,0',
	'388,263,0':'384,256,0',
	'388,387,0':'384,384,0',
	'388,388,0':'384,384,0',
	'388,390,0':'384,384,0',
	'388,391,0':'384,384,0',
	'389,131,0':'384,128,0',
	'389,135,0':'384,128,0',
	'389,259,0':'384,256,0',
	'389,263,0':'384,256,0',
	'389,387,0':'384,384,0',
	'389,391,0':'384,384,0',
	'390,131,0':'384,128,0',
	'390,135,0':'384,128,0',
	'390,259,0':'384,256,0',
	'390,263,0':'384,256,0',
	'390,387,0':'384,384,0',
	'390,391,0':'384,384,0',
	'391,132,0':'384,128,0',
	'391,133,0':'384,128,0',
	'391,134,0':'384,128,0',
	'391,260,0':'384,256,0',
	'391,261,0':'384,256,0',
	'391,262,0':'384,256,0',
	'391,388,0':'384,384,0',
	'391,389,0':'384,384,0',
	'391,390,0':'384,384,0',
	'253, 256, 0':'256,256,0',
	'253, 257, 0':'256,256,0',
	'253, 255, 0':'256,256,0',
	'254, 258, 0':'256,256,0',
	'254, 254, 0':'256,256,0',
	'254, 259, 0':'256,256,0',
	'254, 253, 0':'256,256,0',
	'255, 259, 0':'256,256,0',
	'255, 253, 0':'256,256,0',
	'256, 259, 0':'256,256,0',
	'256, 253, 0':'256,256,0',
	'257, 259, 0':'256,256,0',
	'257, 253, 0':'256,256,0',
	'258, 258, 0':'256,256,0',
	'258, 254, 0':'256,256,0',
	'258, 257, 0':'256,256,0',
	'258, 255, 0':'256,256,0',
	'259, 256, 0':'256,256,0',
};
var lv1={
	Bot:{minX:0,maxX:512,minY:0,maxY:80,},
	Right:{minX:464,maxX:512,minY:80,maxY:512,},
	Top:{minX:0,maxX:464,minY:432,maxY:512,},
	Left:{minX:0,maxX:48,minY:80,maxY:432,},
}
var newPos,caseHour,locationPos, posLoc;


// createPos (1,function (returnValue) {
// 	console.log(returnValue)
// });

exports.CreatePos = function createPos (serverInt,returnValue) {
	var queryPos = "SELECT * FROM `s"+serverInt+"_position`";
	
	db_position.query(queryPos,function (error,rows) {
		if (!!error){DetailError = ('CreatePosition.js: queryPos');functions.WriteLogError(DetailError);}
		for (var i = 0; i < rows.length; i++) {
			addDict(dictPos,rows[i].Position_Cell,rows[i].Comment);
		}

		caseHour = parseInt((new Date().getHours()-1)/6);

		switch (caseHour) {
			case 1:
			posLoc = lv1.Bot;
			break;
			case 2:
			posLoc = lv1.Right;
			break;
			case 3:
			posLoc = lv1.Top;
			break;
			case 4:
			posLoc = lv1.Left;
			break;
		}
		newPos = randomPos(posLoc);
		while (checkKey(dictPos,newPos)==true) {
			newPos = randomPos (posLoc);
		}
		// console.log(newPos);
		// addDict(dictPos,newPos,'newPos')
		returnValue(newPos);
	});

}


function randomPos (Dict_regionPostion) {
	
	var posX,posY,posRss;
	var minX,maxX,minY,maxY;

	minX 	= Dict_regionPostion.minX;
	maxX 	= Dict_regionPostion.maxX;
	minY 	= Dict_regionPostion.minY;
	maxY 	= Dict_regionPostion.minY;
	
	posX 	= randomInt(minX,maxX);
	posY 	= randomInt(minY,maxY);
	posRss 	= posX+","+posY+","+0;
	return posRss;
}
function randomInt (minInt,maxInt) {
	return Math.floor(Math.random() * (maxInt - minInt + 1)) + minInt;
}
function addDict (dictionary,key,value) {
	var pos = key;
	dictionary[pos]=value;
}
function checkKey (dictionary,key) {
	var checkBool = false;
	if (key in dictionary) {checkBool = true;}
	return checkBool;
}
