var Stock = require('../models/stock.js');
var StockGroup = require('../models/stockGroup.js');

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
            var limit = +req.query.limit || 20;
            var skip = +req.query.skip || 0;

            var queryPromises = [];
            var query = Stock.find().limit(limit).skip(skip);

            if(!Stock.totalCount){
                queryPromises.push(Stock.count().exec().then(value => Stock.totalCount = value));
            }

            if(req.query.keyword) {
                query.find({$or: [
                    {name: new RegExp(req.query.keyword)},
                    {code: new RegExp(req.query.keyword)}
                ]});
            }

            ['code', 'name'].forEach(property => {
                if(req.query[property]) {
                    query.find({[property]: new RegExp(req.query[property])});
                }
            });

            ['percentage', 'pb', 'peTtm', 'peLyr', 'psr', 'marketCapital', 'floatMarketCapital'].forEach(property => {
                
                if(req.query[property]) {

                    var range = req.query[property].split(/[~_]/);

                    var condition = {[property]:{}};

                    if(range[0] && !isNaN(range[0])) {
                        condition[property].$gte = Number(range[0]);
                    }

                    if(range[1] && !isNaN(range[1])) {
                        condition[property].$lte = Number(range[1]);
                    }

                    query.find(condition);

                }

            })

            if(req.query.groupId) {

                queryPromises.push(new Promise((resolve, reject) => {

                    StockGroup.findOne({_id: req.query.groupId}, function(err, result) {
                        
                        var stockIds = result.stocks.map(stock => stock.id);

                        query.find({_id: {$in: stockIds}});

                        resolve();
                    })

                }));

            }

            if(req.query.orderBy) {
                query.sort({
                    [req.query.orderBy]: (req.query.order === 'desc' || req.query.order === 'false' || Number(req.query.order) <= 0 ? 'desc' : 'asc')
                });
            }

            Promise.all(queryPromises)

            .then(() => {
                return query.exec();
            })

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

    // on routes that end in /stock/:stockId
    // ----------------------------------------------------
    router.route('/stock/:stockId')

        // get the stock with that id
        .get(function(req, res) {
            Stock.findById(req.params.stockId, function(err, stock) {
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
                _id: req.params.stockId
            }, function(err, stock) {
                if (err)
                    res.send(err);

                res.json({ message: 'Successfully deleted' });
            });
        });

    return router;
}
