module.exports = function(app, router, quant) {
    // register routes
    router = require('./stockGroup.js')(router);
    router = require('./stock.js')(router);
    router = require('./account.js')(router);
    router = require('./task.js')(router, quant);
    router = require('./user.js')(router);
    router = require('./config.js')(router);
    app.use('/api', router);
}
