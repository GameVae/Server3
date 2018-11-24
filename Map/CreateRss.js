'use strict';

var db_s1_rss			= require('./../Util/Database/Db_s1_rss.js');
var functions 			= require('./../Util/Functions.js');

var DetailError, LogChange;

var dictRss={
	currentRss:0,
	1:'Farm',
	2:'Wood',
	3:'Stone',
	4:'Metal',
	5:'Diamond',
}
var dictRssPos={

}
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
	// createLv (1);
	// createLv (2);
	// createLv (3);
	// createLv (4);
	createLv (5);
	console.log(dictRssPos);

}
var dictTest = {
	'276,277,0': { RssType: 4, Quality: 2475000, Region_Position: 1 },
	'239,228,0': { RssType: 1, Quality: 4150000, Region_Position: 1 },
	'270,274,0': { RssType: 2, Quality: 3500000, Region_Position: 1 },
	'226,266,0': { RssType: 3, Quality: 3000000, Region_Position: 1 },
	'271,229,0': { RssType: 4, Quality: 2475000, Region_Position: 1 },
	'241,250,0': { RssType: 1, Quality: 4150000, Region_Position: 1 },
	'262,246,0': { RssType: 2, Quality: 3500000, Region_Position: 1 },
	'249,268,0': { RssType: 3, Quality: 3000000, Region_Position: 1 },
	'246,231,0': { RssType: 4, Quality: 2475000, Region_Position: 1 },
	'234,284,0': { RssType: 1, Quality: 4150000, Region_Position: 1 },
	'267,238,0': { RssType: 2, Quality: 3500000, Region_Position: 1 },
	'238,278,0': { RssType: 3, Quality: 3000000, Region_Position: 1 },
	'245,232,0': { RssType: 4, Quality: 2475000, Region_Position: 1 },
	'251,236,0': { RssType: 1, Quality: 4150000, Region_Position: 1 },
	'267,227,0': { RssType: 2, Quality: 3500000, Region_Position: 1 },
	'238,275,0': { RssType: 3, Quality: 3000000, Region_Position: 1 },
	'245,258,0': { RssType: 4, Quality: 2475000, Region_Position: 1 },
	'229,275,0': { RssType: 1, Quality: 4150000, Region_Position: 1 },
	'270,284,0': { RssType: 2, Quality: 3500000, Region_Position: 1 },
	'271,278,0': { RssType: 3, Quality: 3000000, Region_Position: 1 } 
}

//insertToDatabase (dictTest);
function insertToDatabase (dictionary) {
	var length = countLength(dictionary);
	var obj, queryString;
	for (var i = 0; i < length; i++) {
		obj = dictionary[Object.keys(dictionary)[i]];
		queryString = "INSERT INTO `s1_rss_test`(`RssType`, `Level`, `Position`, `Quality`, `Region_Position`) VALUES ('"
		+obj.RssType+"','"
		+obj.Level+"','"
		+Object.keys(dictionary)[i]+"','"
		+obj.Quality+"','"
		+obj.Region_Position+"')";

		db_s1_rss.query(queryString,function (error,results) {
			if (!!error){DetailError = ('CreateRss.js: Error updateDatabase');functions.WriteLogError(DetailError);}
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
		while (checkKey(dictRssPos,posRss)==true) {
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
		rssInfo={RssType:dictRss.currentRss,Level:level,Quality:quality,Region_Position:region}
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
// 	db_s1_rss.query(queryString,function (error,rows) {
// 		console.log(rows)
// 	});
// }

