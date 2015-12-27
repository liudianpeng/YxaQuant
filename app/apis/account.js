var Account = require('../models/account.js');

module.exports = function(router) {
    // Account CURD
    router.route('/account')

        // create a account
        .post(function(req, res) {
            
            var account = new Account(req.body);      // create a new instance of the Account model

            // save the account and check for errors
            account.save(function(err) {
                if (err)
                    res.send(err);

                res.json(account);
            });
            
        })

        // get all the accounts
        .get(function(req, res) {
            Account.find(function(err, accounts) {
                if (err)
                    res.send(err);

                res.json(accounts);
            });
        });

    // on routes that end in /account/:account_id
    // ----------------------------------------------------
    router.route('/account/:account_id')

        // get the account with that id
        .get(function(req, res) {
            Account.findById(req.params.account_id, function(err, account) {
                if (err)
                    res.send(err);
                res.json(account);
            });
        })

        .put(function(req, res) {

            // use our account model to find the account we want
            Account.findById(req.params.account_id, function(err, account) {

                if (err)
                    res.send(err);

                account.name = req.body.name;  // update the accounts info
                account.code = req.body.code;

                // save the account
                account.save(function(err) {
                    if (err)
                        res.send(err);

                    res.json(account);
                });

            });
        })

        // delete the account with this id
        .delete(function(req, res) {
            Account.remove({
                _id: req.params.account_id
            }, function(err, account) {
                if (err)
                    res.send(err);

                res.end();
            });
        });

    return router;
}
