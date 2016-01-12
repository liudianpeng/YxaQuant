angular.module('yxaquant.account', [])

.controller('AccountListController', ['$scope', 'accounts', function ($scope, accounts) {

	$scope.accounts = accounts;

}])

.controller('AccountDetailController', ['$scope', function ($scope) {
	
}]);
