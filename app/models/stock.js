var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StockSchema = new Schema({
    id: String,
    type: String,
    name: String, // 标的的显示名称
    code: String, // 标的的代号
    currency: String, // 币种，仅针对有价证券
    price: String, // 现价
    percentage: String, // 现价/昨收偏离率
    priceOpen: String, // 今日开盘价格
    priceLastClose: String, // 昨日收盘价格
    priceTodayMax: String, // 盘中最高价
    priceTodayMin: String, // 盘中最低价
    priceRiseStop: String, // 涨停价
    priceFallStop: String, // 跌停价
    amount: String, // 成交额
    volume: String, // 成交股数
    quoteQueue:{
        buy:[
            {
                price:String, // 申报买入价
                volume:String // 申报买入股数
            }
        ],
        sell:[
            {
                price:String,
                volume:String
            }
        ]
    },
    pb: String, // 市净率
    peLyr: String, // 上年度市盈率
    peTtm: String, // 本季度市盈率
    psr: String, // 市销率
    totalShares: String, // 总手数
    floatShares: String, // 流通手数
    marketCapital: String, // 总市值
    floatMarketCapital: String, // 流通市值
    netAssets: String, // 每股净资产
    tickSize: String, // 最小价格单位
    lotSize: String, // 每手股数
    industry: [String], // 行业
    concept: [String] // 概念
});

module.exports = mongoose.model('Stock', StockSchema);