module.exports = function(app, router) {
    // register routes
    console.log('binding routes...');
    router = require('./stock.js')(router);
    router = require('./account.js')(router);
    app.use('/api', router);
}
