var Task = require('../models/task.js');
var Account = require('../models/account.js');
var Stock = require('../models/stock.js');

module.exports = function(router, quant) {
    // Task CURD
    router.route('/task')

        // create a task
        .post(function(req, res, next) {
            
            // 识别req.body中的accounts, direction, 这些在创建任务的时候有用, 但却不在Task模型中
            if(req.body.accounts === undefined || !Array.isArray(req.body.accounts)) {
                res.status(400).send('Accounts not defined.');
                return;
            }

            if(req.body.direction === undefined) {
                res.status(400).send('Trade direction not defined.');
                return;
            }

            var accountIds = req.body.accounts;
            var direction = req.body.direction;

            if(req.body.stocks === undefined || !Array.isArray(req.body.stocks)) {
                res.status(400).send('Stocks not defined.');
                return;
            }

            var stocks = req.body.stocks;

            if(stocks.some(stock => stock.id === undefined)) {
                res.status(400).send('Missing Stock ID.');
                return;
            }

            stocksFound = stocks.map(stock => {
                return Stock.findOne({_id: stock.id}).exec();
            });

            var task = new Task(req.body); // create a new instance of the Task model

            // 查找要交易的股票
            Promise.all(stocksFound)

            // 将要交易的股票加入任务中
            .then(stocks => {
                
                return new Promise((resolve, reject) => {
                    
                    task.stocks = stocks.map(stock => {
                        
                        if(stock === null) {
                            res.status(400).send('Wrong stock ID.');
                            reject('Wrong stock ID.');
                        }

                        return {id: stock.id, name: stock.name, code: stock.code}
                    });

                    resolve();
                });

            }).catch(reason => console.error('[', new Date(), '] Wrong stock ID.', "\n", reason))

            // 查找账户
            .then(() => {

                var accountsFound = accountIds.map(accountId => {
                    return Account.findOne({_id: accountId}).exec();
                });

                return Promise.all(accountsFound);

            })

            // 将账户复制到股票下
            .then((accounts) => {
                
                return new Promise((resolve, reject) => {

                    var accountsInStock = accounts.map(account => {

                        if(account === null) {
                            res.status(400).send('Wrong account ID.');
                            reject('Wrong account ID');
                        }

                        return {id: account.id, name: account.name, code: account.code, provider: account.provider, credentials: account.credentials};
                    });

                    task.stocks = task.stocks.map(stock => {
                        stock.accounts = accountsInStock;
                        return stock;
                    });

                    resolve();
                });

            }).catch(reason => console.error('[', new Date(), '] Wrong account ID.', "\n", reason))

            .then(() => {
                return task.save();
            })

            .then((task) => {
                res.json(task);
            });


            // 计算交易股数
            // 检测任务可执行性
            // 买入时，检测资金余额是否

            // save the task and check for errors
            // task.save(function(err) {
            //     if (err)
            //         res.send(err);

            //     res.json(task);
            // });
            
        })

        // get all the tasks
        .get(function(req, res) {
            if(!Task.totalCount){
                Task.count().exec().then(value => Task.totalCount = value);
            }

            var limit = +req.query.limit || 20;
            var skip = +req.query.skip || 0;

            var query = {};

            Task.find(query)
            .limit(limit)
            .skip(skip)
            .exec()
            .then(result => {

                if(skip + result.length > Task.totalCount) {
                    Task.totalCount = skip + result.length;
                }

                res.set('Items-Total', Task.totalCount)
                .set('Items-Start', skip + 1)
                .set('Items-End', Math.min(skip + limit, Task.totalCount))
                .json(result);
            });
        });

    // on routes that end in /task/:taskId
    // ----------------------------------------------------
    router.route('/task/:taskId')

        // get the task with that id
        .get(function(req, res) {
            Task.findById(req.params.taskId, function(err, task) {
                if (err)
                    res.send(err);
                res.json(task);
            });
        })

        .put(function(req, res) {
            Task.where({_id: req.params.taskId}).update(req.body, function(err, raw) {
                if (err) {
                    res.send(err);
                    return;
                }

                Task.findById(req.params.taskId, function(err, task) {
                    if (err)
                        res.send(err);
                    
                    res.json(task);
                });
            });
        })

        // delete the task with this id
        .delete(function(req, res) {
            Task.remove({
                _id: req.params.taskId
            }, function(err, task) {
                if (err)
                    res.send(err);

                res.end();
            });
        });

    return router;
}
