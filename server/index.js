// reuirements
const express = require('express');
let mongoose = require('mongoose');
const expressSession = require('express-session')({ 
    secret: 'random key',
    resave: false,
    saveUninitialized: false
});
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
// DBSeeder(); // reset the database 
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
    // console.log('req.user', req.user);
    next();
});


// database config 
mongoose.connect('mongodb://localhost/blogex', {
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
            return res.render('register');
        }
        passport.authenticate('local')(req, res, () => res.redirect('/'));
    });
});
app.get('/login', alreadyAuthenticated, (req, res) => {
    res.render('auth/login');
});
app.post('/login', passport.authenticate("local", {
        successRedirect: '/',
        failureRedirect: '/login'
    }), (req, res ) => {});

// post routes
app.get('/post/create', authMiddleware, (req, res) => {
    res.render('post/create');
});

const postValidation = (req, res, next) => {
    
};

app.post('/post/create', [authMiddleware], (req, res, next) => {
    
    // input validation
    
    // store the post in database
    Post.create({
        title: req.body.title,
        text: req.body.text,
        created_at: (new Date()).toTimeString(),
        user_id: req.user.id,
    }, (err, post) => {
        if(err) {
            console.log('Error: ', err);
            return;
        }
        console.log('Post created.');
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
app.put('/post/edit/:id', (req, res) => {
    Post.findByIdAndUpdate(req.params.id, req.body.data, (err, post) => {
        if(err || !post){
            return res.render('404');
        }
        res.redirect(`/post/show/${post.id}`);

    });
});
app.delete('/post/delete/:id', (req, res) => {
    Post.findByIdAndRemove(req.params.id, (err, post) => {
        if(err){
            return res.render('404');
        }
        
        res.redirect('/');
    });
});


module.exports = app;