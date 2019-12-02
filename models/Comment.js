let mongoose = require('mongoose');

let schema = new mongoose.Schema({
    'comment': String,
    'post_id': String,
    'created_at': String,
});


module.exports = mongoose.models.Comment || mongoose.model('Comment', schema);