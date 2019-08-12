'use strict';
const   fs          = require('fs');
var path 			= require('path');



exports.UnitStatus = {
	Base: 			0,
	Move: 			1,
	Attack_Unit: 	2,
	Attack_Base: 	3,
	Attacked: 		4,
	Gathering: 		5,
	Standby: 		6,
}

exports.RedisData = {
	Data0 : 0,
	Data1 : 1,
	TestUnit : 2,
	Server: 2,
}
var redisData = {
	Data0 : 0,
	Data1 : 1,
	TestUnit : 2,
	Server: 2,
}
// var redis 				= require("redis"),
// client 					= redis.createClient();
// client.select(redisData.TestUnit);

exports.CaseClearAttack ={
	Full 		:1,
	ClearUnit 	:2,
}

exports.CaseUnitAttack={
	NoneAttack 	: 	0,
	Attacked 	: 	1,	
}
var Vectorcity = 2;
var StraightLine = Vectorcity*1400;
var DiagonalLine = Vectorcity*1262;
// var StraightTime = 1400;
// var DiagonalTime = 1262;
var StraightTime = StraightLine / Vectorcity;
var DiagonalTime = DiagonalLine / Vectorcity;
exports.CaseMove = {	
	Straight : 1,
	Diagonal : 2,
}
exports.TimeMove ={
	Straight : StraightTime,
	Diagonal : DiagonalTime,
}

exports.ShowLogBool = {
	Off: 0,
	On: 1,
	Error: 2,
	Check: 3,
	Clear: 4,
	LogChange: 5
}
var showLogBool = {
	Off: 0,
	On: 1,
	Error: 2,
	Check: 3,
	Clear: 4,
	LogChange: 5
}

exports.Test = function(para){
	console.log(para)
}

exports.ShowLog = function showLog (showBool,stringContent,param) {
	switch (showBool) {
		case showLogBool.Off:
		break;
		case showLogBool.On:
		var nullBool = false;
		for (var i = 0; i < param.length; i++) {
			if(param[i]==null||param[i]==undefined||param[i].length==0){
				nullBool = true;
				break;
			}
		}
		if (nullBool == true) {
			console.log('\x1b[33m%s\x1b[0m',"\n"+new Date()+": "+stringContent,param+"\n")
		}else{
			console.log(new Date()+": "+"\n"+stringContent,param+"\n")
		}		
		break;
		case showLogBool.Error:
		console.log('\x1b[31m%s\x1b[0m',"\n"+new Date()+": "+stringContent,param+"\n")
		fs.appendFile(getStringErrorFile (2), "\r\nError "+ getTimeNow() +": "+"\n"+stringContent+"\nParam: \n"+param, (err) => {
			if (err) throw err;
		});
		break;
		case showLogBool.Check:
		console.log('\x1b[34m%s\x1b[0m',"\n"+new Date()+": "+stringContent,param+"\n")
		break;
		case showLogBool.Clear:
		var nullBool = false;
		for (var i = 0; i < param.length; i++) {
			if(param[i]==null||param[i]==undefined||param[i].length==0){
				nullBool = true;
				break;
			}
		}
		if (nullBool == true) {
			console.log('\x1b[33m%s\x1b[0m',"\n"+new Date()+": "+stringContent,param+"\n")
		}else{
			// console.log(new Date()+": "+"\n"+stringContent,param+"\n")
		}		
		break;
		case showLogBool.LogChange:
		fs.appendFile(getStringChangeFile (2), "\r\n LogChangeDetail "+ getTimeNow() +": "+"\n"+stringContent+"\nParam: \n"+param, (err) => {
			if (err) throw err;
		});
		break;
	}
}
exports.AddValue = function (stringHKey,stringKey,stringAdd) {
	addValue (stringHKey,stringKey,stringAdd)
};
function addValue (stringHKey,stringKey,stringAdd) {
	client.hget(stringHKey,stringKey,function (error,rows) {
		if (rows!=null) {
			var result = rows.split("/").filter(String)
			if (!result.includes(stringAdd)) {
				client.hset(stringHKey,stringKey,rows+stringAdd+"/");
			}
		}else{
			client.hset(stringHKey,stringKey,stringAdd+"/");
		}
	})
}
exports.WriteLogError = function(detailError,intLocationFile){
	console.log(getTimeNow()+": Error "+detailError);
	fs.appendFile(getStringErrorFile (intLocationFile), "\r\n "+ getTimeNow() +": "+detailError, (err) => {
		if (err) throw err;
	});
}

exports.LogChange = function(logChangeDetail,intLocationFile){
	//console.log(getTimeNow()+": "+logChangeDetail);
	fs.appendFile(getStringChangeFile (intLocationFile), "\r\n logChangeDetail: "+ getTimeNow() +": "+logChangeDetail, (err) => {
		if (err) throw err;
	});
}

function getStringChangeFile (intLocationFile) {
	var stringTime ;
	switch (intLocationFile) {
		case 1:
		stringTime = "./LogChange/LogChange_"+getTimeNow().slice(0, 10);
		break;
		case 2:
		stringTime = "./../LogChange/LogChange_"+getTimeNow().slice(0, 10);
		break;
		case 3:
		stringTime = "./../../LogChange/LogChange_"+getTimeNow().slice(0, 10);
		break;
	}
	
	var caseHour = parseInt((new Date().getHours()-1)/8);
	var stringHour;
	switch (caseHour) {
		case 0:
		stringHour = "_0-8";
		break;
		case 1:
		stringHour = "_9-16";
		break;
		case 2:
		stringHour = "_17-23";
		break;
	}
	var stringFile = stringTime+stringHour+".txt";
	return stringFile;
}
function getStringErrorFile (intLocationFile) {
	//var stringTime = "./LogError/LogError_"+getTimeNow().slice(0, 10);
	//var stringTime = "./../LogError/LogError_"+getTimeNow().slice(0, 10);
	var stringTime;
	switch (intLocationFile) {
		case 1:
		stringTime = "./LogError/LogError_"+getTimeNow().slice(0, 10);
		break;
		case 2:
		stringTime = "./../LogError/LogError_"+getTimeNow().slice(0, 10);
		break;
	}
	
	var caseHour = parseInt((new Date().getHours()-1)/8);
	var stringHour;
	switch (caseHour) {
		case 0:
		stringHour = "_0-8";
		break;
		case 1:
		stringHour = "_9-16";
		break;
		case 2:
		stringHour = "_17-23";
		break;
	}
	var stringFile = stringTime+stringHour+".txt";
	return stringFile;
}

var getTimeNow = exports.GetTimeNow = function getTimeNow() {
	var retInt = new Date().toISOString();
	return retInt;     
}

exports.GetTime = function getTime() {
	var retInt = new Date().getTime();
	return retInt;     
}

exports.RandomPos = function randomPos (Dict_regionPostion) {
	
	var posX,posY,posRss;
	var minX,maxX,minY,maxY;
	var posRss;
	minX 	= Dict_regionPostion.minX;
	maxX 	= Dict_regionPostion.maxX;
	minY 	= Dict_regionPostion.minY;
	maxY 	= Dict_regionPostion.minY;
	
	posX 	= randomInt(minX,maxX);
	posY 	= randomInt(minY,maxY);
	posRss 	= posX+","+posY+","+0;
	return posRss;
}
exports.AddDict =function addDict (dictionary,key,value) {
	var pos = key;
	dictionary[pos] = value;
}
exports.CheckKey =function checkKey (dictionary,key) {
	var checkBool = false;
	if (key in dictionary) {checkBool = true;}
	return checkBool;
}
function randomInt (minInt,maxInt) {
	return Math.floor(Math.random() * (maxInt - minInt + 1)) + minInt;
}

exports.ExportTimeDatabase = function exportTimeDatabase (stringDaTaTime) {
	var stringTime = stringDaTaTime.toString();
	var timeReturn;
	if (stringTime.includes('Z')) {
		timeReturn = new Date(stringTime).getTime();
	}else{
		stringTime = stringDaTaTime+"Z";
		timeReturn = new Date(stringTime).getTime();
	}
	return timeReturn;
}

exports.ImportTimeToDatabase = function importTimeToDatabase (stringTime) {
	var stringReturn = stringTime.substring(0,stringTime.length - 1);
	return stringReturn;
}


// 'use strict';
// const   fs          = require('fs');
// var crypto          = require('crypto');
// var math            = require('mathjs');
// var lodash          = require('lodash');
// var Promise         = require('promise');
// const nodemailer    = require('nodemailer');
// var sqrt            = require( 'math-sqrt');




// var numberDistance, limitNumber = 200;


// exports.randomInt = function randomInt (low,high) {
//     return Math.floor(Math.random() * (high - low + 1) + low);
// }
// //Gọi trong login và move
// exports.getRandomIntInclusive = function getRandomIntInclusive(min, max)
// {
//     min = Math.ceil(min);
//     max = Math.floor(max);
//     return Math.floor(Math.random() * (max - min + 1)) + min;
// }

// exports.sendMail = function sendMail(mailOptions)
// {
//     let transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//             user: 'aloevera.hoang@gmail.com',
//             pass: '123456@A'
//         }
//     });

//     // setup email data with unicode symbols
//     // let mailOptions = {
//     //     from: '"Game VAE" <gameVae@demainvi.com>', // sender address
//     //     to: currentUser.email, // list of receivers
//     //     subject: 'Thông báo đăng kí tài khoản ✔', // Subject line
//     //     text: 'Đăng kí tài khoản thành công?', // plain text body
//     //     html: '<b>Bạn đã đăng kí tài khoản thành công với tên: '+currentUser.name+ ' và email:'+currentUser.email+'</b>' // html body
//     // };

//     // send mail with defined transport object
//     transporter.sendMail(mailOptions, (error, info) => 
//     {
//         if (error) {
//             return console.log(error);
//         }
//         console.log('Message %s sent: %s', info.messageId, info.response);
//     });

// }

// // làm tròn số theo đơn vị dương là tăng 1
// exports.isRoundNumberIncreaseX = function isRoundNumberIncreaseX(number) {  
//     var R;
//     if ((number % 1 ) === 0)
//     {
//         R = (parseFloat(number));
//     }else if ((number % 1 ) >= 0.5)
//     {
//         R = (Number((parseFloat(number)).toFixed(0)));
//     }else
//     {        
//         R = (Number((parseFloat(number)).toFixed(0))+1);
//     }
//     return R;
// } 

// // làm tròn số theo đơn vị dương là giảm 1
// exports.isRoundNumberDecreaseX = function isRoundNumberDecreaseX(number) {   
//     var R;    
//     if ((number % 1 ) === 0)
//     {
//         R = (parseFloat(number));
//     }else if ((number % 1 ) >= 0.5)
//     {
//         R= (Number((parseFloat(number)).toFixed(0))-1);        
//     }else
//     {
//         R= (Number((parseFloat(number)).toFixed(0)));        
//     }
//     return R;
// } 

// // làm tròn số theo đơn vị âm là tăng 1
// exports.isRoundNumberIncreaseZ = function isRoundNumberIncreaseZ(number) {  
//     var R;

//     if ((number % 1 ) === 0)
//     {
//         R = (parseFloat(number));
//     }else if ((number % 1 ) > -0.5)
//     {
//         R = (Number((parseFloat(number)).toFixed(0)));
//     }else
//     {        
//         R = (Number((parseFloat(number)).toFixed(0))+1);
//     }
//     return R;
// } 

// // làm tròn số theo đơn vị âm là giảm 1
// exports.isRoundNumberDecreaseZ = function isRoundNumberDecreaseZ(number) {   
//     var R;    
//     if ((number % 1 ) === 0)
//     {
//         R = (parseFloat(number));
//     }else if ((number % 1 ) > -0.5)
//     {
//         R= (Number((parseFloat(number)).toFixed(0))-1);        
//     }else
//     {
//         R= (Number((parseFloat(number)).toFixed(0)));        
//     }
//     return R;    
// } 

// //làm trỏn tọa độ theo số lẻ
// exports.isRoundNumberDecimal = function isRoundNumberDecimal(number) {  
//     var R;   
//     R = (Number((parseFloat(number)).toFixed(0)));   
//     return R;
// } 

// //Làm tròn tọa độ lẻ thành chẵn khi không đủ lương thực
// exports.getNewLocationClickWithFarm = function getNewLocationClickWithFarm(A,B,C)
// {
//     var arrA,arrB,arrC,X,Z;
//     arrA = A.split(",");
//     arrB = B.split(",");
//     arrC = C.split(",");       
//     if ((parseFloat(arrA[0])===parseFloat(arrB[0]))&&(parseFloat(arrA[1])>parseFloat(arrB[1])))
//     {        
//         X = arrA[0];
//         Z = exports.isRoundNumberDecreaseZ(arrC[1]);     
//     }else if((parseFloat(arrA[0])===parseFloat(arrB[0]))&&(parseFloat(arrA[1])<parseFloat(arrB[1]))) 
//     {        
//         X = arrA[0];        
//         Z = exports.isRoundNumberIncreaseZ(arrC[1]);        
//     }else if((parseFloat(arrA[0])<parseFloat(arrB[0]))&&(parseFloat(arrA[1])===parseFloat(arrB[1])) )
//     {        
//         X = exports.isRoundNumberIncreaseX(arrC[0]);
//         Z = arrA[1];               
//     }else if ((parseFloat(arrA[0])>parseFloat(arrB[0]))&&(parseFloat(arrA[1])===parseFloat(arrB[1])) )
//     {        
//         X = exports.isRoundNumberDecreaseX(arrC[0]);
//         Z = arrA[1]
//     }else if ((parseFloat(arrA[0])<parseFloat(arrB[0]))&&(parseFloat(arrA[1])>parseFloat(arrB[1])) )
//     {        
//         if( ((parseFloat(arrC[0])%1) < 0.099) 
//             || ((parseFloat(arrC[1])%1) > -0.099))
//         {            
//             //X chẵn, Z Lẽ
//             if (((parseFloat(arrC[0]))%1) < 0.099) 
//             {                
//                 X = arrC[0];   
//                 Z = exports.isRoundNumberDecimal(arrC[1]);
//             }
//             //X lẻ, Z chẵn
//             if (((parseFloat(arrC[1]))%1) > -0.099) 
//             {                
//                 X = exports.isRoundNumberDecimal(arrC[0]);   
//                 Z = arrC[1];
//             }
//         }else
//         {             
//             X = exports.isRoundNumberIncreaseX(arrC[0]);   
//             Z = exports.isRoundNumberDecreaseZ(arrC[1]);         
//         }        

//     }else if ((parseFloat(arrA[0])>parseFloat(arrB[0]))&&(parseFloat(arrA[1])<parseFloat(arrB[1])) )
//     {        
//         if( ((parseFloat(arrC[0])%1) < 0.099) 
//             || ((parseFloat(arrC[1])%1) > -0.099) )
//         {            
//             //X chẵn, Z Lẽ
//             if (((parseFloat(arrC[0]))%1) < 0.099) 
//             {               
//                 X = arrC[0];   
//                 Z = exports.isRoundNumberDecimal(arrC[1]);
//             }
//             //X lẻ, Z chẵn
//             if (((parseFloat(arrC[1]))%1) > -0.099) 
//             {                
//                 X = exports.isRoundNumberDecimal(arrC[0]);   
//                 Z = arrC[1];
//             }
//         }else
//         {             
//             X = exports.isRoundNumberDecreaseX(arrC[0]);
//             Z = exports.isRoundNumberIncreaseZ(arrC[1]);         
//         }     
//     }else if ((parseFloat(arrA[0])<parseFloat(arrB[0]))&&(parseFloat(arrA[1])<parseFloat(arrB[1]))) 
//     {        
//         if( ((parseFloat(arrC[0])%1) < 0.099) 
//             || ((parseFloat(arrC[1])%1) > -0.099) )
//         {            
//             //X chẵn, Z Lẽ
//             if (((parseFloat(arrC[0]))%1) < 0.099) 
//             {               
//                 X = arrC[0];   
//                 Z = exports.isRoundNumberDecimal(arrC[1]);
//             }
//             //X lẻ, Z chẵn
//             if (((parseFloat(arrC[1]))%1) > -0.099) 
//             {                
//                 X = exports.isRoundNumberDecimal(arrC[0]);   
//                 Z = arrC[1];
//             }
//         }else
//         {             
//             X = exports.isRoundNumberIncreaseX(arrC[0]);
//             Z = exports.isRoundNumberIncreaseZ(arrC[1]);       
//         }

//     }else 
//     {        
//         if( ((parseFloat(arrC[0])%1) < 0.099) 
//             || ((parseFloat(arrC[1])%1) > -0.099) )
//         {            
//             //X chẵn, Z Lẽ
//             if (((parseFloat(arrC[0]))%1) < 0.099) 
//             {               
//                 X = arrC[0];   
//                 Z = exports.isRoundNumberDecimal(arrC[1]);
//             }
//             //X lẻ, Z chẵn
//             if (((parseFloat(arrC[1]))%1) > -0.099) 
//             {                
//                 X = exports.isRoundNumberDecimal(arrC[0]);   
//                 Z = arrC[1];
//             }
//         }else
//         {             
//             X = exports.isRoundNumberDecreaseX(arrC[0]);
//             Z = exports.isRoundNumberDecreaseZ(arrC[1]);       
//         }        
//     }
//     return X+","+Z;    
// }

// //Làm tròn tọa độ lẻ thành chẵn khi không đủ lương thực(Trường hợp đang đi mà click qua chổ khác)
// exports.getNewLocationClickWithFarmMove = function getNewLocationClickWithFarmMove(A,B,C)
// {
//     var arrA,arrB,arrC,X,Z;
//     arrA = A.split(",");
//     arrB = B.split(",");
//     arrC = C.split(",");       
//     if ((parseFloat(arrA[0])===parseFloat(arrB[0]))&&(parseFloat(arrA[1])>parseFloat(arrB[1])))
//     {        
//         X = arrA[0];
//         Z = exports.isRoundNumberDecreaseZ(arrC[1]);     
//     }else if((parseFloat(arrA[0])===parseFloat(arrB[0]))&&(parseFloat(arrA[1])<parseFloat(arrB[1]))) 
//     {        
//         X = arrA[0];        
//         Z = exports.isRoundNumberIncreaseZ(arrC[1]);        
//     }else if((parseFloat(arrA[0])<parseFloat(arrB[0]))&&(parseFloat(arrA[1])===parseFloat(arrB[1])) )
//     {        
//         X = exports.isRoundNumberIncreaseX(arrC[0]);
//         Z = arrA[1];               
//     }else if ((parseFloat(arrA[0])>parseFloat(arrB[0]))&&(parseFloat(arrA[1])===parseFloat(arrB[1])) )
//     {        
//         X = exports.isRoundNumberDecreaseX(arrC[0]);
//         Z = arrA[1]
//     }else if ((parseFloat(arrA[0])<parseFloat(arrB[0]))&&(parseFloat(arrA[1])>parseFloat(arrB[1])) )
//     {        
//         X = exports.isRoundNumberIncreaseX(arrC[0]);   
//         Z = exports.isRoundNumberDecreaseZ(arrC[1]);            

//     }else if ((parseFloat(arrA[0])>parseFloat(arrB[0]))&&(parseFloat(arrA[1])<parseFloat(arrB[1])) )
//     {        
//         X = exports.isRoundNumberDecreaseX(arrC[0]);
//         Z = exports.isRoundNumberIncreaseZ(arrC[1]); 
//     }else if ((parseFloat(arrA[0])<parseFloat(arrB[0]))&&(parseFloat(arrA[1])<parseFloat(arrB[1]))) 
//     {        
//         X = exports.isRoundNumberIncreaseX(arrC[0]);
//         Z = exports.isRoundNumberIncreaseZ(arrC[1]);

//     }else 
//     {        
//         X = exports.isRoundNumberDecreaseX(arrC[0]);
//         Z = exports.isRoundNumberDecreaseZ(arrC[1]);       
//     }
//     return X+","+Z;
// }

// exports.getNewLocation = function getNewLocation(X,Z,N,M)
// {
//     if (M===0) 
//     {
//         numberDistance = parseInt(exports.getRandomIntInclusive(2, 6),10);
//     }else
//     {
//         numberDistance = parseInt(exports.getRandomIntInclusive(1, 4),10);
//     }

//     X = parseInt(X, 10);
//     Z = parseInt(Z, 10);
//     switch(N)
//     {
//         //random theo đường thẳng
//         case 1:
//         if(X>=0 && X<=(limitNumber - numberDistance))
//         {
//             X = X + numberDistance;
//         }
//         break;
//         case 2:
//         if(X>=numberDistance && X<=limitNumber)
//         {
//             X = X - numberDistance;
//         }
//         break;
//         case 3:
//         if(Z <= -numberDistance && Z>=-limitNumber)
//         {
//             Z = Z + numberDistance;
//         }
//         break;
//         case 4:
//         if(Z<=0 && Z>=(-limitNumber + numberDistance))
//         {
//             Z = Z - numberDistance;
//         }
//         break;
//         //random theo đường chéo
//         case 5:
//         if(X>=0 && X<=(limitNumber -numberDistance))
//         {
//             X = X + numberDistance;
//         }
//         if(Z<=0 && Z>=(-limitNumber + numberDistance))
//         {
//             Z = Z - numberDistance;
//         }
//         break;
//         case 6:
//         if(X>=0 && X<=(limitNumber - numberDistance))
//         {
//             X = X + numberDistance;
//         }
//         if(Z <= -numberDistance && Z>=-limitNumber)
//         {
//             Z = Z + numberDistance;
//         }
//         break;
//         case 7:
//         if(X>=numberDistance && X<=limitNumber)
//         {
//             X = X - numberDistance;
//         }
//         if(Z <= -numberDistance && Z>=-limitNumber)
//         {
//             Z = Z + numberDistance;
//         }
//         break;
//         case 8:
//         if(X>= numberDistance && X<=limitNumber)
//         {
//             X = X - numberDistance;
//         }
//         if(Z<=0 && Z>=(-limitNumber + numberDistance))
//         {
//             Z = Z - numberDistance;
//         }
//         break;
//     }
//     return X+","+Z;
// }
// //change Time to float
// function getNextTimeRest (nextTimeReset) {
//     var  currentTime = Math.floor(new Date().getTime()/1000);

// }
// exports.timeConverter = function timeConverter(UNIX_timestamp)
// {
//    var a = new Date(UNIX_timestamp * 1000);
//    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
//    var year = a.getFullYear();
//    var month = months[a.getMonth()];
//    var date = a.getDate();
//    var hour = a.getHours();
//    var min = a.getMinutes();
//    var sec = a.getSeconds();
//    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
//    return time;
// }
// exports.timeConverterResetMine=function timeConverterResetMine(UNIX_timestamp)
// {
//     var a = new Date(UNIX_timestamp * 1000);
//     var months = ['01','02','03','04','05','06','07','08','09','10','11','12'];
//     var year = a.getFullYear();
//     var month = months[a.getMonth()];
//     var date = a.getDate();
//     var hour = a.getHours();
//     var min = a.getMinutes();
//     var sec = a.getSeconds();
//     var time = month + '/' + date + '/' +  year + ' ' + hour + ':' + min + ':' + sec;
//     return time;
// }