var mongo = require("./mongo");
var mongoURL = "mongodb://localhost:27017/fbdb";
var bcrypt = require('bcrypt-nodejs');
//Generate a salt
var salt = bcrypt.genSaltSync(10);
//Hash the password with the salt

function handle_request(msg, callback){
	var res = {};
	console.log("In signup handle request:"+ msg.email);
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		var coll = mongo.collection('users');
		var dob=msg.mnth+"-"+msg.date+"-"+msg.year;
		var hash = bcrypt.hashSync(msg.password, salt);
		coll.insert({username:msg.email, password:hash,lname:msg.lname,fname:msg.fname,gender:msg.gender,dob:dob}, function(err, user){
			
				console.log("results");
				console.log(res.code);
				res.email=msg.email;
				res.code = "200";
				res.value = "Success Signup";
				callback(null, res);

		});
	});
	
	
}

exports.handle_request = handle_request;