var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var accountSchema = new Schema({
    name: String,
    type: String,
    provider: {
        name: String, code: String
    },
    credentials: {
        login: String,
        pass: String
    },
    stocks: [{
        id: Schema.Types.ObjectId,
        name: String,
        code: String,
        volume: Number,
        marketCapital: Number,
        cost: Number,
        profit: Number,
        profitRatio: Number
    }],
    cash: [{
        currency: String,
        amount: Number
    }]
});

accountSchema.index({name:1}, {unique:true});

// duplicate _id to id key without changing storage
accountSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
accountSchema.set('toJSON', {
    virtuals: true
});

module.exports = mongoose.model('Account', accountSchema);
