var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var configSchema = new Schema({
    key: String,
    value: Schema.Types.Mixed
});

configSchema.index({key:1}, {unique:true});

// duplicate _id to id key without changing storage
configSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
configSchema.set('toJSON', {
    virtuals: true
});

module.exports = mongoose.model('Config', configSchema);
