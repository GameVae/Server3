'use strict';
var db_user		= require('./../../Util/Database/Db_s3_user.js');
// var sendMail 		= require('./../../Util/sendMail.js');
var functions 		= require('./../../Util/Functions.js');
// var userBase		= require('./../../UserBase/userBase.js');

var currentUser,DetailError;

exports.Start = function start (io) {
	io.on('connection', function(socket){
		socket.on('S_REGISTER', function (data){
			S_REGISTER (socket,data);
		});
	});
}

function S_REGISTER (socket,data) {
	console.log('S_REGISTER');
	//console.log(data);

	var queryString = "SELECT * FROM `users` WHERE `UserName`='"+data.UserName+"' OR `UserEmail`='"+data.Email+"'";
	// var queryString = "SELECT * FROM `users`"
	db_user.query(queryString,function(error,rows){
		if (!!error){DetailError = ('Register: S_REGISTER queryUser :'+ data.UserName); functions.WriteLogError(DetailError);}
		if (rows==undefined||rows.length==0) {
			createUser(socket,data);
		}else{
			R_REGISTER(socket,0);
		}
	
		
	});
}
function createUser(socket,data) {
	R_REGISTER(socket,1);
}
function R_REGISTER(socket,boolSuccess){
	socket.emit('R_REGISTER',{Message : boolSuccess});
}
// function getCurrentUser(data)
// {
// 	return currentUser =
// 	{
// 		UserName : data.UserName,
// 		Email : data.Email,
// 		Password : data.Password,

// 	}
// // }
// function queryUser (currentUser,socket) {
// 	database.query("SELECT * FROM `users` WHERE `UserName`='"+currentUser.name+"' OR `UserEmail`='"+currentUser.email+"'",function (error,rows) {
// 		if (!!error){DetailError = ('register: Error queryUser '+ currentUser.name);functions.writeLogErrror(DetailError);}
// 		if (rows.length>0) {
// 			socket.emit('R_REGISTER_UNSUCCESS', {data : '0'});
// 		}else {
// 			R_REGISTER_SUCCESS (currentUser,socket);
// 			//userBase.createNewUserBase(currentUser);
// 		}
// 	});	
// }
// //FFFFFFFF: new TextChatColor
// function R_REGISTER_SUCCESS (currentUser,socket) {
// 	database.query( "INSERT INTO `users` (`UserID`,`UserName`,`UserPass`,`password_recover_key`,`password_recover_key_expire`,`UserEmail`,`Diamond`,`timeLogin`,`timeLogout`,`timeResetMine`, `ColorChatWorld`) VALUES ('"+""+"','"
// 		+currentUser.name+"','"+currentUser.password+"','"+""+"','"+""+"','"+currentUser.email+"','"+1000+"','"+0+"','"+0+"','"+0+"','FFFFFFFF')",function (error,result) {			
// 			if (!!error){DetailError = ('register: Error insertUser '+ currentUser.name);functions.writeLogErrror(DetailError);}
// 			socket.emit('R_REGISTER_SUCCESS', {message : '1'});
// 			console.log('đang ki thanh cong: '+currentUser.name);
// 			R_USER_REGISTER (currentUser,socket);
// 			sendMail.sendMailRegister(currentUser);
// 		});	
// }
// function R_USER_REGISTER (currentUser,socket) {
// 	socket.emit('R_USER_REGISTER', { UserName : currentUser.name,});
// }

