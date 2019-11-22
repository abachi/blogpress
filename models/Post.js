let mongoose = require('mongoose');

let schema = new mongoose.Schema({
    'title': String,
    'text': String,
    'user_id': String,
    'created_at': String,
});


module.exports = mongoose.model('Post', schema);