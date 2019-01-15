'use strict';

var db_rss				= require('./../Util/Database/Db_rss.js');
var functions 			= require('./../Util/Functions.js');

var DetailError, LogChange;

var dictRss={
	currentRss:0,
	1:'Farm',
	2:'Wood',
	3:'Stone',
	4:'Metal',
	5:'Diamond',
};
var dictRssPos={};
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
var dictFarm={
	Level:'Quantity',
	1:250000,
	2:425000,
	3:900000,
	4:1600000,
	5:4150000,
}

var dictWood={
	Level:'Quantity',
	1:200000,
	2:350000,
	3:750000,
	4:1250000,
	5:3500000,
}

var dictStone={
	Level:'Quantity',
	1:180000,
	2:300000,
	3:700000,
	4:1200000,
	5:3000000,
}

var dictMetal={
	Level:'Quantity',
	1:125000,
	2:250000,
	3:500000,
	4:950000,
	5:2475000,
}
var lv1={
	Bot:{minX:0,maxX:512,minY:0,maxY:80,},
	Right:{minX:464,maxX:512,minY:80,maxY:512,},
	Top:{minX:0,maxX:464,minY:432,maxY:512,},
	Left:{minX:0,maxX:48,minY:80,maxY:432,},
	quantityRss : 1400,
	quantitySide : 350,
}
var lv2={
	Bot:{minX:32,maxX:480,minY:32,maxY:128,},
	Right:{minX:400,maxX:480,minY:128,maxY:480,},
	Top:{minX:32,maxX:400,minY:384,maxY:480,},
	Left:{minX:32,maxX:112,minY:128,maxY:384,},
	quantityRss : 400,
	quantitySide : 100,
}
var lv3={
	Bot:{minX:80,maxX:432,minY:112,maxY:192,},
	Right:{minX:320,maxX:432,minY:192,maxY:400,},
	Top:{minX:80,maxX:320,minY:320,maxY:400,},
	Left:{minX:80,maxX:192,minY:192,maxY:320,},
	quantityRss : 360,
	quantitySide : 90,
}
var lv4={
	Bot:{minX:144,maxX:368,minY:176,maxY:208,},
	Right:{minX:304,maxX:368,minY:208,maxY:336,},
	Top:{minX:144,maxX:304,minY:304,maxY:336,},
	Left:{minX:144,maxX:208,minY:208,maxY:304,},
	quantityRss : 200,
	quantitySide : 50,
}
var lv5 ={
	All:{minX:224,maxX:288,minY:224,maxY:288},
	quantitySide : 20,
}
//createResource ();

function createResource () {
	createLv (1);
	createLv (2);
	createLv (3);
	createLv (4);
	createLv (5);
	//console.log(dictRssPos);
	//console.log(dictPos);
	insertToDatabase (dictRssPos);
}

function insertToDatabase (dictionary) {
	var length = countLength(dictionary);
	var obj, queryString;
	
	//console.log(dictionary);

	for (var i = 0; i < length; i++) {
		obj = dictionary[Object.keys(dictionary)[i]];
		queryString = "INSERT INTO `s1_rss_test`(`RssType`, `Level`, `Position`, `Quality`, `Region_Position`) VALUES ('"
		+obj.RssType+"','"
		+obj.Level+"','"
		+Object.keys(dictionary)[i]+"','"
		+obj.Quality+"','"
		+obj.Region_Position+"')";

		db_rss.query(queryString,function (error,results) {
			if (!!error){DetailError = ('CreateRss.js: Error updateDatabase '+ queryString);functions.WriteLogError(DetailError,1);}
			LogChange='CreateRss.js: updateDatabase: '+queryString;functions.LogChange(LogChange,1);	
		});
	}
}
function countLength (dictionary) {
	return Object.keys(dictionary).length;
}
function createLv (level) {
	
	var quality,lvRss,quantitySide;
	var rssInfo= {};
	switch (level) {
		case 1:
		quantitySide = lv1.quantitySide;
		createPosRss (level,lv1.Bot,quantitySide,1);
		createPosRss (level,lv1.Right,quantitySide,2);
		createPosRss (level,lv1.Top,quantitySide,3);
		createPosRss (level,lv1.Left,quantitySide,4);
		break;
		case 2:
		quantitySide = lv2.quantitySide;
		createPosRss (level,lv2.Bot,quantitySide,1);
		createPosRss (level,lv2.Right,quantitySide,2);
		createPosRss (level,lv2.Top,quantitySide,3);
		createPosRss (level,lv2.Left,quantitySide,4);
		break;
		case 3:
		quantitySide = lv3.quantitySide;
		createPosRss (level,lv3.Bot,quantitySide,1);
		createPosRss (level,lv3.Right,quantitySide,2);
		createPosRss (level,lv3.Top,quantitySide,3);
		createPosRss (level,lv3.Left,quantitySide,4);
		break;
		case 4:
		quantitySide = lv4.quantitySide;
		createPosRss (level,lv4.Bot,quantitySide,1);
		createPosRss (level,lv4.Right,quantitySide,2);
		createPosRss (level,lv4.Top,quantitySide,3);
		createPosRss (level,lv4.Left,quantitySide,4);
		break;
		case 5:
		createPosRss (level,lv5.All,lv5.quantitySide,1);
		break;
	}
}
function createPosRss (level,regionPostion,quantitySide,region) {
	var quality,lvRss,quantitySide;
	var rssInfo ={};
	var posRss = randomPos (regionPostion.minX,regionPostion.maxX,regionPostion.minY,regionPostion.maxY);
	
	for (var i = 0; i < quantitySide; i++) {
		moveToNextRss (dictRss,4);
		while (checkKey(dictPos,posRss)==true) {
			posRss = randomPos (regionPostion.minX,regionPostion.maxX,regionPostion.minY,regionPostion.maxY);
		}
		switch (dictRss.currentRss) {
			case 1:
			quality = dictFarm[level];
			break;
			case 2:
			quality = dictWood[level];
			break;
			case 3:
			quality = dictStone[level];
			break;
			case 4:
			quality = dictMetal[level];
			break;
		}
		rssInfo={RssType:dictRss.currentRss,Level:level,Quality:quality,Region_Position:region};
		addDict(dictPos,posRss,rssInfo);
		addDict(dictRssPos,posRss,rssInfo);
		
	}

}
function moveToNextRss (dictionary,maxRssType) {
	dictionary.currentRss += 1;
	if (dictionary.currentRss==(maxRssType+1)) {dictionary.currentRss=1;}
	return dictionary;
}
function randomPos (minX,maxX,minY,maxY) {
	var posX,posY,posRss;
	posX = randomInt(minX,maxX);
	posY = randomInt(minY,maxY);
	posRss = posX+","+posY+","+0;
	return posRss;
}
function randomInt (minInt,maxInt) {
	return Math.floor(Math.random() * (maxInt - minInt + 1)) + minInt;
}
function checkKey (dictionary,key) {
	var checkBool = false;
	if (key in dictionary) {checkBool = true;}
	return checkBool;
}
function addDict (dictionary,key,value) {
	var pos = key;
	dictionary[pos]=value;
}

// //getRssInfo (1)
// function getRssInfo (server) {
// 	var serverData = 's'+server+'_rss_test';

// 	var queryString = "SELECT * FROM `"+serverData+"`";
// 	console.log(queryString);
// 	db_rss.query(queryString,function (error,rows) {
// 		console.log(rows)
// 	});
// }

