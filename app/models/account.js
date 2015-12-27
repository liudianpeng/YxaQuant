var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AccountSchema = new Schema({
    name: String,
    provider: {
        name: String, code: String
    },
    credentials: new Schema({
        login: String,
        pass: String
    }),
    stocks: [
        new Schema({
            id: String,
            volume: Number,
            marketCapital: Number,
            cost: Number,
            profit: Number,
            profitRatio: Number
        })
    ],
    cash: [
        new Schema({
            currency: String,
            amount: Number
        })
    ]
});

module.exports = mongoose.model('Account', AccountSchema);