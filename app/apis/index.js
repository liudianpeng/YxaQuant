module.exports = function(app, router) {
    // register routes
    router = require('./stock.js')(router);
    router = require('./account.js')(router);
    app.use('/api', router);
}
