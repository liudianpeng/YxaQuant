var http = require('http');

module.exports = function(io, quotes) {
    setInterval(function() {
        http.get('http://xueqiu.com/v4/stock/quotec.json?code=SH000001,NASDAQ,BTCNCNY', function(res){

            res.on('data', function (chunk) {

                var quotesLatest = JSON.parse(chunk.toString());
                var quotesHasUpdate = {};
                for(var key in quotesLatest) {

                    if(quotes[key] && quotes[key][0] === quotesLatest[key][0]) {
                        continue;
                    }

                    quotes[key] = quotesLatest[key];
                    quotesHasUpdate[key] = quotesLatest[key];
                }

                if(Object.keys(quotesHasUpdate).length > 0){
                    io.sockets.send(quotes);
                    console.log('Data sent.', quotes);
                }
            });
        });
    }, 300);
};
