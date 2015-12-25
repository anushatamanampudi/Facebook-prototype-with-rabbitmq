
var grp = angular.module('groups',[]);
 grp.controller('addmemtogroupcontroller',['$scope','$http',function($scope,$http){
	// alert("hi");
	// var check=[];
	 $scope.flag=true;
	 $scope.add=function(event){
				//console.log(event.src.Element);
				//console.log(angular.element(event.src.Element));
		 console.log(event.target);
			event.target.style.visibility="hidden";
			$http.post('/addmem',{id:event.target.id}).success(function(response){
				
			 });
		 };
		 $scope.show=function(event){
		      
				$http.post('/show').success(function(response){
					
					if(response){
						
					    $scope.mem=response;
					    $scope.flag=false;
					}
					else{
						$scope.mem="No members Except you in this group";
					}
				 });
			 };
			 $scope.delet=function(event){
				 event.target.style.visibility="hidden";
				 if(event.target.id=='admin'){
					 alert("Are you sure yu want to move out of this group! You are the admin of this group! You will not be able to access this group later.");
					 $http.post('/del',{id:event.target.id}).success(function(response){
						 window.location.assign("/creategroup");
					 });
					 
				 }
					$http.post('/del',{id:event.target.id}).success(function(response){
						
						
						   
						    
						
					 });
				 };
		
	 
	 
	 
	 
 }]);