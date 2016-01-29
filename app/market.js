'use strict';

var _       = require('lodash');
var http    = require('http');
var moment  = require('moment');
var Stock   = require('./models/stock');
var Config  = require('./models/config');

var subscribedStocks = {}; // 用于检测价格变化, 存储形式为{[id]: stock}
var subscribedStockIds = []; // 正在关注价格变化的股票的id
var pollingInterval = 1000;

function Market(quant) {

    var xueqiuCookie;

    /**
     * 从数据库Config载入subscribedStockIds, 并填充subscribedStocks
     * @return Promise 订阅的股票信息, subscribedStocks填充后resolve
     */
    function loadSubscribes () {

        return new Promise((resolve, reject) => {

            Config.findOne({key: 'subscribedStockIds'}).exec().then(subscribedStockIdsConfig => {
                
                if(!subscribedStockIdsConfig) {
                    console.log('No subscribed stocks found.');
                    resolve();
                }
                
                subscribedStockIds = subscribedStockIdsConfig.value;
                
                Stock.find({_id: {$in: subscribedStockIds}}).exec().then(result => {
                    
                    result.forEach(stock => {
                        subscribedStocks[stock.id] = stock;
                    });

                    console.log('Subscribes loaded: ', result.map(stock => stock.code + ' ' + stock.name));

                    resolve(subscribedStocks);
                });
            });
        });
    };

    /**
     * 添加订阅到subscribedStockIds, 获得完整的新订阅的股票信息, 然后保存到数据库Config
     * @return Promise 新订阅股票信息, 获得新订阅股票信息后resolve
     */
    function subscribe (stockIds) {
        
        // 防止重复订阅
        stockIds = _.difference(stockIds.map(id => id.toString()), subscribedStockIds);

        // 无需订阅时也resolve Promise
        if(!stockIds || !stockIds.length) {
            return Promise.resolve([]);
        }

        console.log('Subscribing:', stockIds);

        // TODO 匹配不到id的应该报错, 而$in不会
        return Stock.find({_id: {$in: stockIds}}).exec()

        .then(stocksInDB => {
            
            stocksInDB.forEach(stock => {
                subscribedStocks[stock.id] = stock;
                subscribedStockIds.push(stock.id);
            });

            Config.findOneAndUpdate(
                {key: 'subscribedStockIds'},
                {value: subscribedStockIds},
                {new: true, upsert: true}
            ).exec();
        });
    };

    /**
     * 取消订阅股票
     * @return Promise 写入数据库后resolve
     */
    function unsubscribe (stockIds) {
        subscribedStockIds = _.difference(subscribedStockIds, stockIds);
        return Config.findOneAndUpdate({key: 'subscribedStockIds'}, {value: subscribedStockIds}).exec();
    };

    /**
     * 从雪球获得完整的股票信息, 存入数据库, 如果在订阅中, 也会更新订阅
     * @return Promise 新的股票信息
     */
    function getStock (stockId) {

        return new Promise((resolve, reject) => {

            Stock.find({_id: stockId}).exec()

            .then(stock => {
                // TODO 需要考虑xuexiuCookie无效重新获取的情况
                http.get({
                    hostname: 'xueqiu.com',
                    path: '/v4/stock/quote.json?code=' + stock.code,
                    headers: {
                        cookie: xueqiuCookie
                    }
                }, function(res){

                    var data = '';

                    res.on('data', function(chunk){
                        data += chunk;
                    });

                    res.on('end', function(){

                        var stockData = JSON.parse(data)[code];

                        if(!stockData.code || !stockData.name) {
                            reject('Fail to get stock data of ' + code + ' from Xueqiu.');
                        }

                        stockData = _.mapKeys(stockData, function(value, key) {
                            return _.camelCase(key);
                        });

                        stockData.code = stockData.symbol;
                        stockData.currency = stockData.currencyUnit;
                        stockData.type = 'stock';

                        // TODO 不确定此处是否正常工作
                        stock = stockData;

                        if(subscribedStocks[stock.id]) {
                            subscribedStocks[stock.id] = stock;
                        }

                        stock.save((err, stock) => {
                            resolve(stock);
                        });
                    });
                });
            });
        });
    };

    /**
     * 获得对手盘的信息, 若已订阅, 则更新订阅并更新数据库
     * @return Promise 盘口信息
     */
    function getOpponents (stockId) {

        var xueqiuPankou = 'http://xueqiu.com/stock/pankou.json?symbol=';

        return new Promise((resolve, reject) => {

            http.get(xueqiuPankou + subscribedStocks[stockId].code, function(res) {

                var data = '';

                res.on('data', function(chunk) {
                    data += chunk;
                });

                res.on('end', function() {

                    data = JSON.parse(data.toString());

                    var quoteQueue = {
                        buy: [], sell: []
                    }

                    var levels = 5;

                    for(var i = 0; i < levels; i++) {
                        quoteQueue.buy.push({price: data['bp' + (i + 1)], volume: data['bc' + (i + 1)]});
                        quoteQueue.sell.push({price: data['sp' + (i + 1)], volume: data['sc' + (i + 1)]});
                    }

                    if(subscribedStocks[stockId] && !_.isEqual(subscribedStocks[stockId].quoteQueue, quoteQueue)) {
                        subscribedStocks[stockId].quoteQueue = quoteQueue;
                        subscribedStocks[stockId].save();
                        quant.emit('stockOpponentChange', subscribedStocks[stockId]);
                    }

                    resolve(quoteQueue);
                });
            });
        });
    }

    // 批量获得股价, 未订阅的加入订阅, 更新订阅, 更新数据库
    // 返回一个stockIds对应的stocks的Promise
    function getQuotes (stockIds) {
        
        // console.log('Getting quotes of ', stockIds);

        return subscribe(stockIds)

        .then((newSubscribedStocks) => {

            var codes = stockIds.map(stockId => subscribedStocks[stockId].code);
            
            return new Promise((resolve, reject) => {
                
                http.get('http://xueqiu.com/v4/stock/quotec.json?code=' + codes.join(), function(res){
                    
                    var data = '';
                    
                    res.on('data', function(chunk){
                        data += chunk;
                    });
                    
                    res.on('end', function(){
                        
                        data = JSON.parse(data.toString());
                        
                        var stocks = stockIds.map(stockId => {

                            var stock = subscribedStocks[stockId];
                            var code = stock.code;

                            if(stock.current !== Number(data[code][0])) {

                                stock.current = data[code][0];
                                stock.offset = data[code][1];
                                stock.percentage = data[code][2];
                                stock.time = data[code][3];

                                stock.save();

                                quant.emit('stockPriceChange', stock);
                            }
                            
                            return stock;
                        });

                        resolve(stocks);
                    });
                });
            });
        });
    };

    function updateXueqiuCookie () {
        return new Promise((resolve, reject) => {
            http.get('http://xueqiu.com', function(res){
                if(res.headers['set-cookie'] === undefined) {
                    reject('Xueqiu didn\'t response a cookie.');
                }
                xueqiuCookie = res.headers['set-cookie'];
                resolve(res.headers['set-cookie']);
            });
        });
    };

    loadSubscribes().then(() => {

        setInterval(function polling() {

            var d = moment();

            if(!(d.day() >= 1 && d.day() <= 5 && (d.isBetween({hour:9, minute:15}, {hour:11, minute:30}) || d.isBetween({hour:13}, {hour:15}, 'hour')))) {
                return;
            }

            if(!subscribedStockIds.length) {
                return;
            }
            
            getQuotes(subscribedStockIds);

            subscribedStockIds.forEach(code => {
                getOpponents(code);
            });

        }, pollingInterval);

    });
    

    return { subscribe, unsubscribe, getStock, getOpponents, getQuotes };
}

module.exports = Market;
