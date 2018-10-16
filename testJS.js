// console.log(new Date().getHours());
// console.log(new Date().getUTCDay());
var datetime = require('node-datetime');
console.log(datetime.create().now().getUTCDay())



function getFileTime () {
	var date = new Date();
	var hour = new Date().getHours();

}

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