var Account = require('../models/account.js');

module.exports = function(router) {
    // Account CURD
    router.route('/account')

        // create an account
        .post(function(req, res) {
            
            var account = new Account(req.body); // create a new instance of the Account model

            // save the account and check for errors
            account.save(function(err) {
                if (err)
                    res.send(err);

                res.json(account);
            });
            
        })

        // get all the accounts
        .get(function(req, res) {
            if(!Account.totalCount){
                Account.count().exec().then(value => Account.totalCount = value);
            }

            var limit = +req.query.limit || 20;
            var skip = +req.query.skip || 0;

            var query = {};

            if(req.query.keyword) {
                query.name = new RegExp(req.query.keyword);
            }

            if(req.query.type) {
                query.type = req.query.type;
            }

            Account.find(query)
            .limit(limit)
            .skip(skip)
            .exec()
            .then(result => {

                if(skip + result.length > Account.totalCount) {
                    Account.totalCount = skip + result.length;
                }

                res.set('Items-Total', Account.totalCount)
                .set('Items-Start', skip + 1)
                .set('Items-End', Math.min(skip + limit, Account.totalCount))
                .json(result);
            });
        });

    // on routes that end in /account/:accountId
    // ----------------------------------------------------
    router.route('/account/:accountId')

        // get the account with that id
        .get(function(req, res) {
            Account.findById(req.params.accountId, function(err, account) {
                if (err)
                    res.send(err);
                res.json(account);
            });
        })

        .put(function(req, res) {
            Account.where({_id: req.params.accountId}).update(req.body, function(err, raw) {
                if (err) {
                    res.send(err);
                    return;
                }

                Account.findById(req.params.accountId, function(err, account) {
                    if (err)
                        res.send(err);

                    res.json(account);
                });
            });
        })

        // delete the account with this id
        .delete(function(req, res) {
            Account.remove({
                _id: req.params.accountId
            }, function(err, account) {
                if (err)
                    res.send(err);

                res.end();
            });
        });

    return router;
}
