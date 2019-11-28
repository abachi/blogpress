// reuirements
const express = require('express');
let mongoose = require('mongoose');
const expressSession = require('express-session')({ 
    secret: 'random key',
    resave: false,
    saveUninitialized: false
});

// refactor to better implimentation
const Lang = require('../helpers/express-multilang');
let lang = new Lang();
lang.config.def = 'fr';
lang.config.messages = require('../lang/messages');

const { check, body, validationResult } = require('express-validator');
let passport = require('passport');
let localStrategy = require('passport-local');
let passportLocalMongoose = require('passport-local-mongoose');
let methodOverride = require('method-override');
let bodyParser = require('body-parser');
let User = require('../models/User');
let Post = require('../models/Post');
// let DBSeeder = require('../seeds/DBSeeder');

// middlewares 
const alreadyAuthenticated = (req, res, next) => {
    if(req.isAuthenticated()){
        console.log('The user already authenticated');
        return res.redirect('/');
    }
    next();
};
const authMiddleware = (req, res, next) => {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
};
// initialization & configuration
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const app = express();
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.use(expressSession);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    if(res.locals.errors === undefined)
        res.locals.errors = [];
    next();
});

app.locals.lang = (key) => {
    return lang.translate(key);    
};
// database config 
const dbUrl = (process.env.NODE_ENV === 'testing') ? 'mongodb://localhost/testing-blogex' : 'mongodb://localhost/blogex';
mongoose.connect(dbUrl, {
    useCreateIndex: true,
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useFindAndModify: false
});

// Routes
app.get('/', (req, res) => {
    // get posts limit by 10
    Post.find({}, (err, posts) => {
        if(err) console.log('Error: ', err);
        res.render('home', {posts: posts});
    });
});

// auth routes
app.get('/register', alreadyAuthenticated, (req, res) => {
    res.render('auth/register');
});
app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

app.post('/register', (req, res) => {
    User.register(new User({ username: req.body.username }), req.body.password, (err, user) => {
        if(err){
            console.log('Error: ', err);
            return res.render('auth/register', { errors: err });
        }
        passport.authenticate('local')(req, res, () => res.redirect('/'));
    });
});
app.get('/login', alreadyAuthenticated, (req, res) => {
    res.render('auth/login');
});
app.post('/login', passport.authenticate("local", {
        successRedirect: '/',
        failureRedirect: '/login',
    }));

// post routes
app.get('/post/create', authMiddleware, (req, res) => {
    res.render('post/create');
});
 
const articleRules = (req, res, next) => {
    return [
        check('title', lang.translate('invalid-title-messag')).isLength({ min: 4 }),
        check('text', 'Text should be at least 10 chars.').isLength({ min: 10 }),
    ];
};


app.post('/post/create', [authMiddleware, articleRules()], (req, res, next) => {
    
    // how we hide this DRY
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('post/create', { errors: errors.array() });
    }
    
    Post.create({
        title: req.body.title,
        text: req.body.text,
        created_at: (new Date()).toTimeString(),
        user_id: req.user.id,
    }, (err, post) => {
        if(err) {
            console.log('Error: ', err);
            return res.send({error: err});
        }
        res.redirect('/');
    }); 
});

app.get('/post/show/:id', (req, res) => {
    Post.findById(req.params.id, (err, post) => {
        if(err || !post){
            return res.render('404');
        }

        res.render('post/show', { post: post });
    });
});
app.get('/post/edit/:id', (req, res) => {
    Post.findById(req.params.id, (err, post) => {
        if(err || !post){
            return res.render('404');
        }
        res.render('post/edit', { post: post });
    });
});
app.put('/post/edit/:id',[authMiddleware, articleRules()], (req, res) => {
    
    // how we hide this ? DRY
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.redirect('back');
    }

    Post.findByIdAndUpdate(req.params.id, req.body.data, (err, post) => {
        if(err || !post){
            return res.render('404');
        }
        res.redirect(`/post/show/${post.id}`);

    });
});
app.delete('/post/delete/:id', authMiddleware, (req, res) => {
    // make sure the current user is the owner
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
});


app.post('/lang', (req, res, next) => {
    if(req.body.lang){
        lang.config.def = req.body.lang;
    }
    res.redirect('back');
});

module.exports = app;