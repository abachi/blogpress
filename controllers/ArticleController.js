const { validationResult } = require('express-validator');

let Post = require('../models/Post');

let ArticleController = {};


ArticleController.create = (req, res) => {
    res.render('post/create');
};

ArticleController.store =  (req, res, next) => {
    
    // how we hide this DRY
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('post/create', { errors: errors.array() });
    }
    
    Post.create({
        title: req.body.title,
        text: req.body.text,
        created_at: (new Date()).toTimeString(),
        updated_at: (new Date()).toTimeString(),
        user_id: req.user.id,
    }, (err, post) => {
        if(err) {
            console.log('Error: ', err);
            return res.send({error: err});
        }
        res.redirect('/');
    }); 
};

ArticleController.edit = (req, res) => {
    Post.findById(req.params.id, (err, post) => {
        if(err || !post){
            return res.render('404');
        }
        res.render('post/edit', { post: post });
    });
};

ArticleController.update = (req, res) => {
    // how we hide this ? DRY
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.redirect('back');
    }

    Post.findOne({_id: req.params.id}, (err, post) => {
        if(err || !post){
            return res.render('404');
        }
        if(post.user_id != req.user.id){
            res.status(401);
            return res.send('Unauthorized');
        }

        post.title = req.body.title;
        post.text = req.body.text;
        post.updated_at= (new Date()).toTimeString();

        post.save().then(() => {
            res.redirect(`/post/show/${post.id}`);
        });
    });
};

ArticleController.show = (req, res) => {
    Post.findById(req.params.id, (err, post) => {
        if(err || !post){
            return res.render('404');
        }

        res.render('post/show', { post: post });
    });
};

ArticleController.destroy = (req, res) => {
    Post.findOne({_id: req.params.id}, (err, post) => {
        if(err) return res.send({error: err});
        if(!post) return res.render('404');
        
        if(post.user_id != req.user.id){
            res.status(401);
            return res.send('Unauthorized');
        }

        post.remove();
        return res.redirect('/');
    });
};

module.exports = ArticleController;