let Post = require('../models/Post');
let HomeController = {};

HomeController.index = (req, res) => {
    Post.find({}, (err, posts) => {
        if(err) console.log('Error: ', err);
        res.render('home', {posts: posts});
    });
};


module.exports = HomeController;