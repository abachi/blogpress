let mongoose = require('mongoose');
let plm = require('passport-local-mongoose');
let schema = new mongoose.Schema({
    'username': String,
    'password': String
});
schema.plugin(plm);

module.exports = mongoose.model('User', schema);