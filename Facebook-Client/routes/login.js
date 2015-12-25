/**
 * 
 */
var ejs = require("ejs");
var mq_client = require('../rpc/client');
var mongo = require("./mongo");
var mongoURL = "mongodb://localhost:27017/fbdb";

exports.login = function(req, res){
    var email=req.body.email;
	var password=req.body.password;
	var json_response;
    var msg_payload = { "username": email, "password": password };
	
	console.log("In POST Request = Email:"+ email+" "+password);
	
mq_client.make_request('login_queue',msg_payload, function(err,results){
		
		console.log(results);
		if(err){
			throw err;
		}
		else 
		{
			if(results.code == 200){
				console.log("valid Login");
				req.session.email = email;
				req.session.fname=results.fname;
				req.session.lname=results.lname;
				res.send({"login":"Success"});
			}
			else {    
				
				console.log("Invalid Login");
				res.send({"login":"Fail"});
			}
		}  
	});
	
};


exports.savedetails = function(req,res){
	// These two variables come from the form on
	// the views/login.hbs page
	
	var password = req.param("password");
	var fname = req.param("fname");
	var email1 = req.param("mail1");
	var gender = req.param("gender");
	var lname = req.param("lname");
	var mnth= req.param("mnth");
	var date=req.param("date");
	var year=req.param("year");
	  
	
	
var msg_payload = {"email": email1,"password":password,"fname":fname,"lname":lname,"mnth":mnth,"date":date,"year":year};
console.log(msg_payload);
	
	console.log("In Signin POST Request = UserName:"+ email1+" "+password);
	
	mq_client.make_request('signup_queue',msg_payload, function(err,results){
		
		console.log(results);
		if(err){
			throw err;
		}
		else 
		{
			if(results.code == 200){
				console.log("valid signup");
				
				req.session.fname=results.fname;
				req.session.lname=results.lname;
				req.session.email=results.email;
				
				res.send({"login":"Success"});
			}
			else {    
				
				console.log("Invalid signup");
				res.send({"login":"Fail"});
			}
		}  
	});
};

exports.dashboard=function(req,res){
      var email=req.session.email;

	
	console.log("In POST Request = Email:"+ email);
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at fr checking frnd req: ' + mongoURL);
		var coll = mongo.collection('users');
		coll.aggregate(
				{$match : {
					"username":req.session.email,
				     "friends.status": 3
				  }},
				  { $unwind : "$friends" },
				  { $match : {
					  "friends.status": 3
				  }},function(err, user) {
			    	  if(err)
			    	        throw err;
			    	  else{
			    		  var frndreq=[];
			    		  for(var i=0;i<user.length;i++){
			    		    frndreq[i]=user[i].friends.fname;
			    		  }
			    		  coll.findOne({"username":req.session.email},
			    					 function(err, user) {
			    				    	  if(err)
			    				    	        throw err;
			    				    	  else{
			    				    		  ;
			    				    		  var flist = [];
			    				    		  if(user.frndposts){
			    				    		  for(var i=0;i<user.frndposts.length;i++){
			    				    		  flist.push({"firstname":user.frndposts[i].frndname,"post":user.frndposts[i].posts});
			    				    		  }
			    				    		  }
			    				    		  if(user.posts){
			    				    			  for(var i=0;i<user.posts.length;i++){
			    				    				  flist.push({"post":user.posts[i],"firstname":req.session.fname}); }
					    				    		  }
			    				    		  
			    		
			    				    		  console.log(flist);
			    				    		  res.render("dashboard",{fname:req.session.fname,lname:req.session.lname,flist:flist,frndarr:frndreq});
			    				    		 }});
			    		  
			    		 }});
		
		
		
})};

exports.frnddashboard = function(req, res){
	var name=req.params.id;
	console.log("frnd name"+name);
	console.log(req.session.fname);
	if(req.params.id === req.session.fname){
		res.send("your page");
		
	}
	else{
		var msg_payload={"fname":name};
		mq_client.make_request('search_queue',msg_payload, function(err,results){
			
			console.log(results);
			if(err){
				throw err;
			}
			else 
			{
				if(results.code == 200){
					console.log("found the frnd");
					res.send(results.lname);
				}
				else {    
					
					console.log("did not find the frnd");
					res.send("No such member exists");
					
				}
			}  
		});
	}
	 
};

exports.dashboard2=function(req,res){
	var fname=JSON.stringify(req.params.id);
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		 var coll = mongo.collection('users');
		 coll.findOne({"fname" : fname.replace(/[^a-zA-Z ]/g, "")}, function(err, user1){
		var farr=[];
		if(user1.friends){
			for(var i=0;i<user1.friends.length;i++){
				farr.push(user1.friends[i].fname);
			}
		}
		var grp=[];
		if(user1.groups){
			for(var i=0;i<user1.friends.length;i++){
				grp.push(user1.groups[i]);
			}
		}
	     res.render('profile',{fname:fname,farr:farr,grp:grp});
		 });
	});
};
exports.profile=function(req,res){
	var fname=JSON.stringify(req.params.id);
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		 var coll = mongo.collection('users');
		 coll.findOne({"username" : req.session.email}, function(err, user1){
		var farr=[];
		if(user1.friends){
			for(var i=0;i<user1.friends.length;i++){
				farr.push(user1.friends[i].fname);
			}
		}
		var grp=[];
		if(user1.groups){
			for(var i=0;i<user1.friends.length;i++){
				grp.push(user1.groups[i]);
			}
		}
	     res.render('myprofile',{farr:farr,grp:grp});
		 });
	});
};

exports.addfriend = function(req, res){
	 console.log(req.param("fname"));
	 var name=req.param("fname");
	  mongo.connect(mongoURL, function(){
			console.log('Connected to mongo at: ' + mongoURL);
			var coll = mongo.collection('users');
			coll.findOne({"username" : req.session.email}, function(err, user1){
			if(user1.friends){	
			coll.updateOne(
				      { "username" : req.session.email },
				      {
				        $push: { "friends":{"fname":req.param("fname").replace(/[^a-zA-Z ]/g, "") ,"status":1}},
				      }, function(err, user) {
				    	  if(err)
				    	        throw err;
				    	  else{
				    		  
				      res.code=200;
				      res.value="friend request sent";
				      res.send(res.value);
				      console.log("entry updated");
				      
				    	  }
				      
				   });}
			else{
				coll.updateOne(
					      { "username" : req.session.email },
					      {
					        $addToSet: { "friends":{"fname":req.param("fname").replace(/[^a-zA-Z ]/g, "") ,"status":1}},
					      }, function(err, user) {
					    	  if(err)
					    	        throw err;
					    	  else{
					    		  
					      res.code=200;
					      res.value="friend request sent";
					      res.send(res.value);
					      console.log("entry updated");
					      
					    	  }
					      
					   });	
			}
			});

			
		});
	  mongo.connect(mongoURL, function(){
			console.log('Connected to mongo at: ' + mongoURL);
			var coll = mongo.collection('users');
			console.log(name);
			console.log(name.replace(/[^a-zA-Z ]/g, ""));
			coll.findOne({"username" : req.session.email}, function(err, user1){
				if(user1.friends){	
			coll.update(
				      { "fname" :name.replace(/[^a-zA-Z ]/g, "")},
				      {
				        $push: { "friends":{"fname":req.session.fname,"status":3}},
				      }, function(err, user) {
				    	  if(err)
				    	        throw err;
				    	  else{
				    		  
				      res.code=200;
				      res.value="friend request sent";
				      res.send(res.value);
				      console.log("entry updated");
				      
				    	  }
				      
				   });}
				else{
					coll.update(
						      { "fname" :name.replace(/[^a-zA-Z ]/g, "")},
						      {
						        $addToSet: { "friends":{"fname":req.session.fname,"status":3}},
						      }, function(err, user) {
						    	  if(err)
						    	        throw err;
						    	  else{
						    		  
						      res.code=200;
						      res.value="friend request sent";
						      res.send(res.value);
						      console.log("entry updated");
						      
						    	  }
						      
						   });
				}

				});
		});
	  
	};

exports.checkfrnd = function(req, res){
		  var name=JSON.stringify(req.param("fname"));
		  
		  mongo.connect(mongoURL, function(){
				console.log('Connected to mongo at: ' + mongoURL);
				var coll = mongo.collection('users');

				coll.findOne({"username" : req.session.email}, function(err, user){
					if (user) {
						
						//console.log("user details"+user.friends.fname);
						if(user.friends){
						for(var i=0;i<user.friends.length;i++){	
						if(user.friends[i].fname===name.replace(/[^a-zA-Z ]/g, "")){
							console.log("in post request checkfrnd"+name);
							if(user.friends[i].status==1){
								res.send("1");
							}
							if(user.friends[i].status==2){
								res.send("2");
							}
						}}}
					else{
						res.send("4");
					}

					}else {
						res.send("user does not exist");
					 }
						
					
				});
			});
			
		};

exports.accfrnd = function(req,res){
	var fname=req.param("id").replace(/[^a-zA-Z ]/g, "");
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		var coll = mongo.collection('users');

		coll.update({"username":req.session.email,"friends.fname":fname } ,{
	        $set: {"friends.$.status": 2 },
	      } , function(err, user){
			console.log("Accepted friend request");
				
			
		});
		coll.update({"fname":fname,"friends.fname":req.session.fname } ,{
	        $set: {"friends.$.status": 2 },
	      } , function(err, user){
			console.log("Accepted friend request");
				
		res.send("sucess");	
		});
	});
	
	
};

exports.post=function(req,res){
	post=req.param("text");
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		var coll = mongo.collection('users');
		coll.findOne({"username" : req.session.email}, function(err, user1){
		if(user1.posts){	
		coll.updateOne(
			      { "username" : req.session.email },
			      {
			        $push: { "posts":post}
			      }, function(err, user) {
			    	  if(err)
			    	        throw err;
			    	  else{
			    		  
			      res.code=200;
			      res.send("posted value");
			      console.log("posted");
			      
			    	  }
			      
			   });}
		else{
			coll.updateOne(
				      { "username" : req.session.email },
				      {
				        $addToSet:{ "posts":post}
				      }, function(err, user) {
				    	  if(err)
				    	        throw err;
				    	  else{
				    		  
				    		  res.code=200;
						      res.send("posted value");
						      console.log("posted");
				      
				    	  }
				      
				   });	
		}
		});

		
	});
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		var coll = mongo.collection('users');
		var frns=[];
		coll.aggregate(
				{$match : {
					 "username":req.session.email,
				     "friends.status": 2
				  }},
				  { $unwind : "$friends" },
				  { $match : {
					  "friends.status": 2
				  }},function(err, user) {
			    	  if(err)
			    	        throw err;
			    	  else{
			    		  for(var i=0;i<user.length;i++){
			    		    frns.push(user[i].friends.fname);
			console.log(frns[i]);
			coll.updateOne(
				      { "fname" : frns[i] },
				      {
				    	  $push: { "frndposts":{"posts":post,"frndname":req.session.fname}}
				      }, function(err, user) {
				    	  if(err)
				    	        throw err;
				    	  else{
				    		  
				    		  res.code=200;
				    		  res.send("success");
						      console.log("Added to frnds posts also");
				      
				    	  }
				      
				   });	} }});

		
	});}


exports.creategroup = function(req, res){
	
	res.render('creategroup');	
		
};
exports.about = function(req, res){
	
	mongo.connect(mongoURL, function(){
		var life=[];
		var wande=[];
		var contact=[];
		var interest=[];
		console.log('Connected to mongo at: ' + mongoURL);
		 var coll = mongo.collection('users');
	coll.findOne({"username" : req.session.email}, function(err, user1){
		
		if(user1.lifeevents){
			for(var i=0;i<user1.lifeevents.length;i++){
				life.push(user1.lifeevents[i]);
				console.log(user1.lifeevents[i])
			}
			
		}
		
		
		if(user1.wande){
			for(var i=0;i<user1.wande.length;i++){
				wande.push(user1.wande[i]);
			}
			
		}
		
		
		if(user1.contact){
			for(var i=0;i<user1.contact.length;i++){
				contact.push(user1.contact[i]);
			}
			
		}
		
		
	if(user1.interests){
		for(var i=0;i<user1.interests.length;i++){
			interest.push(user1.interests[i]);
		}
		
	}
	
	

res.render("about1",{lifeevents:life,wande:wande,contact:contact,interest:interest});	
	});
	});
	
		
};

exports.groupcreation = function(req, res){
	
	req.session.grpname=req.param("input1").replace(/[^a-zA-Z ]/g, "");
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		var coll1 = mongo.collection('groups');

		coll1.insert({groupname:req.param("input1").replace(/[^a-zA-Z ]/g, ""),groupmem:[{fname:req.session.fname}]}, function(err, user){
			

		});
	});
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		 var coll = mongo.collection('users');
 coll.updateOne({"username" : req.session.email},{
	  $push: { "groups":req.param("input1").replace(/[^a-zA-Z ]/g, "")}
 }, function(err, user1){
				
				
				});
	coll.findOne({"username" : req.session.email}, function(err, user1){
		var farr=[];
		if(user1.friends){
			for(var i=0;i<user1.friends.length;i++){
				farr.push(user1.friends[i].fname);
			}
		}
		res.render('groupform',{grpname:req.param("input1"),farr:farr} );
		 });
	});
	
};
exports.showgrps = function(req, res){
	
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		 var coll = mongo.collection('users');
	coll.findOne({"username" : req.session.email}, function(err, user1){
		var grps=[];
		if(user1.groups){
			for(var i=0;i<user1.groups.length;i++){
				grps.push(user1.groups[i]);
			}
			res.send(JSON.stringify(grps));
		}
		else{
			res.send("You have no groups");
		}
		
		 });
	});
	
};
exports.groupdeletion = function(req, res){
	
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		 var coll = mongo.collection('users');
		 coll.updateOne({"username" : req.session.email},{
			  $pull: { "groups":req.param("id").replace(/[^a-zA-Z ]/g, "")}
		 }, function(err, user1){
						
						
						});
	});
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		 var coll = mongo.collection('groups');
		 coll.remove({"groupname" : req.session.grpname}, function(err, user1){
						
						
						});
	});
	
	
};
exports.showmem = function(req, res){
	
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		 var coll = mongo.collection('groups');
	coll.findOne({"groupname" : req.session.grpname}, function(err, user1){
		var mem=[];
		if(user1.groupmem){
			for(var i=0;i<user1.groupmem.length;i++){
				mem.push(user1.groupmem[i].fname);
			}
			console.log(mem);
			res.send(JSON.stringify(mem));
		}
		else{
			
		}
		
		 });
	});
	
};
exports.addmem = function(req, res){
	
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		 var coll = mongo.collection('groups');
		 coll.updateOne({"groupname" : req.session.grpname},{
			  $push: { "groupmem":{"fname":req.param("id").replace(/[^a-zA-Z ]/g, "")}}
		 }, function(err, user1){
						
						
						});
	});
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		 var coll = mongo.collection('users');
		 coll.updateOne({"fname" : req.param("id").replace(/[^a-zA-Z ]/g, "")},{
			  $push: { "groups":req.session.grpname}
		 }, function(err, user1){
						
						
						});
	});
	
};
exports.del = function(req, res){
	
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		 var coll = mongo.collection('groups');
		 coll.updateOne({"groupname" : req.session.grpname},{
			  $pull: { "groupmem":{"fname":req.param("id").replace(/[^a-zA-Z ]/g, "")}}
		 }, function(err, user1){
						
						
						});
	});
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		 var coll = mongo.collection('users');
		 console.log("deleting"+req.param("id").replace(/[^a-zA-Z ]/g, ""));
		 coll.updateOne({"fname" : req.param("id").replace(/[^a-zA-Z ]/g, "")},{
			  $pull: { "groups":req.session.grpname}
		 }, function(err, user1){
						
						
						});
	});
	
};

exports.addevents = function(req, res){
	
	name=req.param("user").replace(/[^a-zA-Z ]/g, "");
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		var coll1 = mongo.collection('users');

		coll1.update({"username":req.session.email},{$push:{"lifeevents":name}}, function(err, user){
			

		});
	});
	res.redirect('/about');
};
exports.addwrk = function(req, res){
	
	name=req.param("user").replace(/[^a-zA-Z ]/g, "");
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		var coll1 = mongo.collection('users');

		coll1.update({"username":req.session.email},{$push:{"wande":name}}, function(err, user){
			

		});
	});
	res.redirect('/about');
};
exports.addcontactinfo = function(req, res){
	
	name=req.param("user").replace(/[^a-zA-Z ]/g, "");
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		var coll1 = mongo.collection('users');

		coll1.update({"username":req.session.email},{$push:{"contact":name}}, function(err, user){
			

		});
	});
	res.redirect('/about');
};
exports.addinterests = function(req, res){
	
	name=req.param("user").replace(/[^a-zA-Z ]/g, "");
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		var coll1 = mongo.collection('users');

		coll1.update({"username":req.session.email},{$push:{"interests":name}}, function(err, user){
			

		});
	});
	res.redirect('/about');
};
//Logout the user - invalidate the session
exports.logout = function(req,res)
{
	req.session.destroy();
	res.redirect('/');
};
exports.delevents = function(req, res){
	console.log(JSON.stringify(req.body).slice(2,JSON.stringify(req.body).indexOf(":")-1));
	name=JSON.stringify(req.body).slice(2,JSON.stringify(req.body).indexOf(":")-1);
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		var coll1 = mongo.collection('users');

		coll1.update({"username":req.session.email},{$pull:{"lifeevents":name}}, function(err, user){
			

		});
	});
	res.redirect('/about');
};
exports.delwande = function(req, res){
	
	name=JSON.stringify(req.body).slice(2,JSON.stringify(req.body).indexOf(":")-1);
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		var coll1 = mongo.collection('users');

		coll1.update({"username":req.session.email},{$pull:{"wande":name}}, function(err, user){
			

		});
	});
	res.redirect('/about');
};
exports.delcontacts = function(req, res){
	
	name=JSON.stringify(req.body).slice(2,JSON.stringify(req.body).indexOf(":")-1);
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		var coll1 = mongo.collection('users');

		coll1.update({"username":req.session.email},{$pull:{"contact":name}}, function(err, user){
			

		});
	});
	res.redirect('/about');
};
exports.delinterests = function(req, res){
	name=JSON.stringify(req.body).slice(2,JSON.stringify(req.body).indexOf(":")-1);
	mongo.connect(mongoURL, function(){
		console.log('Connected to mongo at: ' + mongoURL);
		var coll1 = mongo.collection('users');

		coll1.update({"username":req.session.email},{$pull:{"interests":name}}, function(err, user){
			

		});
	});
	res.redirect('/about');
	
};
	

