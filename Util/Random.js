var dictRss={
	currentRss:3,
	1:'Farm',
	2:'Wood',
	3:'Stone',
	4:'Metal',
}
var dictFarm5={
	postion:'quality',
	'256,256,0':'Center',
}
var dictWood5={
	postion:'quality',
	'256,256,0':'Center',
}
var dictStone5={
	postion:'quality',
	'256,256,0':'Center',
}
var dictMetal5={
	postion:'quality',
	'256,256,0':'Center',
}


function createRssLv (level) {
	switch (level) {
		case 5:
		createLv5 ();
		break;
	}
}
var dict = {
	'255,256,0':'Center',
	'255,255,0':'Center',
	'255,257,0':'Center',
	'256,257,0':'Center',
	'256,255,0':'Center',
	'257,256,0':'Center',
	key2: "value2"
};


function checkRandom () {
	//  var posX,posY,posRss;

	// posX = randomInt(255,257);
	// posY = randomInt(255,257);
	// posRss = posX+","+posY+","+0;
	// console.log(posRss);
	// console.log(checkKey(dict,posRss));
	var posRss = randomPos (255,257,255,257);

	while (checkKey(dict,posRss)==true) {
		posRss = randomPos (255,257,255,257);
		console.log(checkKey(dict,posRss));
	}
	addDict(dict,posRss,'test');
	console.log(posRss);
	console.log(dict);
}
function addDict (dictionary,key,value) {
	var pos = key;
	dictionary[pos]=value;
}
function randomPos (minX,maxX,minY,maxY) {
	var posX,posY,posRss;
	posX = randomInt(minX,maxX);
	posY = randomInt(minY,maxY);
	posRss = posX+","+posY+","+0;
	return posRss;
}
function createLv5 () {
	moveToNextRss (dictRss);
	var posX,posY,posRss;
	switch (dictRss.currentRss) {
		case 1:
		
		break;
		case 2:
		
		break;
		case 3:
		
		break;	
		case 4:

		break;	
	}
}
function checkKey (dictionary,key) {
	var checkBool = false;
	if (key in dictionary) {checkBool = true;}
	return checkBool;
}

function randomInt (minInt,maxInt) {
	return Math.floor(Math.random() * (maxInt - minInt + 1)) + minInt;
}


var level1_Pos = {
	bot:{minX:0,maxX:80,minY:0,maxY:512},
	right:{minX:80,maxX:512,minY:464,maxY:512},
	top: {minX:432,maxX:512,minY:0,maxY:464},
	left: {minX:80,maxX:432,minY:0,maxY:48}
}
var lv1_Pos={
	1:{minX:0,maxX:80,minY:0,maxY:512},
	2:{minX:80,maxX:512,minY:464,maxY:512},
	3: {minX:432,maxX:512,minY:0,maxY:464},
	4: {minX:80,maxX:432,minY:0,maxY:48},
	

}

// checkPos();

// function checkPos () {
	
// var checkPos = 4;

// console.log(lv1_Pos[checkPos]);
// }

console.log(splitPos('5,3'))

function splitPos (pos) {
	var X, Y;
	var posSplit = pos.split(",")
	

	return {
		X : pos.split(",")[0],
		Y : pos.split(",")[1]
	}
}

