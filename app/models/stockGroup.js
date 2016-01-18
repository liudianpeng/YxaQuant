var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var stockGroupSchema = new Schema({
    name: String, // 篮子名称
    stocks: [
        {
            id: Schema.Types.ObjectId,
            weight: Number, // 权重
        }
    ]
});

stockGroupSchema.index({name:1}, {unique:true});

// duplicate _id to id key without changing storage
stockGroupSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
stockGroupSchema.set('toJSON', {
    virtuals: true
});

module.exports = mongoose.model('StockGroup', stockGroupSchema);