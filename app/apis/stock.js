var Stock = require('../models/stock.js');

module.exports = function(router) {
    // Stock CURD
    router.route('/stock')

        // create a stock
        .post(function(req, res) {
            
            var stock = new Stock(req.body);      // create a new instance of the Stock model

            // save the stock and check for errors
            stock.save(function(err) {
                if (err)
                    res.send(err);

                res.json({ message: 'Stock created!' });
            });
            
        })

        // get all the stocks
        .get(function(req, res) {
            if(!Stock.totalCount){
                Stock.count().exec().then(value => Stock.totalCount = value);
            }

            var limit = +req.query.limit || 20;
            var skip = +req.query.skip || 0;

            var query = {};

            if(req.query.keyword) {
                query = {
                    $or: [
                        {name: new RegExp(req.query.keyword)},
                        {code: new RegExp(req.query.keyword)}
                    ]
                };
            }

            var data = Stock.find(query)
            .limit(limit)
            .skip(skip)
            .exec()
            .then(result => {

                if(skip + result.length > Stock.totalCount) {
                    Stock.totalCount = skip + result.length;
                }

                res.set('Items-Total', Stock.totalCount)
                .set('Items-Start', skip + 1)
                .set('Items-End', Math.min(skip + limit, Stock.totalCount))
                .json(result);
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
            Stock.where({_id: req.params.stockId}).update(req.body, function(err, raw) {
                if (err) {
                    res.send(err);
                    return;
                }

                Stock.findById(req.params.stockId, function(err, stock) {
                    if (err)
                        res.send(err);
                    
                    res.json(stock);
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
