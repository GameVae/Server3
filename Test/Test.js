

var DictTimeout = {}
var DictTimeMove = {}

exports.Inter1 = function  interval (stringPara) {
	DictTimeout[stringPara]=setInterval(function (stringPara) {
		console.log(new Date()+"_1_"+stringPara)
	}, 1000,stringPara)
}
exports.Inter2 = function  interval (stringPara) {
	DictTimeMove[stringPara]=setInterval(function (stringPara) {
		console.log(new Date()+"_2_"+stringPara)
	}, 1000,stringPara)
}
exports.ClearInterval = function Clear_Interval (stringPara,caseNumber) {
	console.log("data")
	switch (caseNumber) {
		case 1:
		clearInterval(DictTimeout[stringPara]);
		delete DictTimeout[stringPara];
		break;
		case 2:
		clearInterval(DictTimeMove[stringPara]);
		delete DictTimeMove[stringPara];
		break;
	}
	
}