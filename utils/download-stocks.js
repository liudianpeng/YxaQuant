var _       = require('lodash');
var http    = require('http');
var mongoose= require('mongoose');
var market  = require('../app/market')();
var Stock   = require('../app/models/stock');
var currentPage = 1, connections = 0, maxConnections = 20, totalCodes = [];

mongoose.connect('mongodb://localhost/yxaquant');

http.get('http://xueqiu.com', function(res){

    var cookies = res.headers['set-cookie'];
    var timestart = new Date().getTime();
    var downloadStockListInterval = setInterval(function(){

        if(connections >= maxConnections) {
            return;
        }

        connections++;
        // console.log('connections:', connections);

        http.get({
            hostname: 'xueqiu.com',
            path: '/stock/screener/screen.json?category=SH&orderby=symbol&order=asc&page=' + currentPage,
            headers: {
                cookie: cookies
            }
        }, function(res){
            var data = '';

            res.on('data', function(chunk){
                data += chunk;
            });

            res.on('end', function(){
                connections--;

                var codes = JSON.parse(data.toString()).list.map(item => item.symbol);
                
                totalCodes = totalCodes.concat(codes);

                if(codes.length === 0) {
                    // console.log('Interval cleared: downloadStockListInterval');
                    clearInterval(downloadStockListInterval);
                    return;
                }
                
                if(connections === 0) {
                    console.log('Total: ' + totalCodes.length, 'Time: ' + (new Date().getTime() - timestart));

                    // 开始股票信息下载
                    maxConnections = 40;
                    timestart = new Date().getTime();
                    var index = 0, stocksRequested = 0, stocksSaved = 0;
                    var downloadStockInterval = setInterval(function(){
                        var code = totalCodes[index];

                        if(connections >= maxConnections) {
                            return;
                        }

                        connections++;
                        stocksRequested++;
                        // console.log('Getting ' + code + '...');
                        http.get({
                            hostname: 'xueqiu.com',
                            path: '/v4/stock/quote.json?code=' + code,
                            headers: {
                                cookie: cookies
                            }
                        }, function(res){
                            var data = '';
                            res.on('data', function(chunk){
                                data += chunk;
                            });
                            res.on('end', function(){
                                connections--;

                                try {
                                    var stockData = JSON.parse(data)[code];
                                } 
                                catch(e) {
                                    console.error('Failed at ' + code, stockData);
                                    return;
                                }

                                if(!stockData.code || !stockData.name) {
                                    console.error('Failed at ' + code, stockData);
                                    return;
                                }

                                stockData = _.mapKeys(stockData, function(value, key) {
                                    return _.camelCase(key);
                                });

                                stockData.code = stockData.symbol;
                                stockData.currency = stockData.currencyUnit;
                                stockData.type = 'stock';
                                stockData.offset = stockData.change;

                                Stock.findOneAndUpdate(
                                    {code: stockData.code}, 
                                    stockData,
                                    {new: true, upsert: true}, 
                                    function(err, result) {
                                        err && console.error('Error saving', stockData.code, err);
                                        stocksSaved++;
                                        if(stocksRequested === totalCodes.length) {
                                            console.log('Stocks downloaded: ' + stocksSaved, 'Time: ' + (new Date().getTime() - timestart));
                                            mongoose.disconnect();
                                        }
                                    }
                                );
                                
                                // console.info('Saved:', stock.code, stock.name);
                            })
                        });
    
                        if(index === totalCodes.length - 1) {
                            clearInterval(downloadStockInterval);
                            // console.log('Interval cleared: downloadStockInterval');
                            return;
                        }

                        index ++;
                    });
                    // mongoose.disconnect();
                }
            });
        });

        currentPage++;
    });
    
});
