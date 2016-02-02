angular.module('yxaquant.stock', [])

.controller('StockGroupController', ['$scope','groups','$location','$routeParams',function ($scope, groups, $location, $routeParams) {
    $scope.items = groups

    $scope.goto = function (id) {
        $location.path('/stock-group/'+id)
    }
    
    $scope.pagination = {
        start: +groups.$response.headers('items-start'),
        end: +groups.$response.headers('items-end'),
        total: +groups.$response.headers('items-total'),
        page: $routeParams.page

    }
}])
.controller('StockGroupDetailCtrl', ['$scope','group','SearchStock','$routeParams','$timeout','StockGroup',
                            function ($scope,  group,  SearchStock,  $routeParams,  $timeout,  StockGroup) {
    $scope.group = group
    $scope.stock = {}

    $scope.search = function (keyword) {
        SearchStock.query({keyword: keyword}, function(data){
            $scope.stock.searchList = data
        })

    }
    $scope.chooseItem = function (item) {
        $scope.stock.data = item
        $scope.stock.keyword = $scope.stock.data.name
    }
    $scope.inputBlur = function () {
        $timeout(function (argument) {
            $scope.stock.focus=false 
            if($scope.stock.data)
                $scope.stock.keyword = $scope.stock.data.name
            else
                $scope.stock.keyword = ''
        }, 100)

    }
    $scope.add = function () {
        if ($scope.stock.data) {
            var newStock = {
                id: $scope.stock.data,
                name: $scope.stock.data.name,
                weight: 0
            }
            $scope.group.stocks.push(newStock)
            $scope.stock = {}
        } else {
            search.focus();
        }
    }
    $scope.delete = function (i) {
        $scope.group.stocks.splice(i,1)
    }
    $scope.save = function () {
        if ($scope.chosenStocks.length) $scope.group.stocks = $scope.group.stocks.concat($scope.chosenStocks)
        
        StockGroup.update($scope.group, function (data) {
            console.log(data)
            alert('已保存')
        })
    }

    $scope.uniqStocks = function (stocks) {
        return _.uniqBy(stocks, 'id')
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
    $scope.goto = function (id) {
        $location.path('/stock/'+id)
    }


}])

.controller('StockDetailController', ['$scope', 'stock', function ($scope, stock) {
    $scope.item = $scope.i = stock
}]);
