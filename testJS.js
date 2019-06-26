// var st = '1_16_44_527/1_16_44_505/1_16_44_504/1_16_43_575/'
// var result = st.split("/").filter(String)
// console.log(result)

var redis = require("redis"),
client = redis.createClient();
client.select(2)

var Promise = require('promise');

var arrayUnitInPos2 = [ '1_16_44_527', '1_16_44_526', '1_16_43_580' ]
//  test (arrayUnitInPos2)
// function test (arrayUnitInPos) {

// 	for (var i = 0; i < arrayUnitInPos.length; i++) {
// 		if (arrayUnitInPos[i].split("_")[2] == 43) {
// 			console.log('arrayUnitInPos[i]')
// 			console.log(arrayUnitInPos[i])
// 			arrayUnitInPos.splice(arrayUnitInPos.indexOf(arrayUnitInPos[i], 1))
// 		}
// 	}	
// 	console.log(arrayUnitInPos)
// }
// var data = { ID: 506,
//   ID_Unit: 16,
//   ID_User: 44,
//   BaseNumber: 1,
//   Level: 1,
//   Quality: 6,
//   Hea_cur: 5.2,
//   Health: 5.2,
//   Attack: 2.15,
//   Defend: 1.1,
//   Position_Cell: '299,9,0',
//   Next_Cell: null,
//   End_Cell: null,
//   TimeMoveNextCell: null,
//   TimeFinishMove: null,
//   ListMove: null,
//   Status: 6,
//   Attack_Base_ID: null,
//   Attack_Unit_ID: null,
//   AttackedBool: 0 }
// if(data.Attack_Unit_ID==null){console.log('here')}

// listIDUnitAttack = arrayUnitInPos;
// console.log('listIDUnitAttack1')
// console.log(listIDUnitAttack)

// if (listIDUnitAttack.length==0) {
// 	attackFunc.ClearInterAttack(stringKey,functions.CaseClearAttack.Full);
// }
// resolve();

// var list_ID_User = ['1_16_44_510','1_16_44_531','1_16_43_579']
// testProMise (list_ID_User)
// function testProMise (para) {
// 	var stringGet;
// 	new Promise((resolve,reject)=>{
// 		test(list_ID_User,function (callbackHere) {
// 			stringGet = callbackHere;
// 			resolve();
// 		})
// 	}).then(()=>new Promise((resolve,reject)=>{
// 		console.log(stringGet)
// 	}))
// }

// function test (para,callbackHere) {
// 	var stringHkey = "Htest";
// 	var stringKey = "test_"+para;
// 	client.hset(stringHkey,stringKey,para.toString(),function (error) {
// 		// console.log('here: '+para)
// 		callbackHere(para)
// 	})
// }
// checkListFriendData (list_ID_User,43,function (returnListUnit) {
// 	console.log(returnListUnit)	
// })
// // function checkListFriendData (List_ID_User,ID_Player,returnListBool) {
// // 	var checkBool = false;
// // 	var stringHkey = "all_friends";
// // 	var listBoolFriend=[];
// // 	client.hmget(stringHkey,List_ID_User,function (error,rows) {
// // 		// console.log(rows)		
// // 		for (var i = 0; i < rows.length; i++) {
// // 			if (rows[i]!=null) {
// // 				var result = rows[i].split("/").filter(String);
// // 				if (result.includes(ID_Player)) {checkBool=true;}	
// // 			}
// // 			listBoolFriend.push(checkBool);
// // 		}
// // 		returnListBool(listBoolFriend);
// // 	});
// // }
// function checkListFriendData (List_ID_User,ID_Player,returnListUnit) {
// 	// var checkBool = false;
// 	var stringHkey = "s1_unit";
// 	var listUnitIDAttack = [];
// 	var listUnitAttck  = [];
// 	for (var i = 0; i < List_ID_User.length; i++) {
// 		listUnitIDAttack.push(List_ID_User[i].split("_")[2]);
// 	}

// 	console.log (listUnitIDAttack)

// 	client.hmget(stringHkey,listUnitIDAttack,function (error,rows) {
// 		if (rows!=null) {			
// 			for (var i = 0; i < rows.length; i++) {

// 				if (rows[i]!=null) {
// 					var result = rows[i].split("/").filter(String);
// 					if (!result.includes(ID_Player)) {						
// 						listUnitAttck.push(List_ID_User[i]);
// 					}
// 				}else{
// 					listUnitAttck.push(List_ID_User[i]);
// 				}
// 			}

// 		}
// 		returnListUnit(listUnitAttck);
// 	});
// 	// console.log(listCheck.length)
// 	// client.hmget(stringHkey,listCheck,function (error,rows) {
// 	// 	console.log(rows)		
// 	// 	for (var i = 0; i < rows.length; i++) {
// 	// 		if (rows[i]!=null) {
// 	// 			var result = rows[i].split("/").filter(String);
// 	// 			if (result.includes(ID_Player)) {
// 	// 				checkBool=true;}	
// 	// 		}
// 	// 		listBoolFriend.push(checkBool);
// 	// 	}
// 	// 	returnListBool(listBoolFriend);
// 	// });
// }
