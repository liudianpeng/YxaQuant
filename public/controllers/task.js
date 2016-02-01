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

    $scope.filter = {
        skip: 10,
        limit: 10
    }

    $scope.chosenStocks = []

    $scope.getStocks = function (params) {
        $scope.stocks = Stock.query(params)
    }
    $scope.getStocks($scope.filter)
    $scope.search = function () {
        $location.path('/task')
    }

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
    $scope.doSearch = function (key, val) {
        var keys = ['percentage', 'pb', 'peLyr', 'peTtm', 'psr', 'marketCapital', 'floatMarketCapital']
        var params = {}
        keys.forEach(function (key) {
            params[key] = $scope.filter[key]
            params[key] = params[key].map(function (i) {
                return i=='Infinity' ? '' : i
            })
            if (['marketCapital', 'floatMarketCapital'].indexOf(key) > -1) {
                params[key] = params[key].map(function (i) {
                    if (typeof i == 'string' && i == 'Infinity')
                        return i
                    else 
                        return i*Math.pow(10, 8)

                })
            }
            if ($scope.filter[key])
                params[key] = params[key].join('-')
        })
        params.keyword = $scope.filter.keyword
        $scope.getStocks(params)
    }
    $scope.checkAll = function () {
        $scope.stocks.forEach(function (s) {
            s.checked = $scope.isAllChecked
            $scope.checkIt(s)
        })
    }
    $scope.checkIt = function (stock) {
        if(stock.checked)
            $scope.addToChosen(stock)
        else
            $scope.removeFromChosen(stock)
    }
    $scope.addToChosen = function (stock) {
        $scope.chosenStocks.push(stock)
    }
    $scope.removeFromChosen = function (stock) {
        $scope.chosenStocks.some(function (s,i) {
            if (s.id == stock.id)
                $scope.chosenStocks.splice(i,1)
            return s.id == stock.id
        })
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

