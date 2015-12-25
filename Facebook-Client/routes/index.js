
/*
 * GET home page.
 */

exports.index = function(req, res){
	if(req.session.email){
		  res.redirect('dashboard');
	  }
	  else{
	  res.render('index', { title: 'Express' });
	  }
};