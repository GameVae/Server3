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