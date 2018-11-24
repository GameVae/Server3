// var db_all_user			= require('./Util/Database/Db_all_user.js');

// var functions 			= require('./Util/Functions.js');
// var DetailError;

// var dataTest={
// 	UserName: 123456,
// 	Password: 'e10adc3949ba59abbe56e057f20f883e'
// }

// 1: (255, 256, 0)-1: (255, 255, 0)-1: (255, 257, 0)-1: (256, 257, 0)-1: (256, 255, 0)-1: (257, 256, 0)-
// 2: (254, 256, 0)-2: (254, 255, 0)-2: (254, 257, 0)-2: (255, 254, 0)-2: (255, 258, 0)-2: (256, 254, 0)-2: (256, 258, 0)-2: (257, 258, 0)-2: (257, 254, 0)-2: (257, 255, 0)-2: (257, 257, 0)-2: (258, 256, 0)-
// 3: (253, 256, 0)-3: (253, 257, 0)-3: (253, 255, 0)-3: (254, 258, 0)-3: (254, 254, 0)-3: (254, 259, 0)-3: (254, 253, 0)-3: (255, 259, 0)-3: (255, 253, 0)-3: (256, 259, 0)-3: (256, 253, 0)-3: (257, 259, 0)-3: (257, 253, 0)-3: (258, 258, 0)-3: (258, 254, 0)-3: (258, 257, 0)-3: (258, 255, 0)-3: (259, 256, 0)-



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
var checkRandom = checkRandom();

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
function moveToNextRss (dictionary) {
	dictionary.currentRss += 1;
	if (dictionary.currentRss==5) {dictionary.currentRss=1;}
	return dictionary;
}
function randomInt (minInt,maxInt) {
	min = Math.ceil(minInt);
	max = Math.floor(maxInt);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
// dict['257,256,0']='Center';

 // addDict(dict,'255,257,0','Left')
 // console.log(dict);

// delete dict.key2;
// console.log(dict);

//var remove = removeDict (dict,'256,257,0')
// var check = checkKey (dict,'255,255,0')
// console.log(check)
// function checkKey (dictionary,key) {
// 	var checkBool = false
// 	if (key in dictionary) {checkBool = true;}
// 	return checkBool;
// }

// function removeDict (dictionary,key) {
// 	delete dictionary[key];
// }

// function addDict (dictionary,key,value) {
// 	var pos = key;
// 	dictionary[pos]=value;
// }
// var log = checkSameValue (dict['255,256,0'],dict['255,255,0'])
// //var log = checkSameValue (dict['255,256,0'],dict.key2)
// console.log(log);
// function checkSameValue (param1,param2) {
// 	console.log(param2)
// 	// if (param1===param2) {console.log(true)}else {console.log(false)}
// 	var retBool=false;
// 	if (param1===param2) {retBool=true};
// 	return retBool;
// }

	// console.log(dict['255,256,0'])
	// console.log(dict.key2)

// var test = S_NULL(dataTest);

// function S_NULL (data) {
// 	var queryString = "SELECT `BlockedTime` FROM `user_info` WHERE `UserName`='"+data.UserName+"'";
// 	db_all_user.query(queryString,function (error,rows) {
// 		// console.log('BlockedTime: '+rows[0].BlockedTime.getTime())
// 		// console.log('GetTime: '+functions.GetTime())
// 		// console.log('blocktime: '+(rows[0].BlockedTime.getTime() -functions.GetTime()))
// 		var blockTime = rows[0].BlockedTime.getTime() -functions.GetTime();
// 		if (blockTime>0) {
// 			setTimeout(function updateUser (data) {
// 				var updateSetTimeout = "UPDATE `user_info` SET `BlockedTime`= null WHERE `UserName`="+data.UserName;
// 				db_all_user.query(updateSetTimeout, function (error,result) {
// 					console.log(error);
// 				});
// 			}, blockTime, data);
// 		}


// 		// if (rows[0].BlockedForever==1) {
// 		// 	//socket.emit('R_BLOCKED',{BlockedForever:1,Time:0});
// 		// }
// 		// else if (rows[0].BlockedTime.getTime()>=functions.GetTime()) {
// 		// 	console.log('timeout: '+rows[0].BlockedTime.getTime()-functions.GetTime())
// 		// 	// check time => lấy time chenh lech => chay settimeout  doi voi time lon hon hien tai, con nho hon thi reset ve null, va doi bien blockForever 

// 		// 	//socket.emit('R_BLOCKED',{BlockedForever:0,Time:rows[0].BlockedTime});
// 		// }else{
// 		// 	console.log('timeout: '+rows[0].BlockedTime.getTime()-functions.GetTime())
// 		// 	// if (rows[0].Password==currentUser.Password) {
// 		// 	// 	//socket.emit(R_LOGIN,{LoginBool:1});
// 		// 	// }
// 		// 	// else{
// 		// 	// 	//socket.emit(R_LOGIN,{LoginBool:0});
// 		// 	// }

// 		// }
// 	});
// }




// function R_CHECK_DUPLICATE_LOGIN (data, retBool) {
// 	var queryCheckDuplicate = "SELECT `Socket` FROM `user_info` WHERE `UserName`='"+currentUser.UserName+"'";
// 	db_all_user.query(queryCheckDuplicate,function (error,rows) {
// 		if (!!error){DetailError = ('Login.js: R_CHECK_DUPLICATE_LOGIN queryUser :'+ data.UserName); functions.WriteLogError(DetailError);}
// 		if (rows[0].Socket!=null||rows[0].Socket!=socket.id) {
// 			LogChange='Login.js: DUPLICATE_LOGIN: '+data.UserName;functions.LogChange(LogChange);
// 		}
// 	});
// }
// function S_LOGIN (data) {
	
// 	//currentUser = getCurrentUser(data);
// 	var queryUserNamePass = "SELECT * FROM `user_info` WHERE `UserName`='"+data.UserName+"'";
// 	db_all_user.query(queryUserNamePass, function (error,rows) {
// 		if (!!error){DetailError = ('Login.js: Error queryUserNamePass');functions.WriteLogError(DetailError);}
// 		console.log(rows[0].BlockedTime.getTime())
// 		console.log(functions.GetTime())
// 		if (rows[0].BlockedTime.getTime()>=functions.GetTime()) {
// 			console.log('rows[0].BlockedTime>=functions.GetTimeNow()')
// 		}else{
// 			console.log('rows[0].BlockedTime<functions.GetTimeNow()')
// 		}
// 	});
// }


// console.log(R_CHECK_DUPLICATE_LOGIN(dataTest));

// function queryData (data) {
// 	var queryString = "SELECT * FROM `user_info` WHERE `UserName`='"+data.UserName+"' OR `Email`='"+data.Email+"'";
// 	console.log('queryString: '+queryString);
// 	db_all_user.query(queryString,function(error,rows){
// 		if (!!error){DetailError = ('Register: S_REGISTER queryUser :'+ data.UserName); functions.WriteLogError(DetailError);}
// 		console.log('rows: '+rows.length);

// 	});
// }

// function R_CHECK_DUPLICATE_LOGIN (data) {
// 	var queryCheckDuplicate = "SELECT `Socket` FROM `user_info` WHERE `UserName`='"+data.UserName+"'";
// 	console.log('queryCheckDuplicate: '+queryCheckDuplicate);
// 	db_all_user.query(queryCheckDuplicate,function (error,rows) {
// 		if (!!error){DetailError = ('Login.js: R_CHECK_DUPLICATE_LOGIN queryUser :'+ data.UserName); functions.WriteLogError(DetailError);}

// 		if (rows[0].Socket!=null) {
// 			console.log("here")
// 		}

// 	});
// }

// // console.log(new Date().getHours());
// // console.log(new Date().getUTCDay());
// var datetime = require('node-datetime');
// console.log(datetime.create().now().getUTCDay())

// function getFileTime () {
// 	var date = new Date();
// 	var hour = new Date().getHours();

// }

// var fs = require('fs');
// var testApendFile =appendFile ("string") ;
// var testApendFile =appendFile ("string") ;

// function appendFile (content) {
// 	fs.appendFile('./LogError/LogError.txt', "\r\n"+content,function (err) {
// 		if (err) throw err;});
// }

// function appendFileName (content) {

// 	var fileName ='./LogError/LogError.txt';
// 	fs.appendFile(fileName, "\r\n"+content,function (err) {
// 		if (err) throw err;});
// }

// let firstDate = new Date("2018-10-09T09:53:24.793Z"),
//     secondDate = new Date("2018-12-09T09:53:24.793Z"),
//     timeDifference = secondDate.getTime() - firstDate.getTime();

// console.log(timeDifference/(1000 * 3600 * 24));
//console.log(getTimeNow());
//console.log(getTimeC());
//console.log(new Date("2018-10-10 01:59:34Z"));
// console.log(new Date().toUTCString());
// console.log(new Date().toISOString());
// let firstDate1 = new Date("2018-10-10T01:02:28.310Z").toISOString();
// console.log('new: '+ getHour("2018-10-10T15:02:28.310Z"));

// function getTimeC () {


// 	let firstDate = new Date("2018-10-10T01:02:28.310Z").toISOString().getHours();
// 	//let secondDate= new Date("2018-11-10T01:02:28.310Z").toISOString();
// 	var scDate = "2018-11-10T01:02:28.310"+"Z";
// console.log(scDate);
// var secondDate = new Date(scDate).toISOString();
// 	let timeDifference = new Date(secondDate).getTime() - (new Date(firstDate).getTime()) ;
// 	console.log('timeDifference: '+timeDifference);
// 	return timeDifference;
// }

// function getHour (stringTime) {
// 	var retInt = stringTime.slice(11, 13);
// 	return retInt;
// }

// let firstDate = new Date("2016/10/03"),
//     secondDate = new Date("2017/12/06"),
//     timeDifference = Math.abs(secondDate.getTime() - firstDate.getTime());

// console.log(timeDifference);
//37065600000
// var thisTest = getISOTime("2018-08-08");
// console.log(thisTest);

// function test() {
// 	console.log(GetTimeNowUTC_string());
// }

// function getTimeNow() {
// 	var retString = new Date();
// 	return retString;     
// }
// function GetTimeNowUTC_string() {
// 	var retUTC = new Date().toUTCString().slice(5, 26);
// 	return retUTC;
// }

// function getISOTime (stringISO_Time) {
// 	var retISOTime = new Date(stringISO_Time).toISOString().slice(0, 10);
// 	return retISOTime;
// }
// function getTime () {
	
// 	var retUTC = new Date("2018-08-08").toISOString()
// 	//"2018-08-08"
// 	console.log(retUTC);
// 	retUTC = new Date().toISOString()
// 	console.log(retUTC);
// 	console.log(new Date().toUTCString());
// 	console.log(new Date("10 Aug 2018").getTime());


// 	return retUTC;
// }