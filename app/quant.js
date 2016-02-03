'use strict';

var _ = require('lodash');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var Stock = require('./models/stock');
var Task = require('./models/task');

function Quant () {

    EventEmitter.call(this);
    
    this.on('stockPriceChange', function(stock) {
        console.log('stockPriceChange', stock.name, stock.current, stock.time);
        var accounts = []; // 所有待交易账户
        /** [{
            id: "", // 账户ID
            name: "", // 账户名称
            rules: {
                timeStep: 0, // 最小交易时间间隔, 取下属任务最大值
                quoteDiffPercentage: 0, // 最大委差, 默认不限制
                opponentLevels: 0, // 对手盘档数, 默认1档, 取下属任务最小值
                opponentRatio: 0 // 对手盘比例, 默认60%, 取下属任务最小值
            },

            volumeBefore: 0, // 本次交易前持有的股数
            cashBefore: 0, // 本次交易前现金

            volume: 0, // 本任务本账户交易股数, 正数买入, 负数卖出
            volumeCompleted: 0, // 已成交股数, 正数买入, 负数卖出
            volumeDeclared: 0, // 已申报未成交股数, 正数买入, 负数卖出
            volumeTodo: 0, // 待成交股数, 正数买入, 负数卖出
            volumeToDeclare: 0,
            priceToDeclare: 0,
            nextDeclareTime: new Date(),
            tasks: [{
                id: "",
                volume: 0,
                rules: {
                    lowestPrice: 0.00, // 最低价格
                    highestPrice: 0.00, // 最高价格
                    timeStep: 0, // 最小交易时间间隔
                    quoteDiffPercentage: 0, // 最大委差
                    opponentLevels: 0, // 对手盘档数
                    opponentRatio: 0 // 对手盘比例
                }
            }]
        }] */

        // 遍历所有正在进行的任务, 将符合交易条件的, 写入待交易账户列表
        this.tasks.forEach(task => {

            task.stocks.forEach(stockInTask => {
                
                stockInTask.accounts.forEach(accountInTask => {

                    // 如果价格不在区间内, 或对手差价超过限制, 则直接跳过该账户
                    if(stock.current > accountInTask.rules.highestPrice
                        || stock.current < accountInTask.rules.lowestPrice
                        || (accountInTask.rules.quoteDiffPercentage 
                            && Math.abs(
                                stock.quoteQueue[task.direction ? 'sell' : 'buy'][0].price
                                - stock.current
                            ) / stock.current
                            > accountInTask.rules.quoteDiffPercentage / 100)
                    ) {
                        return;
                    }

                    if(accountInTask.volumeTodo === 0) {
                        return;
                    }

                    console.log(stock.name, '在', accountInTask.name, '价格区间内, 准备交易', '待交易' + accountInTask.volumeTodo);
                    // 合并多个任务下同一股票同一账户
                    var account = _.find(accounts, {id: accountInTask.id});

                    if(!account) {
                        account = {
                            id: accountInTask.id,
                            name: accountInTask.name,
                            rules: accountInTask.rules,

                            volumeBefore: accountInTask.volumeBefore, // 本次交易前持有的股数
                            cashBefore: accountInTask.cashBefore, // 本次交易前现金

                            volume: 0,
                            volumeCompleted: 0,
                            volumeDeclared: 0,
                            volumeTodo: 0,

                            volumeToDeclare: 0,
                            priceToDeclare: 0,
                            nextDeclareTime: new Date(),

                            tasks: []
                        };

                        accounts.push(account);
                    }

                    ['volume', 'volumeCompleted', 'volumeDeclared', 'volumeTodo'].forEach(key => {
                        account[key] += accountInTask[key];
                    });

                    account.tasks.push({
                        id: task.id,
                        volume: accountInTask.volume,
                        volumeCompleted: accountInTask.volumeCompleted,
                        volumeDeclared: accountInTask.volumeDeclared,
                        volumeTodo: accountInTask.volumeTodo,
                        rules: accountInTask.rules
                    });
                    // 对于每一个账户, 按照所有任务中最保守的对手盘策略计算可交易量
                    if(account.rules.timeStep === undefined || accountInTask.rules.timeStep > account.rules.timeStep) {
                        account.rules.timeStep = accountInTask.rules.timeStep;
                    }
                    
                    if(account.rules.opponentLevels === undefined || accountInTask.rules.opponentLevels < account.rules.opponentLevels) {
                        account.rules.opponentLevels = accountInTask.rules.opponentLevels;
                    }

                    if(account.rules.opponentRatio === undefined || accountInTask.rules.opponentRatio < account.rules.opponentRatio) {
                        account.rules.opponentRatio = accountInTask.rules.opponentRatio;
                    }
                });
            });
        });

        if(accounts.length === 0) {
            return;
        }
        
        var opponentLevels = accounts.reduce((previous, account) => {
            return !previous || account.rules.opponentLevels < previous ? account.rules.opponentLevels : previous;
        }, null) || 1;

        var opponentRatio = accounts.reduce((previous, account) => {
            return !previous || account.rules.opponentRatio < previous ? account.rules.opponentRatio : previous;
        }, null) || 0.6;

        var timeStep = accounts.reduce((previous, account) => {
            return !previous || account.rules.timeStep > previous ? account.rules.timeStep : previous;
        }, null) || 10;

        var volumeTodo = accounts.reduce((previous, account) => {
            return previous + account.volumeTodo;
        }, 0);

        var priceToDeclare, volumeToDeclare = 0;

        for(var opponentLevel = 0; opponentLevel < opponentLevels; opponentLevel++) {
            var quote = stock.quoteQueue[volumeTodo > 0 ? 'sell' : 'buy'][opponentLevel];
            priceToDeclare = quote.price;
            volumeToDeclare += volumeTodo > 0 ? quote.volume : -quote.volume;
        }

        console.log(stock.name, opponentLevels + '档', opponentRatio * 100 + '%', timeStep + '秒', '对手盘' + volumeToDeclare, '待交易' + volumeTodo);
        
        // 下单数 = 可购买量 * 每个账户该股待交易数 / 所有账户该股待交易数
        accounts.forEach(account => {
            account.volumeToDeclare = Math.round(volumeToDeclare * account.volumeTodo / volumeTodo / stock.lotSize) * stock.lotSize;

            if(Math.abs(account.volumeToDeclare) > Math.abs(account.volumeTodo)) {
                account.volumeToDeclare = account.volumeTodo;
            }

            console.log(account.name, account.volumeToDeclare, priceToDeclare);
            
            // 提交下单
            if(!this.trade.declare(account.id, stock.id, priceToDeclare, account.volumeToDeclare)) {
                return;
            }

            // 挂单数量分摊写入tasks
            account.tasks.forEach(task => {
                task.volumeToDeclare = Math.round(account.volumeToDeclare * task.volumeTodo / account.volumeTodo / stock.lotSize) * stock.lotSize;
                console.log('Task' + task.id, task.volumeToDeclare);
                var taskOrigin = _.find(this.tasks, {id: task.id});
                var stockOrigin = _.find(taskOrigin.stocks, stockOrigin => stockOrigin.id.toString() === stock.id);
                var accountOrigin = _.find(stockOrigin.accounts, {id: account.id});
                
                console.log(task.volumeToDeclare);
                accountOrigin.volumeTodo -= task.volumeToDeclare;
                stockOrigin.volumeTodo -= task.volumeToDeclare;

                accountOrigin.volumeDeclared += task.volumeToDeclare;
                stockOrigin.volumeDeclared += task.volumeDeclared;
                taskOrigin.save(); 
            });
        });
    });

    this.on('stockOpponentChange', function(stock) {
        // console.log('stockOpponentChange', stock.name, stock.quoteQueue.sell[0].price, stock.quoteQueue.sell[0].volume);
    });

    this.on('declarationSucceed', function(data) {
        console.log('declarationSucceed', data);
    });

    this.on('transactionSucceed', function(data) {
        console.log('transactionSucceed', data);
    });

    this.start = function(task) {
        return task;
    };

    this.modify = function(task) {
        return task;
    };

    this.pause = function(task) {
        return task;
    };

    this.cancel = function(task) {
        return task;
    };

    this.trade = null;
    this.market = null;

    this.tasks = [];

    this.loadTasks = function () {
        return Task.find().exec().then(tasks => {
            console.log(tasks.length + ' tasks loaded.');
            this.tasks = tasks;
            this.tasks.forEach(task => {
                this.market.subscribe(task.stocks.map(stock => stock.id));
            });
        });
    };

    this.loadTasks();
};

util.inherits(Quant, EventEmitter);

module.exports = new Quant();
