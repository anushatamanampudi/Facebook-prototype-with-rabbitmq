
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');
 
 

var mongoSessionConnectURL = "mongodb://localhost:27017/fbsessions";
var app = express();
var expressSession = require("express-session");
var mongoStore = require("connect-mongo")(expressSession);
var mongo = require("./routes/mongo");
var login = require("./routes/login");

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(expressSession({
	secret: 'fb@teststring',
	resave: false,  //don't save session if unmodified
	saveUninitialized: false,	// don't create session until something stored
	duration: 30 * 60 * 1000,    
	activeDuration: 5 * 60 * 1000,
	store: new mongoStore({
		url: mongoSessionConnectURL
	})
}));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
var mongoURL = "mongodb://localhost:27017/fbdb";
app.use(function(req, res, next) {
	  if (req.session && req.session.email) {
		  //console.log(req.fbsession.email);
		  
		  mongo.connect(mongoURL, function(){
				console.log('Connected to mongo at: ' + mongoURL);
				var coll = mongo.collection('login');

				coll.findOne({username:req.session.email}, function(err, user){
					if (user) {
						req.email=user;
				        req.session.email = user; 

					} 
				});
			});
		 
	      next();
	  } else {
	    next();
	  }
	});

function requireLogin (req, res, next) {
	  if (!req.session.email) {
		console.log(req.session.email);
	    res.redirect('/');
	  } 
	    next();
	  
}

app.get('/', routes.index);
app.get('/users', user.list);
app.post('/api/login',login.login);
app.post('/api/signup',login.savedetails);
app.get('/dashboard',requireLogin,login.dashboard);
app.post('/api/:id', requireLogin,login.frnddashboard);
app.get('/profile',requireLogin, login.profile);
app.get('/dashboard2/:id', requireLogin,login.dashboard2);
app.post('/addfriend',requireLogin,login.addfriend);
app.post('/checkfrnd',requireLogin,login.checkfrnd);
app.post('/accfrnd',login.accfrnd);
app.post('/postupdate',login.post);
app.get('/creategroup',requireLogin,login.creategroup);
app.post('/groupcreation',requireLogin,login.groupcreation);
app.post('/groupdeletion',requireLogin,login.groupdeletion);
app.post('/addmem',requireLogin,login.addmem);
app.post('/del',requireLogin,login.del);
app.post('/show',requireLogin,login.showmem);
app.post('/showgrps',requireLogin,login.showgrps);
app.get('/logout',login.logout);
app.get('/about', requireLogin,login.about);
app.post('/addevents',login.addevents);
app.post('/addwande',login.addwrk);
app.post('/addcontacts',login.addcontactinfo);
app.post('/addinterests',login.addinterests);
app.post('/delevents',login.delevents);
app.post('/delwande',login.delwande);
app.post('/delcontacts',login.delcontacts);
app.post('/delinterests',login.delinterests);

mongo.connect(mongoSessionConnectURL, function(){
	console.log('Connected to mongo at: ' + mongoSessionConnectURL);
	http.createServer(app).listen(app.get('port'), function(){
		console.log('Express server listening on port ' + app.get('port'));
	});  
});
