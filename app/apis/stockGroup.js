var StockGroup = require('../models/stockGroup.js');

module.exports = function(router) {
    // StockGroup CURD
    router.route('/stockGroup')

        // create a stockGroup
        .post(function(req, res) {
            
            var stockGroup = new StockGroup(req.body);      // create a new instance of the StockGroup model

            // save the stockGroup and check for errors
            stockGroup.save(function(err) {
                if (err)
                    res.send(err);

                res.json(stockGroup);
            });
            
        })

        // get all the stockGroups
        .get(function(req, res) {
            if(!StockGroup.totalCount){
                StockGroup.count().exec().then(value => StockGroup.totalCount = value);
            }

            var limit = +req.query.limit || 20;
            var skip = +req.query.skip || 0;

            var query = {};

            if(req.query.keyword) {
                query = {
                    name: new RegExp(req.query.keyword)
                };
            }

            StockGroup.find(query)
            .limit(limit)
            .skip(skip)
            .exec()
            .then(result => {

                if(skip + result.length > StockGroup.totalCount) {
                    StockGroup.totalCount = skip + result.length;
                }

                res.set('Items-Total', StockGroup.totalCount)
                .set('Items-Start', skip + 1)
                .set('Items-End', Math.min(skip + limit, StockGroup.totalCount))
                .json(result);
            });
        });

    // on routes that end in /stockGroup/:stockGroupId
    // ----------------------------------------------------
    router.route('/stockGroup/:stockGroupId')

        // get the stockGroup with that id
        .get(function(req, res) {
            StockGroup.findById(req.params.stockGroupId, function(err, stockGroup) {
                if (err)
                    res.send(err);
                res.json(stockGroup);
            });
        })

        .put(function(req, res) {
            StockGroup.where({_id: req.params.stockGroupId}).update(req.body, function(err, raw) {
                if (err) {
                    res.send(err);
                    return;
                }

                StockGroup.findById(req.params.stockGroupId, function(err, stockGroup) {
                    if (err)
                        res.send(err);
                    
                    res.json(stockGroup);
                });
            });
        })

        // delete the stockGroup with this id
        .delete(function(req, res) {
            StockGroup.remove({
                _id: req.params.stockGroupId
            }, function(err, stockGroup) {
                if (err)
                    res.send(err);

                res.end();
            });
        });

    return router;
}
