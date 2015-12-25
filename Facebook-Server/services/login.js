var mongo = require("./mongo");
var mongoURL = "mongodb://localhost:27017/fbdb";
var bcrypt = require('bcrypt-nodejs');

function handle_request(msg, callback){
	var res = {};
	console.log("In login handle request:"+ msg.username);
  
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		var coll = mongo.collection('users');

		coll.findOne({username:msg.username}, function(err, user){
			if (user) {
				console.log('inside');
				if(bcrypt.compareSync(msg.password,user.password)){
				res.code = "200";
				res.fname=user.fname;
				res.lname=user.lname;
				callback(null, res);
				}

			 else {
				res.code = "401";
				res.value = "Failed Login";
			 }
			}
		else{
			res.code = "401";
			res.value = "Failed Login";
		}
		});
	});
	
	
}

exports.handle_request = handle_request;