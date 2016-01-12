var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ConfigSchema = new Schema({
    key: String,
    value: Schema.Types.Mixed
});

module.exports = mongoose.model('Config', ConfigSchema);
