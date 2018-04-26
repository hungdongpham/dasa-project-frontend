var express = require('express');
var router = express.Router();
var request  = require('request');
var _ = require("underscore");

function checkUserToken(token, callback){
	var options = {
	  url: constants.API_URL + 'user',
	  headers: {
	    'dasa-token': token
	  }
	};
	request(options, function(err,res){        
        if(err){
        	console.log("error");
        	callback(err);
        	return;
        }

        if(res.body && res.body.status){
        	callback(res.body.message);
        	return
        }
        callback(null);
    })
	
}
/* GET home page. */
router.get('/', function(req, res, next) {
	// console.log(req.cookies.dasa_token);
	// var token = (req.cookies && req.cookies.dasa_token)? req.cookies.dasa_token: null;
	// if(token){
	// 	checkUserToken(token, function(err){
	// 		// console.log(err);
	// 		if(err){
	// 			res.redirect("/login");
	// 			return;
	// 		}
	// 		let options = {
	// 		    maxAge: 1000 * 60 * 15, // would expire after 15 minutes
	// 		    httpOnly: true, // The cookie only accessible by the web server
	// 		}
	// 		res.cookie('dasa_token', token, options) // options is optional
	// 		res.redirect("/files");
	// 	})
	// } else{
	// 	res.redirect("/login");
	// };
	res.render('index', { title: 'Express' });
});

module.exports = router;
