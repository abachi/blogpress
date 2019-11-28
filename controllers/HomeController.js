let HomeController = {};

HomeController.index = (req, res) => {
    // get posts limit by 10
    Post.find({}, (err, posts) => {
        if(err) console.log('Error: ', err);
        res.render('home', {posts: posts});
    });
};


module.exports = HomeController;