var Task = require('../models/task.js');
var Account = require('../models/account.js');
var Stock = require('../models/stock.js');
var moment = require('moment');
var _ = require('lodash');

module.exports = function(router, quant) {
    // Task CURD
    router.route('/task')

        // create a task
        .post(function(req, res, next) {
            
            var task = new Task(req.body);

            if(req.body.timeStart) {
                task.timeStart = moment(moment().startOf('today').format('YYYY-MM-DD') + ' ' + req.body.timeStart);
            }

            if(req.body.timeEnd) {
                task.timeEnd = moment(moment().startOf('today').format('YYYY-MM-DD') + ' ' + req.body.timeEnd);
            }

            quant.market.subscribe(task.stocks.map(stock => stock.id))
            
            .then(stocks => {
                var getStocks = quant.market.getQuotes(task.stocks.map(stock => stock.id));
                var getAccounts = Account.find({_id: {$in: task.accountIds}}).exec();
                return Promise.all([getStocks, getAccounts]);
            })

            .then((value) => {
                
                var stocks = value[0];
                var accounts = value[1];
                // 将股票加上交易规则和交易量参数
                task.stocks = task.stocks.map(stockInTask => {

                    // 从数据库中获得任务中正在处理的同一支股票
                    var stockInMarket = stocks.filter(stock => {
                        return stock.id == stockInTask.id;
                    })[0];

                    // 复制基本信息
                    stockInTask.name = stockInMarket.name;
                    stockInTask.code = stockInMarket.code;

                    // 若股票中没有最低/最高价, 从任务总设置中获取
                    if (!stockInTask.rules.lowestPrice && task.rules.lowestPercentage) {
                        stockInTask.rules.lowestPrice = (stockInMarket.current * (1 + task.rules.lowestPercentage/100)).toFixed(-Math.log10(stockInMarket.tickSize));
                    }
                    if (!stockInTask.rules.highestPrice && task.rules.highestPercentage) {
                        stockInTask.rules.highestPrice = (stockInMarket.current * (1 + task.rules.highestPercentage/100)).toFixed(-Math.log10(stockInMarket.tickSize));
                    }

                    // 若股票没有设置交易量, 从任务总设置中获取
                    if(!stockInTask.targetRatio && !stockInTask.ratio && !stockInTask.volume && !stockInTask.amount) {
                        if(task.targetRatio) {
                            stockInTask.targetRatio = task.targetRatio;
                        }
                        else if(task.ratio) {
                            stockInTask.ratio = task.ratio;
                        }
                        else {
                            throw new Error('Volume not specified for ' + stockInMarket.code);
                        }
                    }

                    stockInTask.accounts = accounts.map(account => {
                        
                        var accountInStock = {
                            id: account.id,
                            name: account.name
                        };

                        // 将股票的交易规则复制到下面的账户
                        accountInStock.rules = stockInTask.rules;
                        
                        // 查找并复制改账户对该股原本的持仓
                        var holdThisStock = account.stocks.filter(holdStock => holdStock.id.toString() === stockInTask.id.toString());

                        if(holdThisStock.length) {
                            accountInStock.volumeBefore = holdThisStock[0].volume;
                        }
                        else {
                            accountInStock.volumeBefore = 0;
                        }

                        accountInStock.cashBefore = account.cash.reduce((previous, currency) => {
                            return previous + currency.amount * (currency.rate || 1);
                        }, 0);

                        return accountInStock;
                    });

                    // 计算所有待交易账户对该股的总持有
                    stockInTask.volumeBefore = stockInTask.accounts.reduce((previous, account) => {
                        return previous + account.volumeBefore;
                    }, 0);

                    stockInTask.cashBefore = stockInTask.accounts.reduce((previous, account) => {
                        return previous + account.cashBefore;
                    }, 0);

                    // 计算此股票的所有待交易账户交易量
                    if(stockInTask.targetRatio) {
                        stockInTask.accounts = stockInTask.accounts.map(account => {
                            var marketCapital = stockInMarket.current * account.volumeBefore;
                            var ratio = marketCapital / (marketCapital + account.cashBefore);
                            var amount = (stockInTask.targetRatio - ratio) * (marketCapital + account.cashBefore) / stockInMarket.current;
                            account.volume = amount > 0 === task.direction ? Math.round(amount / stockInMarket.lotSize) * stockInMarket.lotSize : 0;
                            return account;
                        });
                    }
                    else if (stockInTask.ratio) {
                        stockInTask.accounts = stockInTask.accounts.map(account => {
                            account.volume = Math.round(account.volumeBefore * stockInTask.ratio / stockInMarket.lotSize) * stockInMarket.lotSize;

                            if(!task.direction) {
                                account.volume = -account.volume;
                            }

                            return account;
                        });
                    }
                    else if (stockInTask.volume) {
                        var totalCapital = stockInTask.accounts.reduce((previous, account) => {
                            var marketCapital = stockInMarket.current * account.volumeBefore;
                            var accountCapical = marketCapital + account.cashBefore;
                            return previous + accountCapical;
                        }, 0);

                        stockInTask.accounts.map(account => {
                            var marketCapital = stockInMarket.current * account.volumeBefore;
                            var accountCapical = marketCapital + account.cashBefore;
                            account.volume = Math.round(stockInTask.volume * accountCapical / totalCapital / stockInMarket.lotSize) * stockInMarket.lotSize;
                            return account;
                        });
                    }

                    if(!stockInTask.volume) {
                        stockInTask.volume = stockInTask.accounts.reduce((previous, account) => {
                            return previous + account.volume;
                        }, 0);
                    }

                    stockInTask.accounts.map(account => {
                        account.volumeCompleted = 0;
                        account.volumeDeclared = 0;
                        account.volumeTodo = account.volume;
                        return account;
                    });

                    stockInTask.volumeCompleted = 0;
                    stockInTask.volumeDeclared = 0;
                    stockInTask.volumeTodo = stockInTask.volume;

                    return stockInTask;
                });

            })

            // 检测任务可执行性, 保存任务
            .then(() => {
                // 买入时, 检测总资金余额是否足够
                // 价格区间上限和涨停价中低者价格计算, 买入所有待交易股票所需资金大于交易前现金

                var accounts = {}; // [accountId]:account

                if(task.direction) {
                    task.stocks.forEach(stock => {
                        stock.accounts.forEach(account => {

                            var safePrice = account.rules.highestPrice;
                            var safeCash = 0;

                            if(!safePrice) {
                                safePrice = quant.market.subscribedStocks[stock.id].riseStop;
                            }

                            safeCash = safePrice * account.volume;

                            if(!accounts[account.id]) {
                                accounts[account.id] = account.toObject();
                                accounts[account.id].cashRequired = 0;
                            }

                            accounts[account.id].cashRequired += safePrice * account.volume;
                        });
                    });
                    
                    for(var accountId in accounts) {
                        var account = accounts[accountId];
                        if(account.cashBefore < account.cashRequired) {
                            throw new Error(account.name + '没有足够的现金以买入。');
                        }
                    }
                }
                // 卖出时, 检测每种股票持股余额是否足够
                else {
                    task.stocks.forEach(stock => {
                        stock.accounts.forEach(account => {
                            if(account.volumeBefore < account.volume) {
                                throw new Error(account.name + ' ' + stock.name + '没有足够的持仓供卖出。');
                            }
                        });
                    });
                }
                
                if(task.timeStart && task.timeStart < new Date()) {
                    task.timeStart = new Date();
                    task.status = 'in progress';
                }
                else {
                    task.status = 'not started';
                }

                return task.save();
            })

            // 将任务发送到Quant, 返回发送给前台
            .then(() => {

                quant.loadTasks();
                quant.start(task);

                res.json(task);
            })

            .then(null, (reason) => {
                console.error(reason);
                res.status(400).send(reason.message);
            });

        })

        // get all the tasks
        .get(function(req, res) {
            var limit = +req.query.limit || 20;
            var skip = +req.query.skip || 0;

            var queryPromises = [];
            var query = Task.find().limit(limit).skip(skip);

            if(!Task.totalCount){
                queryPromises.push(Task.count().exec().then(value => Task.totalCount = value));
            }

            if(req.query.today) {
                if(JSON.parse(req.query.today)) {
                    query.find({timeStart: {$gte: moment().startOf('day'), $lte: moment().endOf('day')}});
                }
                else {
                    query.find({timeStart: {$not: {$gte: moment().startOf('day'), $lte: moment().endOf('day')}}});
                }
            } 

            Promise.all(queryPromises)

            .then(() => {
                return query.exec();
            })
            
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

        // TODO 并不是所有信息都可以修改
        .put(function(req, res) {
            
            Task.findOne({_id: req.params.taskId}).exec()
            .then(task => {
                if(req.body.timeStart) {
                    task.timeStart = moment(moment().format('YYYY-MM-DD') + ' ' + req.body.timeStart);
                }

                if(req.body.timeEnd) {
                    task.timeEnd = moment(moment().format('YYYY-MM-DD') + ' ' + req.body.timeEnd);
                }

                if(task.status === undefined) {
                    task.status = 'not started';
                }

                if(req.body.status) {
                    if(task.status === 'not started' && req.body.status === 'in progress') {
                        task.status = req.body.status;
                        task.timeStart = new Date();
                    }
                    else if(task.status === 'in progress' && req.body.status === 'paused') {
                        task.status = req.body.status;
                    }
                    else if(task.status === 'paused' && req.body.status === 'in progress') {
                        task.status = req.body.status;
                    }
                    else if(task.status === 'paused' && req.body.status === 'canceled') {
                        task.status = req.body.status;
                        task.timeEnd = new Date();
                    }
                }

                if(req.body.stocks && req.body.stocks.length === task.stocks.length) {
                    for(var i = 0; i < task.stocks.length; i++) {
                        if(req.body.stocks[i].accounts.length !== task.stocks[i].accounts.length) {
                            break;
                        }
                        for(var j = 0; j < task.stocks[i].accounts.length; j++) {
                            _.merge(task.stocks[i].accounts[j].rules, req.body.stocks[i].accounts[j].rules);
                        }
                    }
                }

                task.save()
                .then(task => {
                    quant.loadTasks();
                });

                res.json(task);
            });
        })

        // delete the task with this id
        .delete(function(req, res) {
            Task.remove({
                _id: req.params.taskId
            }, function(err, task) {
                if (err)
                    res.send(err);

                quant.loadTasks();
                res.end();
            });
        });

    return router;
}
