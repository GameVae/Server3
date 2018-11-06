var db_all_user			= require('./Util/Database/Db_all_user.js');

var functions 			= require('./Util/Functions.js');
var DetailError;

var dataTest={
	UserName: 123456,
	Password: 'e10adc3949ba59abbe56e057f20f883e'
}

var test = S_NULL(dataTest);

function S_NULL (data) {
	var queryString = "SELECT `BlockedTime` FROM `user_info` WHERE `UserName`='"+data.UserName+"'";
	db_all_user.query(queryString,function (error,rows) {
		// console.log('BlockedTime: '+rows[0].BlockedTime.getTime())
		// console.log('GetTime: '+functions.GetTime())
		// console.log('blocktime: '+(rows[0].BlockedTime.getTime() -functions.GetTime()))
		var blockTime = rows[0].BlockedTime.getTime() -functions.GetTime();
		if (blockTime>0) {
			setTimeout(function updateUser (data) {
				var updateSetTimeout = "UPDATE `user_info` SET `BlockedTime`= null WHERE `UserName`="+data.UserName;
				db_all_user.query(updateSetTimeout, function (error,result) {
					console.log(error);
				});
			}, blockTime, data);
		}
		
		
		// if (rows[0].BlockedForever==1) {
		// 	//socket.emit('R_BLOCKED',{BlockedForever:1,Time:0});
		// }
		// else if (rows[0].BlockedTime.getTime()>=functions.GetTime()) {
		// 	console.log('timeout: '+rows[0].BlockedTime.getTime()-functions.GetTime())
		// 	// check time => lấy time chenh lech => chay settimeout  doi voi time lon hon hien tai, con nho hon thi reset ve null, va doi bien blockForever 

		// 	//socket.emit('R_BLOCKED',{BlockedForever:0,Time:rows[0].BlockedTime});
		// }else{
		// 	console.log('timeout: '+rows[0].BlockedTime.getTime()-functions.GetTime())
		// 	// if (rows[0].Password==currentUser.Password) {
		// 	// 	//socket.emit(R_LOGIN,{LoginBool:1});
		// 	// }
		// 	// else{
		// 	// 	//socket.emit(R_LOGIN,{LoginBool:0});
		// 	// }

		// }
	});
}




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