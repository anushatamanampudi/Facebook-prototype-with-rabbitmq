/**
 * New node file
 */
var mongo = require("./mongo");
var mongoURL = "mongodb://localhost:27017/fbdb";
function handle_request(msg, callback){
	var res = {};
	console.log("In frnds check handle request:"+ msg.frndfname);
	mongo.connect(mongoURL, function(){
		console.log('Connected to frnd mongo at: ' + mongoURL);
		var coll = mongo.collection('users');
		
		coll.findOne({"friends.fname":msg.frndfname,"username" : msg.email},function(err, user) {
			    	  if(err){
			    	        throw err;
			    	        console.log("error");
			    	  }
			    	  else{
			      res.code=200;
			      console.log("retrieved values:"+user);
			      callback(null, res);
			      
			    	  }
			      
			   });

		
	});
	
	
}

exports.handle_request = handle_request;