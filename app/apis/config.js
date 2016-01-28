var Config = require('../models/config.js');

module.exports = function(router) {
    // Config CURD
    router.route('/config')

        // create a config
        .post(function(req, res) {
            
            var config = new Config(req.body);      // create a new instance of the Config model

            // save the config and check for errors
            config.save(function(err) {
                if (err)
                    res.send(err);

                res.json(config);
            });
            
        })

        // get all the configs
        .get(function(req, res) {
            if(!Config.totalCount){
                Config.count().exec().then(value => Config.totalCount = value);
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

            Config.find(query)
            .limit(limit)
            .skip(skip)
            .exec()
            .then(result => {

                if(skip + result.length > Config.totalCount) {
                    Config.totalCount = skip + result.length;
                }

                res.set('Items-Total', Config.totalCount)
                .set('Items-Start', skip + 1)
                .set('Items-End', Math.min(skip + limit, Config.totalCount))
                .json(result);
            });
        });

    // on routes that end in /config/:configId
    // ----------------------------------------------------
    router.route('/config/:configId')

        // get the config with that id
        .get(function(req, res) {
            Config.findById(req.params.configId, function(err, config) {
                if (err)
                    res.send(err);
                res.json(config);
            });
        })

        .put(function(req, res) {
            Config.where({_id: req.params.configId}).update(req.body, function(err, raw) {
                if (err) {
                    res.send(err);
                    return;
                }

                Config.findById(req.params.configId, function(err, config) {
                    if (err)
                        res.send(err);
                    
                    res.json(config);
                });
            });
        })

        // delete the config with this id
        .delete(function(req, res) {
            Config.remove({
                _id: req.params.configId
            }, function(err, config) {
                if (err)
                    res.send(err);

                res.end();
            });
        });

    return router;
}
