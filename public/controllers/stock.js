angular.module('yxaquant.stock', [])

.controller('StockGroupController', ['$scope','groups','$routeParams',function ($scope, groups, $routeParams) {
    $scope.items = groups
    
    $scope.pagination = {
        start: +groups.$response.headers('items-start'),
        end: +groups.$response.headers('items-end'),
        total: +groups.$response.headers('items-total'),
        page: $routeParams.page

    }
}])

.controller('StockListController', ['$scope','$routeParams','$location', 
                            function($scope,  $routeParams,  $location) {
    // $scope.items = stocks

    $scope.perPage = parseInt($location.search().perPage, 10) || 10;
    $scope.page = parseInt($location.search().page, 10) || 0;
    $scope.clientLimit = 250;
    $scope.serverLimit = 25000;

    $scope.params = {limit: $scope.perPage,skip: $scope.page * $scope.perPage}
    $scope.$watch('page', function(page) { 
        $location.search('page', page); 
    });
    $scope.$watch('perPage', function(page) { 
        $location.search('perPage', page); 
    });
    $scope.$on('$locationChangeSuccess', function() {
        var page = +$location.search().page;
          perPage = +$location.search().perPage;
        if(page >= 0) { $scope.page = page; };
        if(perPage >= 0) { $scope.perPage = perPage; };
    });

    $scope.$on('pagination:loadPage', function (event, status, config, total) {
        $scope.total = +total
        $scope.numPages = Math.ceil($scope.total/$scope.perPage);
    });

}])

.controller('StockDetailController', ['$scope', 'stock', function ($scope, stock) {
    $scope.item = $scope.i = stock
}]);
