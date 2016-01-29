'use strict';

var util = require('util');
var EventEmitter = require('events').EventEmitter;
var Stock = require('./models/stock');

function Quant () {

    EventEmitter.call(this);
    
    this.on('stockPriceChange', function(stock) {
        console.log('stockPriceChange', stock.name, stock.current, stock.time);
    });

    this.on('stockOpponentChange', function(stock) {
        // console.log('stockOpponentChange', stock.name, stock.quoteQueue.sell[0].price, stock.quoteQueue.sell[0].volume);
    });

    this.on('declarationSucceed', function(data) {
        console.log('declarationSucceed', data);
    });

    this.on('transactionSucceed', function(data) {
        console.log('transactionSucceed', data);
    });

    this.start = function(task) {
        return task;
    }

    this.modify = function(task) {
        return task;
    }

    this.pause = function(task) {
        return task;
    }

    this.cancel = function(task) {
        return task;
    }
};

util.inherits(Quant, EventEmitter);

module.exports = new Quant();
