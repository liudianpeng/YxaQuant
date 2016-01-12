var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TaskSchema = new Schema({
    timeStart: Date,
    timeEnd: Date,
    status: String, //"not started|in progress|paused|completed|canceled"
    progress: Number, // 进度, 0-1
    stocks: [
        {
            id: Schema.Types.ObjectId, // 股票ID
            rules: {
                lowestPrice: Number, // 最低价格
                highestPrice: Number, // 最高价格
                timeStep: Number, // 最小交易时间间隔
            },
            // 以下四项总量计算方式任选其一
            targetRatio: Number, // 目标持仓比例
            ratio: Number, // 本次交易比例
            volume: Number, // 本次交易股数, 正数买入, 负数卖出
            amount: Number, // 本次交易金额, 正数买入, 负数卖出
            // 账户任务明细
            accounts: [
                {
                    id: Schema.Types.ObjectId, // 账户ID
                    name: String, // 账户名称
                    volume: String, // 本任务本账户交易股数, 正数买入, 负数卖出
                    volumeCompleted: String, // 已成交股数, 正数买入, 负数卖出
                    volumeDeclared: String, // 已申报未成交股数, 正数买入, 负数卖出
                    volumeTodo: Number, // 待成交股数, 正数买入, 负数卖出
                    declarations: [ // 申报列表
                        {
                            stock: {
                                id: String,
                                type: String,
                                name: String, // 标的的显示名称
                                code: String, // 标的的代号
                            },
                            type: String, // 挂单类型
                            serialNumber: String, // 通道流水号/合同号
                            price: Number,
                            time: Date,
                            volume: Number, // 正数买入, 负数卖出
                            volumeCompleted: Number, // 正数买入, 负数卖出
                            status: String //"not declared|declared|completed|partial completed"
                        }
                    ],
                    transactions: [ // 成交记录
                        {
                            stockId: Schema.Types.ObjectId,
                            serialNumber: String, // 通道流水号/合同号
                            price: Number,
                            time: Date,
                            volume: Number, // 正数买入, 负数卖出
                            amount: Number // 正数买入, 负数卖出
                        }
                    ]
                }
            ]
        }
    ]
});

module.exports = mongoose.model('Task', TaskSchema);
