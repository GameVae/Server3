'use strict';
var functions 				= require('./Util/Functions.js');
var db_all_user 				=  require('./Util/Database/Db_all_user.js');
var db_all_harvest				=  require('./Util/Database/Db_all_harvest.js');

 test ()
function test () {
	var stringQuery = "SELECT * FROM `9` WHERE `Name_Upgrade` LIKE '%Harvesting'"
	var dataSend=[];
	db_all_harvest.query(stringQuery, function (error,rows) {
		if (!!error) {console.log(error);}
		for (var i = 0; i < rows.length; i++) {
			if (rows[i].StartTime!=null) {
				dataSend.push(rows[i])
			}	
		}
		console.log(dataSend.length)
	})

	// console.log(functions.ImportTimeToDatabase(new Date(functions.GetTime()).toISOString()));
}

// var listmove =[]
// console.log(JSON.parse(listmove))
// // var stringTest ="farmgarthering"
// var stringTest ="farmharvesting"
// var functions 				= require('./Util/Functions.js');
// var hpm = 65/60
// // 375
// console.log(375/60)
// console.log(6.25*60)
// console.log(375/hpm)
// console.log(parseInt(346.1538461538462*hpm))
// test()
// function test () {
// 	var startTime = functions.GetTime();
// 	var timeOut =  (375*60/(65))*1000
// var nodemailer    = require('nodemailer');
// var functions = require('./Util/Functions.js');

// reigister()
// function reigister () {
// 	  let transporter = nodemailer.createTransport({
// 	  	service: 'gmail',
// 	  	auth: {
// 	  		user: "testdemanvi@gmail.com",
// 	  		pass: "canthan112"
// 	  	}
// 	  });

//     // setup email data with unicode symbols
//     let mailOptions = {
//         from: '"Game VAE-Đăng ký tài khoản tại GameTest" <gameVae@demandvi.com>', // sender address
//         to: 'homanhquan87@gmail.com', // list of receivers
//         subject: 'Thông báo đăng kí tài khoản', // Subject line
//         text: '✔ Đăng kí tài khoản thành công', // plain text body
//         html: "<b>Bạn đã đăng kí tài khoản thành công với tên: 123 và email: homanhquan87@gmail.com'</b>"
//     };

//     // send mail with defined transport object
//     transporter.sendMail(mailOptions, (error, info) => 
//     {
//     	if (!!error) {
//     		// console.log('error')
//     		// console.log(error)
//     		functions.ShowLog(functions.ShowLogBool.Error,'SendMail.js Register mailOptions',[mailOptions]);}
//     	functions.ShowLog(functions.ShowLogBool.LogChange,'SendMail.js Register mailOptions',[mailOptions]);
//     	// console.log('Message %s sent: %s', info.messageId, info.response);
//     });
// }


// 	var endTime =  timeOut + startTime;
// 	console.log('startTime')
// 	console.log(startTime)
// 	console.log('endTime')
// 	console.log(endTime)

// 	console.log('timeOut')
// 	console.log(timeOut)
// 	var testTime = setTimeout(function () {
// 		console.log('functions.GetTime()')
// 		console.log(functions.GetTime())
// 	}, timeOut)
// }


// // test ()
// // function test () {

// // }
// // var unitT = '1_21_42_959'
// // var returnPosArraya = ['300,5,0','300,5,0','299,5,0','299,4,0','299,6,0','300,6,0','300,4,0','301,5,0','298,5,0','298,4,0','298,6,0','299,3,0','299,7,0','300,3,0','300,7,0','301,7,0','301,3,0','301,4,0','301,6,0','302,5,0']

// var redis = require("redis"),
// client = redis.createClient();
// client.select(2)
// // removeValueFriend ("44",'43')
// test ()
// function test () {
// 	var stringHUnit = "s1_unit"
// 	client.hget(stringHUnit,"1_17_42_957",function (error,rows) {
// 		var result = JSON.parse(rows)
// 		console.log(result.Position_Cell)
// 	})
// }
// 	client.hset(stringHGuild,ID_User,GuildID.toString());
// }

// var db_all_user				= require('./Util/Database/Db_all_user.js');
// var db_all_guild			= require('./Util/Database/Db_all_guild.js');
// var db_upgrade_database		= require('./Util/Database/Db_upgrade_database.js');

// var Promise = require('promise')

// test ()
// function test () {
// 	// var stringQuery = "SELECT * FROM `farmharvesting` WHERE `Level`='5'"
// 	// db_upgrade_database.query(stringQuery,function (error,rows) {
// 	// 	console.log(rows[0].Unlock_ID)
// 	// 	console.log(rows[0].Unlock_ID)
// 	// 	if (rows[0].Unlock_ID==undefined) {console.log('a');}
// 	// 	if (rows[0].Unlock_ID==null) {console.log('b');}
// 	// 	if (rows[0].Unlock_ID!=0) {console.log('c');}
// 	// })
// 	var stringQuery =  "SELECT `Name_Upgrade` FROM `upgrade`";
// 	db_upgrade_database.query(stringQuery,function (error,rows) {
// 		console.log(rows)
// 	})
// }




// var stringT = 2;
// var DictTimeOutUnFriend={};
// var Promise = require('promise')

// test (unitT,returnPosArraya)
// function test (unit,returnPosArray) {
// 	var ID_User = 42
// 	var tempListUnitInPos=[];
// 	var arrayUnit,arrayUnitInPos = [];
// 	client.hmget("s1_pos",returnPosArray,function (error,rows){
// 		if (rows!=null) {
// 			// console.log('rows')
// 			// console.log(rows.length)
// 			for (var i = 0; i < rows.length; i++) {
// 				arrayUnit = rows[i].split("/").filter(String);
// 				if (arrayUnit.length>1) {
// 					for (var j = 0; j < arrayUnit.length; j++) {
// 						if (arrayUnit[j].split("_")[2]!=ID_User) {
// 							tempListUnitInPos.push(arrayUnit[j])
// 						}						
// 					}
// 				}else {
// 					if (arrayUnit[0].split("_")[2]!=ID_User) {
// 							tempListUnitInPos.push(arrayUnit[0])
// 						}

// 				}		

// 			}
// 			console.log(tempListUnitInPos)
// 		}	
// 	})

// }
// [ '1_16_43_952', '1_16_43_952', '1_16_43_952', '1_16_43_952' ]