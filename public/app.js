'use strict';

// Declare app level module which depends on views, and components
angular.module('yxaquant', [
    'ngRoute',
    'yxaquant.services',
    'yxaquant.stock',
    'yxaquant.account',
    'yxaquant.task',
    'yxaquant.user',
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
        .when('/stock-group', {
            controller: 'StockGroupController',
            templateUrl: 'templates/stock-group-list.html',
            resolve: {
                stocks: ['$route', 'StockGroup', function ($route, StockGroup){
                    return StockGroup.query($route.current.params).$promise;
                }]
            }
        })
        .when('/stock', {
            controller: 'StockListController',
            templateUrl: 'templates/stock-list.html',
            resolve: {
                stocks: ['$route', 'Stock', function ($route, Stock){
                    return Stock.query($route.current.params).$promise;
                }]
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
                tasks: ['$route', 'Task', function ($route, Task){
                    return Task.query($route.current.params).$promise;
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

.controller('NavController', [function() {

}]);
