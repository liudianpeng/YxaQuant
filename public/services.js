'use strict';

// add raw response as an attribute of resource,
// so that we can get http status, header etc from resource in controllers
var responseInterceptor = function (response) {
    response.resource.$response = response;
    return response.resource;
};

angular.module('yxaquant.services', ['ngResource'])

.service('Stock', ['$resource', function ($resource) {

    var stock = $resource('api/stock/:id', {id: '@id'}, {
        query: {method: 'GET', isArray: true, interceptor: {response: responseInterceptor}},
        create: {method: 'POST'},
        update: {method: 'PUT'}
    });
    
    // Angular mix PUT and POST methot to $save,
    // we seperate them to $create and $update here
    stock.prototype.$save = function (a, b, c, d) {
        if (this.id && !a.restore) {
            return this.$update(a, b, c, d);
        }
        else {
            return this.$create(a, b, c, d);
        }
    }
    
    return stock;
}])

.service('SearchStock', ['$resource', function ($resource) {
    var stock = $resource('api/stock', {keyword: '@key', accounts: []}, {
        query: {method: 'GET', isArray: true, interceptor: {response: responseInterceptor}}
    });    
    return stock;
}])

.service('StockGroup', ['$resource', function ($resource) {

    var stockGroup = $resource('api/stockGroup/:id', {id: '@id'}, {
        query: {method: 'GET', isArray: true, interceptor: {response: responseInterceptor}},
        create: {method: 'POST'},
        update: {method: 'PUT'}
    });
    
    // Angular mix PUT and POST methot to $save,
    // we seperate them to $create and $update here
    stockGroup.prototype.$save = function (a, b, c, d) {
        if (this.id && !a.restore) {
            return this.$update(a, b, c, d);
        }
        else {
            return this.$create(a, b, c, d);
        }
    }
    
    return stockGroup;
}])

.service('Account', ['$resource', function ($resource) {

    var account = $resource('api/account/:id', {id: '@id'}, {
        query: {method: 'GET', isArray: true, interceptor: {response: responseInterceptor}},
        create: {method: 'POST'},
        update: {method: 'PUT'}
    });
    
    account.prototype.$save = function (a, b, c, d) {
        if (this.id) {
            return this.$update(a, b, c, d);
        }
        else {
            return this.$create(a, b, c, d);
        }
    }
    
    return account;
}])

.service('Task', ['$resource', function ($resource) {

    var task = $resource('api/task/:id', {id: '@id'}, {
        query: {method: 'GET', isArray: true, interceptor: {response: responseInterceptor}},
        create: {method: 'POST'},
        update: {method: 'PUT'}
    });
    
    task.prototype.$save = function (a, b, c, d) {
        if (this.id) {
            return this.$update(a, b, c, d);
        }
        else {
            return this.$create(a, b, c, d);
        }
    }
    
    return task;
}])

.service('User', ['$resource', function ($resource) {

    var user = $resource('api/user/:id', {id: '@id'}, {
        query: {method: 'GET', isArray: true, interceptor: {response: responseInterceptor}},
        create: {method: 'POST'},
        update: {method: 'PUT'}
    });
    
    user.prototype.$save = function (a, b, c, d) {
        if (this.id) {
            return this.$update(a, b, c, d);
        }
        else {
            return this.$create(a, b, c, d);
        }
    }
    
    return user;
}])

.service('Config', ['$resource', function ($resource) {
    
    var config = $resource('api/config/:id', {id: '@id'}, {
        query: {method: 'GET', isArray: true, interceptor: {response: responseInterceptor}},
        create: {method: 'POST'},
        update: {method: 'PUT'}
    });
    
    config.prototype.$save = function (a, b, c, d) {
        if (this.id) {
            return this.$update(a, b, c, d);
        }
        else {
            return this.$create(a, b, c, d);
        }
    }
    
    return config;
}])
