/**
 * New node file
 */
var g = angular.module('grp',[]);
 g.controller('deletegroup',['$scope','$http',function($scope,$http){
	 $scope.flag=true;
	 $scope.showgrps = function(){
		 $http.post('/showgrps').success(function(response){
				
			
					if(response=="You have no groups")
						{
				     alert(response);
						}
					else{
						
					
				    $scope.grp=response;
				    
				    $scope.flag=false;
					}
				
			 });
	 };
	 
	 $scope.del=function(event){
		 alert("you are about to delete the group and its members!!!!");
		 event.target.style.visibility="hidden";
		
			$http.post('/groupdeletion',{id:event.target.id}).success(function(response){
				
				
				   
				    
				
			 });
		 };
	 
	 
 }]);