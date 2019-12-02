const { validationResult } = require('express-validator');

let Comment = require('../models/Comment');
let Post = require('../models/Post');

let CommentController = {};



CommentController.store =  async (req, res, next) => {
    // how we hide this DRY
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.redirect(`/post/show/${req.params.post_id}`);
    }
    
    // make sure the post exist
    Post.findOne({_id: req.params.post_id}, (err, post) => {
        if(err){
            return res.redirect('/404');
        }

        if(!post){
            return res.redirect('/404');
        }

        Comment.create({
            comment: req.body.comment,
            post_id: req.params.post_id,
            created_at: (new Date()).toTimeString(),
        }, (err, post) => {
            if(err) {
                console.log('Error: ', err);
                return res.send({error: err});
            }

            res.redirect(`/post/show/${req.params.post_id}`);
        }); 
    });

};

module.exports = CommentController;