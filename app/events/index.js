module.exports = function(io, socketServer, quotes) {
    var trade = require('./trade.js')(socketServer);
    var market = require('./market.js')(io, quotes);
    return {trade: trade, market: market};
};

