'use strict';
const nodemailer    = require('nodemailer');

var functions = require("./../Functions.js");

exports.Register = function reigister (UserName,Email) {
	  let transporter = nodemailer.createTransport({
	  	service: 'gmail',
	  	auth: {
	  		user: 'aloevera.hoang@gmail.com',
	  		pass: '123456@A'
	  	}
	  });

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Game VAE" <gameVae@demandvi.com>', // sender address
        to: Email, // list of receivers
        subject: 'Thông báo đăng kí tài khoản', // Subject line
        text: '✔ Đăng kí tài khoản thành công', // plain text body
        html: '<b>Bạn đã đăng kí tài khoản thành công với tên: '+UserName+ ' và email:'+Email+'</b>' // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => 
    {
    	if (error) {
    		return console.log(error);
    	}
    	functions.LogChange("Send mail Register: "+UserName+"_Email: "+Email);
    	// console.log('Message %s sent: %s', info.messageId, info.response);
    });
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