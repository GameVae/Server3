var Db_server_task = require('./../Util/Database/Db_server_task.js');



if (process.argv.length <2) {

	console.log(process.argv.length)
	console.log("Vui long chon tham so truyen vao:")
	console.log("0: Current Server")
	console.log('1: Switch Server')
}
else{
	switch (parseInt(process.argv[2])) {
		case 0:
		var queryString = "SELECT * FROM `task`"; 
		//console.log(queryString);
		Db_server_task.query(queryString,function (error,rows) {
			if (!!error){console.log('error query')}
				console.log(rows);
		});
		break;

		case 1:
		console.log(process.argv[3]);
		if (process.argv[3]==undefined) {
			console.log("Vui long chon tham so thu 3")
		}
		else{
			var updateString ="UPDATE `task` SET `Content` = '"+parseInt(process.argv[3])+"' WHERE `task`.`ID` = 1"; 
			console.log(updateString);
			Db_server_task.query(updateString,function (error,result) {
				if (!!error){console.log('error update')}
			});
		}
		break;
	}
}
// 	switch (parseInt(process.argv[2])) {
// 		case 0:
// 		var queryString = "SELECT * FROM `task`"; 
// 		//console.log(queryString);
// 		Db_server_task.query(queryString,function (error,rows) {
// 			if (!!error){console.log('error query')}
// 				console.log(rows);
// 		});
// 		break;

// 		case 1:

// 		break;

// 		}
// 	}
// }