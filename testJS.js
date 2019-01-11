// // // 

// // // var functions 			= require('./Util/Functions.js');
// // // var DetailError;

// // // var dataTest={
// // // 	UserName: 123456,
// // // 	Password: 'e10adc3949ba59abbe56e057f20f883e'
// // // }

// // // 1: (255, 256, 0)-1: (255, 255, 0)-1: (255, 257, 0)-1: (256, 257, 0)-1: (256, 255, 0)-1: (257, 256, 0)-
// // // 2: (254, 256, 0)-2: (254, 255, 0)-2: (254, 257, 0)-2: (255, 254, 0)-2: (255, 258, 0)-2: (256, 254, 0)-2: (256, 258, 0)-2: (257, 258, 0)-2: (257, 254, 0)-2: (257, 255, 0)-2: (257, 257, 0)-2: (258, 256, 0)-
// // // 3: (253, 256, 0)-3: (253, 257, 0)-3: (253, 255, 0)-3: (254, 258, 0)-3: (254, 254, 0)-3: (254, 259, 0)-3: (254, 253, 0)-3: (255, 259, 0)-3: (255, 253, 0)-3: (256, 259, 0)-3: (256, 253, 0)-3: (257, 259, 0)-3: (257, 253, 0)-3: (258, 258, 0)-3: (258, 254, 0)-3: (258, 257, 0)-3: (258, 255, 0)-3: (259, 256, 0)-



// // var dictRss={
// // 	currentRss:3,
// // 	1:'Farm',
// // 	2:'Wood',
// // 	3:'Stone',
// // 	4:'Metal',
// // }
// // var dictFarm5={
// // 	postion:'quality',
// // 	'256,256,0':'Center',
// // }
// // var dictWood5={
// // 	postion:'quality',
// // 	'256,256,0':'Center',
// // }
// // var dictStone5={
// // 	postion:'quality',
// // 	'256,256,0':'Center',
// // }
// // var dictMetal5={
// // 	postion:'quality',
// // 	'256,256,0':'Center',
// // }


// // function createRssLv (level) {
// // 	switch (level) {
// // 		case 5:
// // 		createLv5 ();
// // 		break;
// // 	}

// // }
// // var dict = {
// // 	'255,256,0':'Center',
// // 	'255,255,0':'Center',
// // 	'255,257,0':'Center',
// // 	'256,257,0':'Center',
// // 	'256,255,0':'Center',
// // 	'257,256,0':'Center',
// // 	key2: "value2"
// // };
// // var checkRandom = checkRandom();

// // function checkRandom () {
// // 	//  var posX,posY,posRss;

// // 	// posX = randomInt(255,257);
// // 	// posY = randomInt(255,257);
// // 	// posRss = posX+","+posY+","+0;
// // 	// console.log(posRss);
// // 	// console.log(checkKey(dict,posRss));
// // 	var posRss = randomPos (255,257,255,257);

// // 	while (checkKey(dict,posRss)==true) {
// // 		posRss = randomPos (255,257,255,257);
// // 		console.log(checkKey(dict,posRss));
// // 	}
// // 	addDict(dict,posRss,'test');
// // 	console.log(posRss);
// // 	console.log(dict);
// // }
// // function addDict (dictionary,key,value) {
// // 	var pos = key;
// // 	dictionary[pos]=value;
// // }
// // function randomPos (minX,maxX,minY,maxY) {
// // 	var posX,posY,posRss;
// // 	posX = randomInt(minX,maxX);
// // 	posY = randomInt(minY,maxY);
// // 	posRss = posX+","+posY+","+0;
// // 	return posRss;
// // }
// // function createLv5 () {
// // 	moveToNextRss (dictRss);
// // 	var posX,posY,posRss;
// // 	switch (dictRss.currentRss) {
// // 		case 1:


// // 		break;
// // 		case 2:

// // 		break;
// // 		case 3:

// // 		break;	
// // 		case 4:

// // 		break;	
// // 	}
// // }
// // function checkKey (dictionary,key) {
// // 	var checkBool = false;
// // 	if (key in dictionary) {checkBool = true;}
// // 	return checkBool;
// // }
// // function moveToNextRss (dictionary) {
// // 	dictionary.currentRss += 1;
// // 	if (dictionary.currentRss==5) {dictionary.currentRss=1;}
// // 	return dictionary;
// // }
// // function randomInt (minInt,maxInt) {
// // 	min = Math.ceil(minInt);
// // 	max = Math.floor(maxInt);
// // 	return Math.floor(Math.random() * (max - min + 1)) + min;
// // }
// // // dict['257,256,0']='Center';

// //  // addDict(dict,'255,257,0','Left')
// //  // console.log(dict);

// // // delete dict.key2;
// // // console.log(dict);

// // //var remove = removeDict (dict,'256,257,0')
// // // var check = checkKey (dict,'255,255,0')
// // // console.log(check)
// // // function checkKey (dictionary,key) {
// // // 	var checkBool = false
// // // 	if (key in dictionary) {checkBool = true;}
// // // 	return checkBool;
// // // }

// // // function removeDict (dictionary,key) {
// // // 	delete dictionary[key];
// // // }

// // // function addDict (dictionary,key,value) {
// // // 	var pos = key;
// // // 	dictionary[pos]=value;
// // // }
// // // var log = checkSameValue (dict['255,256,0'],dict['255,255,0'])
// // // //var log = checkSameValue (dict['255,256,0'],dict.key2)
// // // console.log(log);
// // // function checkSameValue (param1,param2) {
// // // 	console.log(param2)
// // // 	// if (param1===param2) {console.log(true)}else {console.log(false)}
// // // 	var retBool=false;
// // // 	if (param1===param2) {retBool=true};
// // // 	return retBool;
// // // }

// // 	// console.log(dict['255,256,0'])
// // 	// console.log(dict.key2)

// // // var test = S_NULL(dataTest);

// // // function S_NULL (data) {
// // // 	var queryString = "SELECT `BlockedTime` FROM `user_info` WHERE `UserName`='"+data.UserName+"'";
// // // 	db_all_user.query(queryString,function (error,rows) {
// // // 		// console.log('BlockedTime: '+rows[0].BlockedTime.getTime())
// // // 		// console.log('GetTime: '+functions.GetTime())
// // // 		// console.log('blocktime: '+(rows[0].BlockedTime.getTime() -functions.GetTime()))
// // // 		var blockTime = rows[0].BlockedTime.getTime() -functions.GetTime();
// // // 		if (blockTime>0) {
// // // 			setTimeout(function updateUser (data) {
// // // 				var updateSetTimeout = "UPDATE `user_info` SET `BlockedTime`= null WHERE `UserName`="+data.UserName;
// // // 				db_all_user.query(updateSetTimeout, function (error,result) {
// // // 					console.log(error);
// // // 				});
// // // 			}, blockTime, data);
// // // 		}


// // // 		// if (rows[0].BlockedForever==1) {
// // // 		// 	//socket.emit('R_BLOCKED',{BlockedForever:1,Time:0});
// // // 		// }
// // // 		// else if (rows[0].BlockedTime.getTime()>=functions.GetTime()) {
// // // 		// 	console.log('timeout: '+rows[0].BlockedTime.getTime()-functions.GetTime())
// // // 		// 	// check time => lấy time chenh lech => chay settimeout  doi voi time lon hon hien tai, con nho hon thi reset ve null, va doi bien blockForever 

// // // 		// 	//socket.emit('R_BLOCKED',{BlockedForever:0,Time:rows[0].BlockedTime});
// // // 		// }else{
// // // 		// 	console.log('timeout: '+rows[0].BlockedTime.getTime()-functions.GetTime())
// // // 		// 	// if (rows[0].Password==currentUser.Password) {
// // // 		// 	// 	//socket.emit(R_LOGIN,{LoginBool:1});
// // // 		// 	// }
// // // 		// 	// else{
// // // 		// 	// 	//socket.emit(R_LOGIN,{LoginBool:0});
// // // 		// 	// }

// // // 		// }
// // // 	});
// // // }




// // // function R_CHECK_DUPLICATE_LOGIN (data, retBool) {
// // // 	var queryCheckDuplicate = "SELECT `Socket` FROM `user_info` WHERE `UserName`='"+currentUser.UserName+"'";
// // // 	db_all_user.query(queryCheckDuplicate,function (error,rows) {
// // // 		if (!!error){DetailError = ('Login.js: R_CHECK_DUPLICATE_LOGIN queryUser :'+ data.UserName); functions.WriteLogError(DetailError);}
// // // 		if (rows[0].Socket!=null||rows[0].Socket!=socket.id) {
// // // 			LogChange='Login.js: DUPLICATE_LOGIN: '+data.UserName;functions.LogChange(LogChange);
// // // 		}
// // // 	});
// // // }
// // // function S_LOGIN (data) {
	
// // // 	//currentUser = getCurrentUser(data);
// // // 	var queryUserNamePass = "SELECT * FROM `user_info` WHERE `UserName`='"+data.UserName+"'";
// // // 	db_all_user.query(queryUserNamePass, function (error,rows) {
// // // 		if (!!error){DetailError = ('Login.js: Error queryUserNamePass');functions.WriteLogError(DetailError);}
// // // 		console.log(rows[0].BlockedTime.getTime())
// // // 		console.log(functions.GetTime())
// // // 		if (rows[0].BlockedTime.getTime()>=functions.GetTime()) {
// // // 			console.log('rows[0].BlockedTime>=functions.GetTimeNow()')
// // // 		}else{
// // // 			console.log('rows[0].BlockedTime<functions.GetTimeNow()')
// // // 		}
// // // 	});
// // // }


// // // console.log(R_CHECK_DUPLICATE_LOGIN(dataTest));

// // // function queryData (data) {
// // // 	var queryString = "SELECT * FROM `user_info` WHERE `UserName`='"+data.UserName+"' OR `Email`='"+data.Email+"'";
// // // 	console.log('queryString: '+queryString);
// // // 	db_all_user.query(queryString,function(error,rows){
// // // 		if (!!error){DetailError = ('Register: S_REGISTER queryUser :'+ data.UserName); functions.WriteLogError(DetailError);}
// // // 		console.log('rows: '+rows.length);

// // // 	});
// // // }

// // // function R_CHECK_DUPLICATE_LOGIN (data) {
// // // 	var queryCheckDuplicate = "SELECT `Socket` FROM `user_info` WHERE `UserName`='"+data.UserName+"'";
// // // 	console.log('queryCheckDuplicate: '+queryCheckDuplicate);
// // // 	db_all_user.query(queryCheckDuplicate,function (error,rows) {
// // // 		if (!!error){DetailError = ('Login.js: R_CHECK_DUPLICATE_LOGIN queryUser :'+ data.UserName); functions.WriteLogError(DetailError);}

// // // 		if (rows[0].Socket!=null) {
// // // 			console.log("here")
// // // 		}

// // // 	});
// // // }

// // // // console.log(new Date().getHours());
// // // // console.log(new Date().getUTCDay());
// // // var datetime = require('node-datetime');
// // // console.log(datetime.create().now().getUTCDay())

// // // function getFileTime () {
// // // 	var date = new Date();
// // // 	var hour = new Date().getHours();

// // // }

// // // var fs = require('fs');
// // // var testApendFile =appendFile ("string") ;
// // // var testApendFile =appendFile ("string") ;

// // // function appendFile (content) {
// // // 	fs.appendFile('./LogError/LogError.txt', "\r\n"+content,function (err) {
// // // 		if (err) throw err;});
// // // }

// // // function appendFileName (content) {

// // // 	var fileName ='./LogError/LogError.txt';
// // // 	fs.appendFile(fileName, "\r\n"+content,function (err) {
// // // 		if (err) throw err;});
// // // }

// // // let firstDate = new Date("2018-10-09T09:53:24.793Z"),
// // //     secondDate = new Date("2018-12-09T09:53:24.793Z"),
// // //     timeDifference = secondDate.getTime() - firstDate.getTime();

// // // console.log(timeDifference/(1000 * 3600 * 24));
// // //console.log(getTimeNow());
// // //console.log(getTimeC());
// // //console.log(new Date("2018-10-10 01:59:34Z"));
// // // console.log(new Date().toUTCString());
// // // console.log(new Date().toISOString());
// // // let firstDate1 = new Date("2018-10-10T01:02:28.310Z").toISOString();
// // // console.log('new: '+ getHour("2018-10-10T15:02:28.310Z"));

// // // function getTimeC () {


// // // 	let firstDate = new Date("2018-10-10T01:02:28.310Z").toISOString().getHours();
// // // 	//let secondDate= new Date("2018-11-10T01:02:28.310Z").toISOString();
// // // 	var scDate = "2018-11-10T01:02:28.310"+"Z";
// // // console.log(scDate);
// // // var secondDate = new Date(scDate).toISOString();
// // // 	let timeDifference = new Date(secondDate).getTime() - (new Date(firstDate).getTime()) ;
// // // 	console.log('timeDifference: '+timeDifference);
// // // 	return timeDifference;
// // // }

// // // function getHour (stringTime) {
// // // 	var retInt = stringTime.slice(11, 13);
// // // 	return retInt;
// // // }

// // // let firstDate = new Date("2016/10/03"),
// // //     secondDate = new Date("2017/12/06"),
// // //     timeDifference = Math.abs(secondDate.getTime() - firstDate.getTime());

// // // console.log(timeDifference);
// // //37065600000
// // // var thisTest = getISOTime("2018-08-08");
// // // console.log(thisTest);

// // // function test() {
// // // 	console.log(GetTimeNowUTC_string());
// // // }

// // // function getTimeNow() {
// // // 	var retString = new Date();
// // // 	return retString;     
// // // }
// // // function GetTimeNowUTC_string() {
// // // 	var retUTC = new Date().toUTCString().slice(5, 26);
// // // 	return retUTC;
// // // }

// // // function getISOTime (stringISO_Time) {
// // // 	var retISOTime = new Date(stringISO_Time).toISOString().slice(0, 10);
// // // 	return retISOTime;
// // // }
// // // function getTime () {
	
// // // 	var retUTC = new Date("2018-08-08").toISOString()
// // // 	//"2018-08-08"
// // // 	console.log(retUTC);
// // // 	retUTC = new Date().toISOString()
// // // 	console.log(retUTC);
// // // 	console.log(new Date().toUTCString());
// // // 	console.log(new Date("10 Aug 2018").getTime());


// // // 	return retUTC;
// // // }



// //*
// // var Promise 			= require('promise');

// // var db_s1_base_info 	= require('./Util/Database/Db_s1_base_info.js');
// // var db_s1_base_defend 	= require('./Util/Database/Db_s1_base_defend.js');
// // var db_s2_base_info 	= require('./Util/Database/Db_s2_base_info.js');
// // var db_s2_base_defend 	= require('./Util/Database/Db_s2_base_defend.js');


// // getS1Pos(()=>{
// // 	console.log(pos1);
// // });

// // console.log(posSum);

// // function getS1Pos (result) {
// // 	console.log("here Register.js");
// // 	var queryString_s1Pos = "SELECT `Position` FROM `s1_rss` WHERE `Level`=1 ";
// // 	return new Promise((resolve,reject)=>{

// // 	});

// // 	db_rss.query(queryString_s1Pos,function (error,rows) {
// // 		for (var i = 0; i < rows.length; i++) {
// // 			pos1[rows[i].Position]="RSS";
// // 		}
// // 		result();
// // 	});

// //  }
// var db_rss				= require('./Util/Database/Db_rss.js');

// var pos1={
// 	'127,128,0':'128,128,0',
// 	'127,256,0':'128,256,0',
// 	'127,384,0':'128,384,0',
// 	'128,127,0':'128,128,0',
// 	'128,128,0':'128,128,0',
// 	'128,129,0':'128,128,0',
// 	'128,255,0':'128,256,0',
// 	'128,256,0':'128,256,0',
// 	'128,257,0':'128,256,0',
// 	'128,383,0':'128,384,0',
// 	'128,384,0':'128,384,0',
// 	'128,385,0':'128,384,0',
// 	'129,127,0':'128,128,0',
// 	'129,128,0':'128,128,0',
// 	'129,129,0':'128,128,0',
// 	'129,255,0':'128,256,0',
// 	'129,256,0':'128,256,0',
// 	'129,257,0':'128,256,0',
// 	'129,383,0':'128,384,0',
// 	'129,384,0':'128,384,0',
// 	'129,385,0':'128,384,0',
// 	'131,133,0':'128,128,0',
// 	'131,261,0':'128,256,0',
// 	'131,389,0':'128,384,0',
// 	'132,131,0':'128,128,0',
// 	'132,132,0':'128,128,0',
// 	'132,134,0':'128,128,0',
// 	'132,135,0':'128,128,0',
// 	'132,259,0':'128,256,0',
// 	'132,260,0':'128,256,0',
// 	'132,262,0':'128,256,0',
// 	'132,263,0':'128,256,0',
// 	'132,387,0':'128,384,0',
// 	'132,388,0':'128,384,0',
// 	'132,390,0':'128,384,0',
// 	'132,391,0':'128,384,0',
// 	'133,131,0':'128,128,0',
// 	'133,135,0':'128,128,0',
// 	'133,259,0':'128,256,0',
// 	'133,263,0':'128,256,0',
// 	'133,387,0':'128,384,0',
// 	'133,391,0':'128,384,0',
// 	'134,131,0':'128,128,0',
// 	'134,135,0':'128,128,0',
// 	'134,259,0':'128,256,0',
// 	'134,263,0':'128,256,0',
// 	'134,387,0':'128,384,0',
// 	'134,391,0':'128,384,0',
// 	'135,132,0':'128,128,0',
// 	'135,133,0':'128,128,0',
// 	'135,134,0':'128,128,0',
// 	'135,260,0':'128,256,0',
// 	'135,261,0':'128,256,0',
// 	'135,262,0':'128,256,0',
// 	'135,388,0':'128,384,0',
// 	'135,389,0':'128,384,0',
// 	'135,390,0':'128,384,0',
// 	'255,128,0':'256,64,0',
// 	'255,256,0':'256,256,0',
// 	'255,448,0':'256,448,0',
// 	'256,127,0':'256,64,0',
// 	'256,129,0':'256,64,0',
// 	'256,255,0':'256,256,0',
// 	'256,256,0':'256,256,0',
// 	'256,257,0':'256,256,0',
// 	'256,447,0':'256,448,0',
// 	'256,448,0':'256,448,0',
// 	'256,449,0':'256,448,0',
// 	'256,64,0':'256,64,0',
// 	'257,127,0':'256,64,0',
// 	'257,128,0':'256,64,0',
// 	'257,129,0':'256,64,0',
// 	'257,255,0':'256,256,0',
// 	'257,256,0':'256,256,0',
// 	'257,257,0':'256,256,0',
// 	'257,447,0':'256,448,0',
// 	'257,448,0':'256,448,0',
// 	'257,449,0':'256,448,0',
// 	'259,133,0':'256,64,0',
// 	'259,261,0':'256,256,0',
// 	'259,453,0':'256,448,0',
// 	'260,131,0':'256,64,0',
// 	'260,132,0':'256,64,0',
// 	'260,134,0':'256,64,0',
// 	'260,135,0':'256,64,0',
// 	'260,259,0':'256,256,0',
// 	'260,260,0':'256,256,0',
// 	'260,262,0':'256,256,0',
// 	'260,263,0':'256,256,0',
// 	'260,451,0':'256,448,0',
// 	'260,452,0':'256,448,0',
// 	'260,454,0':'256,448,0',
// 	'260,455,0':'256,448,0',
// 	'261,131,0':'256,64,0',
// 	'261,135,0':'256,64,0',
// 	'261,259,0':'256,256,0',
// 	'261,263,0':'256,256,0',
// 	'261,451,0':'256,448,0',
// 	'261,455,0':'256,448,0',
// 	'262,131,0':'256,64,0',
// 	'262,135,0':'256,64,0',
// 	'262,259,0':'256,256,0',
// 	'262,263,0':'256,256,0',
// 	'262,451,0':'256,448,0',
// 	'262,455,0':'256,448,0',
// 	'263,132,0':'256,64,0',
// 	'263,133,0':'256,64,0',
// 	'263,134,0':'256,64,0',
// 	'263,260,0':'256,256,0',
// 	'263,261,0':'256,256,0',
// 	'263,262,0':'256,256,0',
// 	'263,452,0':'256,448,0',
// 	'263,453,0':'256,448,0',
// 	'263,454,0':'256,448,0',
// 	'383,128,0':'384,128,0',
// 	'383,256,0':'384,256,0',
// 	'383,384,0':'384,384,0',
// 	'384,127,0':'384,128,0',
// 	'384,128,0':'384,128,0',
// 	'384,129,0':'384,128,0',
// 	'384,255,0':'384,256,0',
// 	'384,256,0':'384,256,0',
// 	'384,257,0':'384,256,0',
// 	'384,383,0':'384,384,0',
// 	'384,384,0':'384,384,0',
// 	'384,385,0':'384,384,0',
// 	'385,127,0':'384,128,0',
// 	'385,128,0':'384,128,0',
// 	'385,129,0':'384,128,0',
// 	'385,255,0':'384,256,0',
// 	'385,256,0':'384,256,0',
// 	'385,257,0':'384,256,0',
// 	'385,383,0':'384,384,0',
// 	'385,384,0':'384,384,0',
// 	'385,385,0':'384,384,0',
// 	'386,133,0':'384,128,0',
// 	'387,261,0':'384,256,0',
// 	'387,389,0':'384,384,0',
// 	'388,131,0':'384,128,0',
// 	'388,132,0':'384,128,0',
// 	'388,134,0':'384,128,0',
// 	'388,135,0':'384,128,0',
// 	'388,259,0':'384,256,0',
// 	'388,260,0':'384,256,0',
// 	'388,262,0':'384,256,0',
// 	'388,263,0':'384,256,0',
// 	'388,387,0':'384,384,0',
// 	'388,388,0':'384,384,0',
// 	'388,390,0':'384,384,0',
// 	'388,391,0':'384,384,0',
// 	'389,131,0':'384,128,0',
// 	'389,135,0':'384,128,0',
// 	'389,259,0':'384,256,0',
// 	'389,263,0':'384,256,0',
// 	'389,387,0':'384,384,0',
// 	'389,391,0':'384,384,0',
// 	'390,131,0':'384,128,0',
// 	'390,135,0':'384,128,0',
// 	'390,259,0':'384,256,0',
// 	'390,263,0':'384,256,0',
// 	'390,387,0':'384,384,0',
// 	'390,391,0':'384,384,0',
// 	'391,132,0':'384,128,0',
// 	'391,133,0':'384,128,0',
// 	'391,134,0':'384,128,0',
// 	'391,260,0':'384,256,0',
// 	'391,261,0':'384,256,0',
// 	'391,262,0':'384,256,0',
// 	'391,388,0':'384,384,0',
// 	'391,389,0':'384,384,0',
// 	'391,390,0':'384,384,0',
// 	'253, 256, 0':'256,256,0',
// 	'253, 257, 0':'256,256,0',
// 	'253, 255, 0':'256,256,0',
// 	'254, 258, 0':'256,256,0',
// 	'254, 254, 0':'256,256,0',
// 	'254, 259, 0':'256,256,0',
// 	'254, 253, 0':'256,256,0',
// 	'255, 259, 0':'256,256,0',
// 	'255, 253, 0':'256,256,0',
// 	'256, 259, 0':'256,256,0',
// 	'256, 253, 0':'256,256,0',
// 	'257, 259, 0':'256,256,0',
// 	'257, 253, 0':'256,256,0',
// 	'258, 258, 0':'256,256,0',
// 	'258, 254, 0':'256,256,0',
// 	'258, 257, 0':'256,256,0',
// 	'258, 255, 0':'256,256,0',
// 	'259, 256, 0':'256,256,0',
// };

// var lv1={
// 	Bot:{minX:0,maxX:512,minY:0,maxY:80,},
// 	Right:{minX:464,maxX:512,minY:80,maxY:512,},
// 	Top:{minX:0,maxX:464,minY:432,maxY:512,},
// 	Left:{minX:0,maxX:48,minY:80,maxY:432,},
// }
// // var lv1={
// // 	Bot:{minX:0,maxX:512,minY:0,maxY:80,},
// // 	Right:{minX:464,maxX:512,minY:80,maxY:512,},
// // 	Top:{minX:0,maxX:464,minY:432,maxY:512,},
// // 	Left:{minX:0,maxX:48,minY:80,maxY:432,},
// // 	quantityRss : 1400,
// // 	quantitySide : 350,
// // }

// // var pos2={};

// getPos_1();


// function getPos_1 () {
// 	return new Promise((resolve,reject)=>{
// 		var queryString_s1Pos = "SELECT `Position` FROM `s1_rss`";
// 		db_rss.query(queryString_s1Pos,function (error,rows) {
// 			for (var i = 0; i < rows.length; i++) {
// 				pos1[rows[i].Position]="RSS";
// 				addDict (pos1,rows[i].Position,"RSS");				
// 			}
// 			resolve();
// 		});
// 	}).then(()=>{
// 		return new Promise((resolve,reject)=>{

// 		});
// 	}).then(()=>{
// 		createPos (pos1);
// 	});
// }

// function createPos (dictionary) {
// 	var caseHour = parseInt((new Date().getHours()-1)/6);
// 	var posBase;
// 	switch (caseHour) {
// 		case 1:
// 		console.log("case 1");
// 		posBase = randomPos(lv1.Bot);
// 		while (checkKey(dictionary,posBase)==true) {
// 			posBase = randomPos(lv1.Bot);
// 		}
// 		break;
// 		case 2:
// 		console.log("case 2");
// 		posBase = randomPos (lv1.Top);
// 		while (checkKey(dictionary,posBase)==true) {
// 			posBase = randomPos(lv1.Top);
// 		}
// 		break;
// 		case 3:
// 		console.log("case 3");
// 		posBase = randomPos (lv1.Right);
// 		while (checkKey(dictionary,posBase)==true) {
// 			posBase = randomPos(lv1.Right);
// 		}
// 		break;
// 		case 4:
// 		console.log("case 4");
// 		posBase = randomPos (lv1.Left);
// 		while (checkKey(dictionary,posBase)==true) {
// 			posBase = randomPos(lv1.Left);
// 		}
// 		break;
// 	}
// 	addDict (pos1,posBase,"Base");
// 	//console.log(pos1);
// }
// function updateData (serverInt) {
// 	var stringServer = "s"+serverInt;
// }
// function randomPos (Dict_regionPostion) {
// 	var posX,posY,posRss;
// 	var minX,maxX,minY,maxY;

// 	minX = Dict_regionPostion.minX;
// 	maxX = Dict_regionPostion.maxX;
// 	minY = Dict_regionPostion.minY;
// 	maxY = Dict_regionPostion.minY;

// 	posX = randomInt(minX,maxX);
// 	posY = randomInt(minY,maxY);
// 	posRss = posX+","+posY+","+0;
// 	return posRss;
// }
// function randomInt (minInt,maxInt) {
// 	return Math.floor(Math.random() * (maxInt - minInt + 1)) + minInt;
// }
// function addDict (dictionary,key,value) {
// 	var pos = key;
// 	dictionary[pos]=value;
// }
// function checkKey (dictionary,key) {
// 	var checkBool = false;
// 	if (key in dictionary) {checkBool = true;}
// 	return checkBool;
// }


// var db_s1_base_upgrade	= require('./Util/Database/Db_s1_base_upgrade.js');
// Test(1,9);
// function Test (serverInt,ID_User) {
// 	stringTable_base_upgrade = "`s"+serverInt+"_base_upgrade`.`"+ID_User+"_01`";

// 	createNewTable_base_upgrade = "DROP TABLE IF EXISTS "+stringTable_base_upgrade+" ;"+
// 	"CREATE TABLE "+stringTable_base_upgrade+" ("+
// 	"`ID` int(2) NOT NULL, `Name_Upgrade` varchar(16) DEFAULT NULL,`Level` int(1) DEFAULT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8;"+
// 	"ALTER TABLE "+stringTable_base_upgrade+" ADD PRIMARY KEY (`ID`);"+
// 	"ALTER TABLE "+stringTable_base_upgrade+" MODIFY `ID` int(2) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48 ;"+
// 	"SET SQL_MODE='NO_AUTO_VALUE_ON_ZERO';"+
// 	"INSERT INTO "+stringTable_base_upgrade+"(`ID`, `Name_Upgrade`, `Level`) SELECT `ID`, `Name_Upgrade`, `Level` FROM `s1_base_upgrade`.`upgrade`;"
// 	console.log(createNewTable_base_upgrade);
// 	db_s1_base_upgrade.query(createNewTable_base_upgrade,function (error,result) {
// 		console.log(error)
// 	})
// }
// var testString1 = "2018-12-21T07:47:00.000Z";
// var testString2 = "2018-12-21T07:47:00.000";
// var testString3	="2018-12-21T00:47:00.000Z"
// // console.log("test:"+ new Date("2018-12-21T00:47:00.000Z").getTime())
// // console.log("test2:"+ new Date("2018-12-21T00:47:00.000").getTime())
// // console.log("currentTime:"+ new Date().getTime())

// 1545353220000
// 1545328020000
// console.log(exportTimeDatabase(testString1))
// console.log(exportTimeDatabase(testString2))
// console.log(exportTimeDatabase(testString3))
// function exportTimeDatabase (stringDaTaTime) {
// 	var stringTime = stringDaTaTime.toString();
// 	var timeReturn;
// 	if (stringTime.includes('Z')) {
// 		timeReturn = new Date(stringTime).getTime()
// 	}else{
// 		stringTime = stringDaTaTime+"Z";
// 		timeReturn = new Date(stringTime).getTime()
// 	}
// 	return timeReturn;
// }

// var db_s1_base_info			= require('./Util/Database/Db_s1_base_info.js');
// var db_s1_base_defend		= require('./Util/Database/Db_s1_base_defend.js');
// dataTraining={
// 	Server_ID: 			1,
// 	ID_User: 			9,
// 	BaseNumber: 		1,
// 	TrainingUnit_ID: 	1,
// 	TrainingTime: 		600,
// 	TrainingQuality: 	200,
// 	TrainingMight: 		220,
// }
// var stringQuery = "SELECT * FROM `"+dataTraining.ID_User+"` WHERE "+
//  "`BaseNumber`="+dataTraining.BaseNumber+" AND"+
//  "`TrainingUnit_ID`="+dataTraining.TrainingUnit_ID+" AND "+
// // "`TrainingTime`="+dataTraining.TrainingTime+","+
// "`TrainingQuality`="+dataTraining.TrainingQuality;
// // +","+
// // "`Training_Might`="+dataTraining.Training_Might;
// console.log(stringQuery)
// db_s1_base_info.query(stringQuery,function (error,rows) {
// 	if (rows==undefined) {console.log("here")}
// 	else{
// 		console.log(rows)
// 	}
// });
// var clearString = "UPDATE `"+dataTraining.ID_User+"` SET "+
// 	"`TrainingUnit_ID` = null, `TrainingTime`=null, `TrainingQuality`=null,`Training_Might`=null"
// 	+" WHERE `BaseNumber` = "+dataTraining.BaseNumber;
// console.log(clearString)
// db_s1_base_info.query(clearString, function (error,result) {
// 	console.log(error);
// })

// var db_all_friend		= require('./Util/Database/Db_all_friend.js');

// test(9)
// function test (ID_User) {
// 	var createNewFriendTable = "CREATE TABLE `"+ID_User+"` AS  (SELECT * FROM `friends`);"+
// 	"ALTER TABLE `"+ID_User+"` ADD PRIMARY KEY (`ID`);"+
// 	"ALTER TABLE `"+ID_User+"` MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT";
// 	console.log(createNewFriendTable)
// 	db_all_friend.query(createNewFriendTable,function (error,result) {
// 		console.log(error)
// 	})
// }


// var Promise 				= require('promise');
// var timeOut;
// Test1();
// function Test1 () {
// 	var queryString = "SELECT * FROM `s1_base_info`";
// 	db_s1_base_info.query(queryString,function (error,rows) {
// 		timeOut = setTimeout(function() {
// 			console.log('timeOut1');
// 			console.log(timeOut);
// 		}, 5000);

// 	});
// 	setTimeout(function() {
// 		console.log('clear');
// 		clearTimeout(timeOut);
// 	}, 3000);
// 	// new Promise((resolve,reject)=>{
// 	// 	db_s1_base_info.query(queryString,function (error,rows) {
// 	// 		timeOut = setTimeout(function() {
// 	// 			console.log('timeOut1');
// 	// 			console.log(timeOut);
// 	// 		}, 5000);
// 	// 		resolve();
// 	// 	});
// 	// }).then(()=>{
// 	// 	console.log('timeOut2');
// 	// 	console.log(timeOut);
// 	// });
	

// }

// Test2();
// function Test2 () {
// 	setTimeout(function() {
// 		console.log('timeOut');
// 		console.log(timeOut);
// 	}, 3000);

// }

// var tArray = [1,2,3,4,5]
// console.log(tArray[0])

// var Dic ={}

// Dic['9_1_1']=setTimeout(function  () {
// 	console.log('here');
// },5000)

// setTimeout(function  () {
// 	console.log('clearTimeout');
// 	clearTimeout(Dic['9_1_1'])

// },3000)

// var functions = require('./Util/Functions.js')
// var test = new Date().toISOString()

// console.log(test)

// var db_s1_base_info			= require('./Util/Database/Db_s1_base_info.js');
// var stringQuery = "UPDATE `9` SET `TrainingTime`='"+functions.ImportTimeToDatabase(test)+"' WHERE `ID`=1";
// console.log(stringQuery)
// db_s1_base_info.query(stringQuery, function (error,result) {
// 	console.log(error)
// })

var db_all_user			= require('./Util/Database/Db_all_user.js');

var dataInfo={};
r_base_info()

function r_base_info () {
	var stringQuery = "SELECT * FROM `game_info_s1`";
	db_all_user.query(stringQuery, function (error,rows) {
	
		
		for (var i = 0; i < rows.length; i++) {
			dataInfo[rows[i].ID]=rows[i];
			delete dataInfo[rows[i].ID].ID;	
		}
		console.log(dataInfo);
	});
}



// 		dbInfo.query(stringBase,function (error,rowsTableName) {
// 			if (rowsTableName!=undefined) {
// 				for (var i = 0; i < rowsTableName.length; i++) {
// 					var stringQuery = "SELECT `ID_User`,`BaseNumber`,`Position` FROM `"+rowsTableName[i].TABLE_NAME+"`";
// 					dbInfo.query(stringQuery,function (error,rows) {
// 						for (var i = 0; i < rows.length; i++) {
// 							playerData[rows[i].ID_User] = rows[i];
// 							//resolve()
// 						}
// console.log(playerData);
// 					//console.log(rows);

// 				});

// 					//
// 				}

// 			}
// 		});
// 	}).then(()=>{
// 		console.log(playerData);
// 	});
