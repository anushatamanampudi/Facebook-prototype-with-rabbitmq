/**
 * New node file
 */

var p = angular.module('profile',[]);
 
 p.controller('profilecontroller',['$scope','$http',function($scope,$http){
	 $scope.checkfrnd=function(){
		 console.log($scope.btname);
		 $http.post('/checkfrnd',{fname:$scope.btname}).success(function(response){
			      console.log(response);
			      if(response==4){
					   $scope.add="Add Friend";
			      }
				   if(response==1){
					   
					   $scope.add="Friend request sent";
				   }
				   if(response==2){
					   $scope.add="Friends ";
				   }
				   
				  });
	 };
	 
	 $scope.addfriend=function(event){
		 var fname=event.target.id;
		 alert(fname);
		$http.post('/addfriend',{fname:fname}).success(function(response){
			 $scope.add="Friend request sent";
			  })};
			  
			
				
			    
			
			  
		 
	 
	 
 }]);
