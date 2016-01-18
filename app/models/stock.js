var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var stockSchema = new Schema({
    type: String,
    name: String, // 标的的显示名称
    code: String, // 标的的代号
    currency: String, // 币种，仅针对有价证券
    current: Number, // 现价
    time: Date, // 现价更新时间
    percentage: Number, // 现价/昨收偏离率
    offset: Number, // 现价/昨收偏离
    open: Number, // 今日开盘价格
    lastClose: Number, // 昨日收盘价格
    todayMax: Number, // 盘中最高价
    todayMin: Number, // 盘中最低价
    riseStop: Number, // 涨停价
    fallStop: Number, // 跌停价
    amount: Number, // 成交额
    volume: Number, // 成交股数
    quoteQueue: {
        buy:[
            {
                price:Number, // 申报买入价
                volume:Number // 申报买入股数
            }
        ],
        sell:[
            {
                price:Number,
                volume:Number
            }
        ]
    },
    pb: Number, // 市净率
    peLyr: Number, // 上年度市盈率
    peTtm: Number, // 本季度市盈率
    psr: Number, // 市销率
    totalShares: Number, // 总手数
    floatShares: Number, // 流通手数
    marketCapital: Number, // 总市值
    floatMarketCapital: Number, // 流通市值
    netAssets: Number, // 每股净资产
    tickSize: Number, // 最小价格单位
    lotSize: Number, // 每手股数
    industry: [String], // 行业
    concept: [String] // 概念
});

stockSchema.index({code:1}, {unique:true});

// duplicate _id to id key without changing storage
stockSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
stockSchema.set('toJSON', {
    virtuals: true
});

module.exports = mongoose.model('Stock', stockSchema);
