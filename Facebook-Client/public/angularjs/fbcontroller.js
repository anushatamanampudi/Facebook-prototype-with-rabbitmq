

var login = angular.module('Facebook',[]);
  var k;
 login.controller('fbcontroller',['$scope','$http',function($scope,$http){
	
	  
	  $scope.login = function(){
		  console.log($scope.emailid);
		  console.log($scope.password);
	 $http.post('/api/login',{"email":$scope.emailid,"password":$scope.password}).success(function(response){
		  
		 if (response.statusCode == 401) {
				$scope.invalid_login = false;
				$scope.unexpected_error = true;
			}
			else
				window.location.assign("/dashboard"); 
		}).error(function(error) {
			$scope.error = "Incorrect username or password";
		});
	  
 };
			
		        	
		  
	  
 
      $scope.signup= function(){ 
			
			  console.log($scope.mail1);
			  console.log($scope.pwd);
			  console.log($scope.fname);
			  console.log($scope.lname);
			  //console.log($scope.gender);
			  if($scope.mail1==$scope.mail2){
			  $http.post('/api/signup',{"fname":$scope.fname,"lname":$scope.lname,"password":$scope.pwd,"mail1":$scope.mail1,"gender":$scope.gender,"mnth":$scope.mnth,"date":$scope.day,"year":$scope.year}).success(function(res){
		  
		    	k=res;
		    	$scope.k=k;
		    	
		    
		  })}
			  else{
				  $scope.k="email id's do not match";
			  }
		  };
 

	  
  }]);
