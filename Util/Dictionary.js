var dict = {
	'255,256,0':'Center',
	'255,255,0':'Center',
	'255,257,0':'Center',
	key2: "value2"
};

var x = 255;
var y = 255;
var pos = x+","+y+","+0;

console.log(pos);

var check = checkKey (dict,pos)
console.log(check)

function checkKey (dictionary,key) {
	var checkBool = false;
	if (key in dictionary) {checkBool = true;}
	return checkBool;
}

function addDict (dictionary,key,value) {
	var pos = key;
	dictionary[pos]=value;
}

function removeDict (dictionary,key) {
	delete dictionary[key];
}

function countLength (dictionary) {
	return Object.keys(dictionary).length;
}