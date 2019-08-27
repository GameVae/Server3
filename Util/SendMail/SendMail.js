'use strict';
const nodemailer    = require('nodemailer');

var functions = require("./../Functions.js");

exports.Register = function reigister (UserName,Email) {
 let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
       user: 'testdemanvi@gmail.com',
       pass: 'canthan112'
   }
});

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Game VAE-Đăng ký tài khoản tại GameTest" <gameVae@demandvi.com>', // sender address
        to: Email, // list of receivers
        subject: 'Thông báo đăng kí tài khoản', // Subject line
        text: '✔ Đăng kí tài khoản thành công', // plain text body
        html: '<b>Bạn đã đăng kí tài khoản thành công với tên: '+UserName+ ' và email:'+Email+'</b>' // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => 
    {
    	if (!!error) {
            functions.ShowLog(functions.ShowLogBool.Error,'SendMail.js Register mailOptions',[mailOptions]);
            functions.ShowLog(functions.ShowLogBool.Error,'SendMail.js Register error',[error]);
        }
        functions.ShowLog(functions.ShowLogBool.LogChange,'SendMail.js Register mailOptions',[mailOptions]);
    	// console.log('Message %s sent: %s', info.messageId, info.response);
    });
}