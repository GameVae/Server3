var db_all_user  	= require('./../Util/Database/Db_all_user.js');
var db_server_task 	= require('./../Util/Database/Db_server_task.js');
var functions		= require('./../Util/Functions.js');
var testRegister	= require('./../Login/Register/Register.js');

if (process.argv.length <2) {

	console.log(process.argv.length)
	console.log("Vui long chon tham so truyen vao:")
	console.log("0: Current Server")
	console.log('1: Switch Server')
	console.log('2: Test Time')
	console.log('3: Test Insert User')
}
else{
	switch (parseInt(process.argv[2])) {
		case 0:
		var queryString = "SELECT * FROM `task`"; 
		//console.log(queryString);
		db_server_task.query(queryString,function (error,rows) {
			if (!!error){console.log('error query')}
				console.log(rows);
		});
		break;

		case 1:
		console.log(process.argv[3]);
		if (process.argv[3]==undefined) {
			console.log("Vui long chon tham so thu 3");
		}
		else{
			var updateString ="UPDATE `task` SET `Content` = '"+parseInt(process.argv[3])+"' WHERE `task`.`ID` = 1"; 
			console.log(updateString);
			db_server_task.query(updateString,function (error,result) {
				if (!!error){console.log('error update');}
			});
		}
		break;

		case 2:
		var timeUpdate = new Date().toISOString();
		var updateString  ="UPDATE `server_list` SET `ProtectedTime` = '"+timeUpdate+"' WHERE `server_list`.`ID` = 1";
		console.log(updateString);
		db_server_task.query(updateString,function (error,result) {
			if (!!error){console.log('error update');}
			console.log(result);
		});
		break;

		case 3:

		var data = {
			UserName : "thisUser20",
			Password : "thisPassword30",
			Email : "thisEmail40"
		};
		testRegister.Test(data);
		break;

	}
}
