angular.module('yxaquant.user', [])

.controller('UserListController', ['$scope','users', function ($scope, users) {
    $scope.items = $scope.i = users
}])

.controller('UserProfileController', ['$scope', function ($scope) {
	
}]);
