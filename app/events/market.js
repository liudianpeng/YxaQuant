var http = require('http');

var subscribes = [];

var url = 'http://xueqiu.com/v4/stock/quotec.json?code=';

module.exports = function(io, quotes) {

    var handle = function(data) {
        var quotesLatest = JSON.parse(data.toString());
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
            console.log('Data sent:', quotes);
        }
    }

    setInterval(function() {
        if(!subscribes.length) {
            return;
        }
        http.get(url + subscribes.join(), function(res){
            var data = '';
            res.on('data', function(chunk) {
                data += chunk;
            });
            res.on('end', function() {
                handle(data.toString());
            })
        });
    }, 300);

    return {
        subscribe: function(newSubscribes) {
            subscribes = newSubscribes;
        }
    };
};
