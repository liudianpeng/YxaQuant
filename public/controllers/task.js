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
    
    // $scope.taskY = Mock.mock({
    //     "_id" : "56970b4e88b6343729853d57",
    //     "id" : "2343524234235324",
    //     "timeStart" : "2015-07-08T01:30:00.000Z",
    //     "timeEnd" : "2015-07-08T07:00:00.000Z",
    //     "status" : "in progress",
    //     "progress|0.2" : 1,
    //     "stocks|1" : [
    //         {
    //             "id" : Mock.mock('@string("number", 10)'),
    //             "name" : Random.csentence(5),
    //             "code" : Mock.mock('@string("upper", 2)') + Mock.mock('@string("number", 5)'),
    //             "rules" : {
    //                 "lowestPrice|0-10000" : 1,
    //                 "highestPrice|10000-10000000" : 1,
    //                 "timeStep|0-100" : 1
    //             },
    //             "targetRatio" : 1,
    //             "ratio|0.2" : 1,
    //             "volume|10000-1000000" : 1,
    //             "amount|10000-1000000" : 1,
    //             "accounts|2" : [
    //                 {
    //                     "id" : "",
    //                     "name" : Mock.mock('@csentence(5)'),
    //                     "code" : Mock.mock('@string("upper", 2)') + Mock.mock('@string("number", 5)'),
    //                     "volume" : function() {
    //                         return this.volumeCompleted + this.volumeDeclared + this.volumeTodo
    //                     },
    //                     "volumeCompleted|100-10000" : 1,
    //                     "volumeDeclared|1000-10000" : 1,
    //                     "volumeTodo|1000-10000" : 1,
    //                     "rules" : {
    //                         "lowestPrice|0-10000" : 1,
    //                         "highestPrice|10000-10000000" : 1,
    //                         "timeStep|0-100" : 1
    //                     },
    //                     "declarations|2" : [
    //                         {
    //                             "type" : "",
    //                             "serialNumber" : Mock.mock('@string("upper", 5)') + Mock.mock('@string("number", 5)'),
    //                             "price" : function () {
    //                                 return this.amount*10.6
    //                             },
    //                             "time" : "2015-07-08T01:30:00.000Z",
    //                             "volume|1000-10000" : 1,
    //                             "volumeCompleted" : 0,
    //                             "amount|1000-10000" : 1,
    //                             "status" : function (){
    //                                 return _.sample( "not declared|declared|completed|partial completed".split('|') )
    //                             }
    //                         }
    //                     ],
    //                     "transactions|2" : [
    //                         {
    //                             "serialNumber" : Mock.mock('@string("upper", 5)') + Mock.mock('@string("number", 5)'),
    //                             "price" : function () {
    //                                 return this.amount*10.6
    //                             },
    //                             "time" : "2015-07-08T01:30:00.000Z",
    //                             "volume|1000-10000" : 1,
    //                             "amount|1000-10000" : 1
    //                         }
    //                     ]
    //                 }
    //             ]
    //         }
    //     ]
    // })
    $scope.task = task

    $scope.sumup = function (arr, key) {
        return arr.reduce(function(sumup,account){
            return sumup + +account[key]
        },0)
    }
    $scope.save = function () {
        Task.update(task, function (data) {
            console.log(data)
            location.reload()
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
        if (type=='normal') {
            $location.path( "/task/create/2" ).search({accounts: ids});
        } else {
            // $location.path( "/task/create-2" );
        }
    }

}])
.controller('TaskCreateStep_2_Ctrl', 
            ['$scope', '$location','$routeParams', 'tasks', 
    function ($scope,   $location,  $routeParams,   tasks) {
        $scope.goto = function(type){
            Object.assign($routeParams, {type: type})
            $location.path( '/task/create/3' ).search($routeParams)
        }
}])
.controller('TaskCreateStep_3_Ctrl', ['$scope', '$location', 'tasks','accounts','Task','SearchStock','$timeout','$routeParams',
                            function( $scope,   $location,   tasks,  accounts,  Task,  SearchStock,  $timeout,  $routeParams) {
    $scope.isBuy = $routeParams.type!=='sell'
    if ($scope.isBuy)
        $scope.stocks = [{}]
    else
        $scope.stocks = accounts.reduce(function(arr, account){ 
            account.stocks = account.stocks.map(function(stock){
                return {
                    keyword: stock.name,
                    data: stock
                }
            })
            return arr.concat(account.stocks)
        }, [])

    $scope.add = function () {
        $scope.stocks.push({})
    }
    $scope.inputBlur = function (stock) {
        $timeout(function (argument) {
            stock.focus=false 
            if(stock.data)
                stock.keyword = stock.data.name
            else
                stock.keyword = ''
        }, 100)

    }
    $scope.search = function (stock, keyword) {
        // var params = {keyword: keyword}
        // if ($routeParams.type=='sell')
        //     Object.assign(params, {accounts: $routeParams.accounts})
        SearchStock.query({keyword: keyword}, function(data){
            stock.searchList = data
        })

    }
    $scope.chooseItem = function (stock, item) {
        stock.data = item
        stock.keyword = stock.data.name
    }
    $scope.delete = function (i) {
        $scope.stocks.splice(i,1)
    }
    $scope.next = function (i) {
        var stock_ids = $scope.stocks.reduce(function(arr, stock){
            if(stock.data)
                arr.push(stock.data.id)
            return arr
        }, [])
        $location.path( "/task/create/4" ).search({stock_ids: stock_ids, accounts: $routeParams.accounts});
    }
}])
.controller('TaskCreateStep_4_Ctrl', ['$scope', '$location', 'tasks','stocks','accounts', 'Task','$timeout', '$routeParams',
                            function ( $scope,   $location,   tasks,  stocks,  accounts,   Task,  $timeout,   $routeParams) {
    $scope.accounts = accounts
    $scope.stocks = stocks
    $scope.calType = 'targetRatio'
    $scope.haha = 'xiao'
    $scope.submit = function () {
        var data = {
            type: 'normal',
            timeStart: $scope.startDate,
            timeEnd: $scope.endDate,
            direction: !!$scope.direction,
            accounts: $scope.accounts.map(function(i){ return i.id }),
            stocks: $scope.stocks.map(function(stock){
                var stockData = {
                    id: stock.id,
                    rules: {
                        priceDiffPercentage: $scope.priceDiffPercentage,
                        opponentRatio: $scope.opponentRatio,
                        opponentLevels: $scope.opponentLevels,
                        timeStep: $scope.timeStep,
                        lowestPrice: $scope.lowestPrice,
                        highestPrice: $scope.highestPrice
                    }
                }
                stockData[$scope.calType] = $scope.calNum 
                return stockData
            })
        }
        Task.create(data, function(data){
            $location.path( "/task/"+data.id )
        })
    }
}])

