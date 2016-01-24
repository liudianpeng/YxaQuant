'use strict';

// Declare app level module which depends on views, and components
angular.module('yxaquant', [
    'ngRoute',
    'bgf.paginateAnything',
    'yxaquant.services',
    'yxaquant.stock',
    'yxaquant.account',
    'yxaquant.task',
    'yxaquant.user',
    'yxaquant.plugin',
    'yxaquant.config'
])
.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    
    $routeProvider
        .when('/account', {
            controller: 'AccountListController',
            templateUrl: 'templates/account-list.html',
            resolve: {
                accounts: ['$route', 'Account', function ($route, Account){
                    return Account.query($route.current.params).$promise;
                }]
            }
        })
        .when('/account/create', {
            controller: 'AccountCreateController',
            templateUrl: 'templates/account-edit.html',
            resolve: {
            }
        })
        .when('/account/:id', {
            controller: 'AccountDetailController',
            templateUrl: 'templates/account-detail.html',
            resolve: {
                account: ['$route', 'Account', function ($route, Account){
                    if($route.current.params.id === 'new'){
                        return new Account();
                    }
                    return Account.get($route.current.params).$promise;
                }]
            }
        })
        .when('/account/:id/edit', {
            controller: 'AccountEditController',
            templateUrl: 'templates/account-edit.html',
            resolve: {
                account: ['$route', 'Account', function ($route, Account){
                    if($route.current.params.id === 'new'){
                        return new Account();
                    }
                    return Account.get($route.current.params).$promise;
                }]
            }
        })
        .when('/stock-group', {
            controller: 'StockGroupController',
            templateUrl: 'templates/stock-group-list.html',
            resolve: {
                groups: ['$route', 'StockGroup', function ($route, StockGroup){
                    return StockGroup.query($route.current.params).$promise;
                }]
            }
        })
        .when('/stock', {
            controller: 'StockListController',
            templateUrl: 'templates/stock-list.html',
            resolve: {
                // stocks: ['$route', 'Stock', function ($route, Stock){
                //     var pageNum = $route.current.params.page+1
                //     var perPage = 10
                //     var params = {
                //         skip: perPage * (pageNum-1),
                //         limit: perPage
                //     }
                //     return Stock.query(params).$promise;
                // }]
            }
        })
        .when('/stock/:id', {
            controller: 'StockDetailController',
            templateUrl: 'templates/stock-detail.html',
            resolve: {
                stock: ['$route', 'Stock', function ($route, Stock){
                    if($route.current.params.id === 'new'){
                        return new Stock();
                    }
                    return Stock.get($route.current.params).$promise;
                }]
            }
        })
        .when('/task', {
            controller: 'TaskListController',
            templateUrl: 'templates/task-list.html',
            resolve: {
                // tasks: ['$route', 'Task', function ($route, Task){
                //     return Task.query($route.current.params).$promise;
                // }]
            }
        })
        .when('/task/create', {redirectTo: '/task/create/1'})
        .when('/task/create/1', {
            controller: 'TaskCreateStep_1Ctrl',
            templateUrl: 'templates/task-create-1.html',
            resolve: {
                tasks: ['$route', 'Task', function ($route, Task){
                    return Task.query($route.current.params).$promise;
                }],
                accounts: ['$route', 'Account', function ($route, Account){
                    return Account.query($route.current.params).$promise;
                }]
            }
        })
        .when('/task/create/2', {
            controller: 'TaskCreateStep_2Ctrl',
            templateUrl: 'templates/task-create-2.html',
            resolve: {
                tasks: ['$route', 'Task', function ($route, Task){
                    return Task.query($route.current.params).$promise;
                }],
                check: checkCreateRoute
            }
        })
        .when('/task/create/3', {
            controller: 'TaskCreateStep_3Ctrl',
            templateUrl: 'templates/task-create-3.html',
            resolve: {
                tasks: ['$route', 'Task', function ($route, Task){
                    return Task.query($route.current.params).$promise;
                }],
                stocks: ['$route', 'Task', function ($route, Task){
                    console.log($route.current.params)
                }],
                accounts: ['$route', 'Account', function ($route, Account){
                    return Account.query($route.current.params.accounts).$promise;
                }],
                check: checkCreateRoute
            }
        })
        .when('/task/create/setting', {
            controller: 'TaskCreateSettingCtrl',
            templateUrl: 'templates/task-create-setting.html',
            resolve: {
                tasks: ['$route', 'Task', function ($route, Task){
                    return Task.query($route.current.params).$promise;
                }],
                stocks: ['$route','$q','Stock', function ($route, $q, Stock){
                    var promises = getParamAsArray($route.current.params.stock_ids).map(function(id){
                        return Stock.get({id: id}).$promise;
                    })
                    return $q.all(promises)
                }],
                accounts: ['$route','$q','Account', function ($route, $q, Account){
                    var promises = getParamAsArray($route.current.params.accounts).map(function(id){
                        return Account.get({id: id}).$promise;
                    })
                    return $q.all(promises)
                }]
            }
        })
        .when('/task/:id', {
            controller: 'TaskDetailController',
            templateUrl: 'templates/task-detail.html',
            resolve: {
                task: ['$route', 'Task', function ($route, Task){
                    if($route.current.params.id === 'new'){
                        return new Task();
                    }
                    return Task.get({id: $route.current.params.id}).$promise;
                }]
            }
        })
        .when('/user', {
            controller: 'UserListController',
            templateUrl: 'templates/user-list.html',
            resolve: {
                users: ['$route', 'User', function ($route, User){
                    return User.query($route.current.params).$promise;
                }]
            }
        })
        .when('/user/:id', {
            controller: 'UserProfileController',
            templateUrl: 'templates/user-profile.html',
            resolve: {
                user: ['$route', 'User', function ($route, User){
                    if($route.current.params.id === 'new'){
                        return new User();
                    }
                    return User.get({id: $route.current.params.id}).$promise;
                }]
            }
        })
        .when('/config', {
            controller: 'ConfigController',
            templateUrl: 'templates/config-list.html',
            resolve: {
                configs: ['$route', 'Config', function ($route, Config){
                    return Config.query($route.current.params).$promise;
                }]
            }
        })
        .when('/404', {
            templateUrl: 'templates/404.html'
        })
        .otherwise({redirectTo: '/404'});

    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });

}])
.run(['$rootScope', '$location', function ($rootScope, $location) {
    $rootScope.$on( "$routeChangeStart", function(event, next, current) {
        // if ( $rootScope.loggedUser == null ) {
        //     // no logged user, we should be going to #login
        //     if ( next.templateUrl == "partials/login.html" ) {
        //          // already going to #login, no redirect needed
        //     } else {
        //         // not going to #login, we should redirect now
        //         $location.path( "/login" );
        //     }
        // }         
    });
}])
.controller('NavController', [function() {

}]);
