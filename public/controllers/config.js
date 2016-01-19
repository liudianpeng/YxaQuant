angular.module('yxaquant.config', [])

.controller('ConfigController', ['$scope','configs', function ($scope, configs) {
    $scope.items = configs
}]);
