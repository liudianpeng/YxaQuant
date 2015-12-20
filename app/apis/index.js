var routeStock = require('./stock.js');

module.exports = function(app, router) {
    // register routes
    console.log('binding routes...');
	router = routeStock(router);
    app.use('/api', router);
}
