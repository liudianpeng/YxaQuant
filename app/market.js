'use strict';

var http = require('http');
var _ = require('lodash');
var Stock = require('./models/stock');

var subscribes = []; // 正在关注价格变化的股票的代码
var stocks = {}; // 用于检测价格变化

var xueqiuQuotec = 'http://xueqiu.com/v4/stock/quotec.json?code=';
var xueqiuPankou = 'http://xueqiu.com/stock/pankou.json?symbol=';
var interval = 1000;

module.exports = function(quant) {

    setInterval(function() {

        if(!subscribes.length) {
            return;
        }
        
        // 调用雪球价格接, 一次查询多个股价
        http.get(xueqiuQuotec + subscribes.join(), function(res) {
            var data = '';
            res.on('data', function(chunk) {
                data += chunk;
            });
            res.on('end', function() {
                pushPriceUpdate(JSON.parse(data.toString()));
            })
        });

        // 调用雪球盘口接口, 一次查询一个股票的盘口
        subscribes.forEach(code => {
            http.get(xueqiuPankou + code, function(res) {
                var data = '';
                res.on('data', function(chunk) {
                    data += chunk;
                });
                res.on('end', function() {
                    pushOpponentUpdate(code, JSON.parse(data.toString()));
                })
            })
        });

    }, interval);

    var pushPriceUpdate = function(data) {

        subscribes.forEach(code => {

            if(stocks[code].current !== Number(data[code][0])) {

                stocks[code].current = data[code][0];
                stocks[code].offset = data[code][1];
                stocks[code].percentage = data[code][2];
                stocks[code].time = data[code][3];

                quant.emit('stockPriceChange', stocks[code]);

                stocks[code].save();
            }

        });

    };

    var pushOpponentUpdate = function(code, data) {
        
        var quoteQueue = {
            buy: [], sell: []
        }

        var levels = 5;

        for(var i = 0; i < levels; i++) {
            quoteQueue.buy.push({price: data['bp' + (i + 1)], volume: data['bc' + (i + 1)]});
            quoteQueue.sell.push({price: data['sp' + (i + 1)], volume: data['sc' + (i + 1)]});
        }

        if(!_.isEqual(stocks[code].quoteQueue, quoteQueue)) {
            stocks[code].quoteQueue = quoteQueue;
            stocks[code].current = data.current;
            quant.emit('stockOpponentChange', stocks[code]);
        }
    };

    return {
        subscribe: function(newSubscribes) {
            newSubscribes.forEach(code => {
                Stock.findOne({code: code}, (err, stock) => {
                    stocks[code] = stock;
                    subscribes.push(code);
                })
            })
        },
        unsubscribe: function(unsubscribes) {
            subscribes = _.difference(subscribes, unsubscribes);
        }
    };
};
