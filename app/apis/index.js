module.exports = function(app, router) {
    // register routes
    router = require('./stock.js')(router);
    router = require('./account.js')(router);
    router = require('./task.js')(router);
    router = require('./user.js')(router);
    router = require('./config.js')(router);
    app.use('/api', router);
}
