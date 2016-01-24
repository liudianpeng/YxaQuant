var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var taskSchema = new Schema({
    timeStart: Date,
    timeEnd: Date,
    status: String, //"not started|in progress|paused|completed|canceled"
    direction: Boolean,
    progress: Number, // 进度, 0-1
    accountIds: [String],
    rules: {
        lowestPercentage: Number, // 最低价格
        highestPercentage: Number, // 最高价格
        timeStep: Number, // 最小交易时间间隔
        priceDiffPercentage: Number, // 最大委差
        opponentLevels: Number, // 对收盘档数
        opponentRatio: Number // 对收盘比例
    },
    // 以下两项总量计算方式任选其一
    targetRatio: Number, // 目标持仓比例
    ratio: Number, // 本次交易比例
    stocks: [
        {
            id: Schema.Types.ObjectId, // 股票ID
            name: String,
            code: String,
            rules: {
                lowestPrice: Number, // 最低价格
                highestPrice: Number, // 最高价格
                timeStep: Number, // 最小交易时间间隔
                priceDiffPercentage: Number, // 最大委差
                opponentLevels: Number, // 对收盘档数
                opponentRatio: Number // 对收盘比例
            },
            // 以下四项总量计算方式任选其一
            targetRatio: Number, // 目标持仓比例
            ratio: Number, // 本次交易比例
            volume: Number, // 本次交易股数, 正数买入, 负数卖出
            amount: Number, // 本次交易金额, 正数买入, 负数卖出
            
            volumeCompleted: Number, // 已成交股数, 正数买入, 负数卖出
            volumeDeclared: Number, // 已申报未成交股数, 正数买入, 负数卖出
            volumeTodo: Number, // 待成交股数, 正数买入, 负数卖出
            // 账户任务明细
            accounts: [
                {
                    id: Schema.Types.ObjectId, // 账户ID
                    name: String, // 账户名称
                    rules: {
                        lowestPrice: Number, // 最低价格
                        highestPrice: Number, // 最高价格
                        timeStep: Number, // 最小交易时间间隔
                        priceDiffPercentage: Number, // 最大委差
                        opponentLevels: Number, // 对收盘档数
                        opponentRatio: Number, // 对收盘比例
                        backtrackFromDate: Date, // 差价交易的回溯起始日期
                        backtrackToDate: Date, // 差价交易的回溯终止日期
                        priceDiffPercentage: Number // 差价交易的差价百分比
                    },
                    volume: Number, // 本任务本账户交易股数, 正数买入, 负数卖出
                    volumeCompleted: Number, // 已成交股数, 正数买入, 负数卖出
                    volumeDeclared: Number, // 已申报未成交股数, 正数买入, 负数卖出
                    volumeTodo: Number, // 待成交股数, 正数买入, 负数卖出
                    transactions: [ // 成交记录
                        {
                            serialNumber: String, // 通道流水号/合同号
                            price: Number,
                            time: Date,
                            volume: Number, // 正数买入, 负数卖出
                            amount: Number // 正数买入, 负数卖出
                        }
                    ],
                    declarations: [ // 申报列表
                        // 为了防止type与nested schema的type混淆, 使用了new Schema()
                        new Schema({
                            type: String, // 挂单类型
                            serialNumber: String, // 通道流水号/合同号
                            price: Number,
                            time: Date,
                            volume: Number, // 正数买入, 负数卖出
                            volumeCompleted: Number, // 正数买入, 负数卖出
                            amount: Number,  // 正数买入, 负数卖出
                            status: String //"not declared|declared|completed|partial completed"
                        })
                    ]
                }
            ]
        }
    ]
});

taskSchema.index({status:1});

// duplicate _id to id key without changing storage
taskSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
taskSchema.set('toJSON', {
    virtuals: true
});

module.exports = mongoose.model('Task', taskSchema);
