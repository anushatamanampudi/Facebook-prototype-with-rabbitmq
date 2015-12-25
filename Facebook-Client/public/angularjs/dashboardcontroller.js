/**
 * New node file
 */


var dashboard = angular.module('dashboardapp',[]);
 dashboard.controller('dashboardcontroller',['$scope','$http',function($scope,$http){
	 
	 $scope.search=function(){
		$http.post('/api/'+$scope.srchterm).success(function(response){
			
			  //alert(response);
			console.log(response);
			 if(response =="No such member exists")
				 {
				   alert(response);
				 }
			 if(response =="your page")
			 {
				 window.location.replace("/profile");
			 }
			 else{
			   window.location.replace("/dashboard2/"+$scope.srchterm); 
			 }
			    
		 });
	 }
$scope.accept=function(event){
		      console.log("clicked on accept");
			$http.post('/accfrnd',{id:event.target.id}).success(function(response){
				if(response){
				window.location.assign("/dashboard"); 
				}
				    
			 });
		 }
	$scope.post=function(){
		 
		 $http.post('/postupdate',{text:$scope.text}).success(function(response){
			 if(response){
				 window.location.assign("/dashboard");  
			 }
			   
			    
		 });
	 };
	 
	 
	 
 }]);