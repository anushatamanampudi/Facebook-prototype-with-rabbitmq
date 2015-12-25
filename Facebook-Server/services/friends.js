/**
 * New node file
 */
var mongo = require("./mongo");
var mongoURL = "mongodb://localhost:27017/fbdb";
function handle_request(msg, callback){
	var res = {};
	console.log("In frnds handle request:"+ msg.fname);
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		var coll = mongo.collection('users');

		coll.findOne({fname: msg.fname}, function(err, user){
			if (user) {
				
				res.code = "200";
				
				res.lname=user.lname;
				callback(null, res);
			

			} else {
				res.code = "401";
				
			}
		});
	});
	
	
}

exports.handle_request = handle_request;