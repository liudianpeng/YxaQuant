angular.module('yxaquant.user', [])

.controller('UserListController', ['$scope','users', function ($scope, users) {
    $scope.items = users
}])

.controller('UserProfileController', ['$scope', function ($scope) {
	
}]);
