var Stock = require('../models/stock.js');

module.exports = function(router) {
    // Stock CURD
    router.route('/stock')

        // create a stock
        .post(function(req, res) {
            
            var stock = new Stock();      // create a new instance of the Stock model
            stock.name = req.body.name;  // set the stocks name (comes from the request)
            stock.code = req.body.code;
            console.log(req.body);

            // save the stock and check for errors
            stock.save(function(err) {
                if (err)
                    res.send(err);

                res.json({ message: 'Stock created!' });
            });
            
        })

        // get all the stocks
        .get(function(req, res) {
            Stock.find(function(err, stocks) {
                if (err)
                    res.send(err);

                res.json(stocks);
            });
        });

    // on routes that end in /stock/:stock_id
    // ----------------------------------------------------
    router.route('/stock/:stock_id')

        // get the stock with that id
        .get(function(req, res) {
            Stock.findById(req.params.stock_id, function(err, stock) {
                if (err)
                    res.send(err);
                res.json(stock);
            });
        })

        .put(function(req, res) {

            // use our stock model to find the stock we want
            Stock.findById(req.params.stock_id, function(err, stock) {

                if (err)
                    res.send(err);

                stock.name = req.body.name;  // update the stocks info
                stock.code = req.body.code;

                // save the stock
                stock.save(function(err) {
                    if (err)
                        res.send(err);

                    res.json({ message: 'Stock updated!' });
                });

            });
        })

        // delete the stock with this id
        .delete(function(req, res) {
            Stock.remove({
                _id: req.params.stock_id
            }, function(err, stock) {
                if (err)
                    res.send(err);

                res.json({ message: 'Successfully deleted' });
            });
        });

    return router;
}
