angular.module('yxaquant.task', [])


.controller('TaskListController', ['$scope','$routeParams','$location', 
                            function($scope,  $routeParams,  $location) {

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
    $scope.getAccountsName = function (i) {
        return i.stocks.length && i.stocks[0].accounts.map(function(a){return a.name}).join(",")
    }
    $scope.getStocksName = function (i) {
        return i.stocks.slice(0,5).map(function(s){return s.name}).join(",") + " 等"
    }
    $scope.getTime = function (str) {
        var i = new Date(str)
        return [i.getFullYear(), i.getMonth()+1, i.getDate()].join('-')
    }

}])
.controller('TaskDetailController', ['$scope', 'task', 'Task','$location', function ($scope, task, Task, $location) {
    var Random = Mock.Random
    $scope.task = task;
    $scope.task.timeStart && ($scope.task.timeStart = moment(task.timeStart).format('HH:mm:ss'));
    $scope.task.timeEnd && ($scope.task.timeEnd = moment(task.timeEnd).format('HH:mm:ss'));
    $scope.sumup = function (arr, key) {
        return arr.reduce(function(sumup,account){
            return sumup + +account[key]
        },0)
    }
    $scope.save = function () {
        Task.update(task, function (data) {
            console.log(data)
        })
    }
    $scope.pause = function () {
        task.status = 'paused'
        Task.update(task, function (data) {
            console.log(data)
        })
    }
    $scope.cancel = function () {
        task.status = 'canceled'
        Task.update(task, function (data) {
            console.log(data)
        })
    }
}])
.controller('TaskCreateStep_1_Ctrl', 
            ['$scope','$location','$routeParams','tasks','accounts', 
    function ($scope,  $location,  $routeParams,  tasks,  accounts) {
    $scope.items = tasks
    $scope.accounts = accounts
    $scope.selection = []
    $scope.toggleSelection = function toggleSelection(fruitName) {
        var idx = $scope.selection.indexOf(fruitName);
        if (idx > -1) {
          $scope.selection.splice(idx, 1);
        } else {
          $scope.selection.push(fruitName);
        }
    }
    $scope.comfirm = function (type) {
        var ids = $scope.selection.map(function(i){return i.id})
        $location.path( "/task/create/2" ).search({accounts: ids, type: type});
    }

}])
.controller('TaskCreateStep_2_Ctrl', 
            ['$scope', '$location','$routeParams', 'tasks', 
    function ($scope,   $location,  $routeParams,   tasks) {
        $scope.goto = function(direction){
            Object.assign($routeParams, {direction: direction})
            $location.path( '/task/create/3' ).search($routeParams)
        }
}])
.controller('TaskCreateStep_3_Ctrl', ['$scope', '$location', 'tasks','accounts','Stock','SearchStock','$timeout','$routeParams',
                            function( $scope,   $location,   tasks,  accounts,   Stock,  SearchStock,  $timeout,  $routeParams) {

    $scope.chosenStocks = []
    $scope.uniqStocks = function (stocks) {
        return _.uniqBy(stocks, 'id')
    }
    $scope.next = function (i) {
        var stock_ids = $scope.chosenStocks.map(function(stock){
            return stock.id
        })
        Object.assign($routeParams, {stock_ids: stock_ids})
        $location.path("/task/create/4").search($routeParams)
    }
}])
.controller('TaskCreateStep_4_Ctrl', ['$scope', '$location', 'tasks','stocks','accounts', 'Task','$timeout', '$routeParams',
                            function ( $scope,   $location,   tasks,  stocks,  accounts,   Task,  $timeout,   $routeParams) {
    $scope.accounts = accounts
    $scope.stocks = stocks
    $scope.submit = function () {
        var data = {
            type: $routeParams.type,
            direction: $routeParams.direction=='buy',
            timeStart: $scope.startDate,
            timeEnd: $scope.endDate,
            targetRatio: $scope.targetRatio,
            ratio: $scope.ratio,
            accountIds: $scope.accounts.map(function(i){ return i.id }),
            stocks: $scope.stocks.map(function(stock){
                var stockData = {
                    id: stock.id,
                    rules: {
                        priceDiffPercentage: stock.rules.priceDiffPercentage,
                        opponentRatio: stock.rules.opponentRatio,
                        opponentLevels: stock.rules.opponentLevels,
                        timeStep: stock.rules.timeStep,
                        lowestPrice: stock.rules.lowestPrice,
                        highestPrice: stock.rules.highestPrice
                    }
                }
                stockData[stock.calType] = stock.calNum 
                return stockData
            })
        }
        Task.create(data, function(data){
            $location.path( "/task/"+data.id ).search({})
        })
    }
}])

