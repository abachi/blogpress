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
// middlewares 
const alreadyAuthenticated = require('../middlewares/alreadyAuthenticated');
const authMiddleware = require('../middlewares/authMiddleware');
const articleRules = require('../middlewares/articleRules');
// controllers
const HomeController = require('../controllers/HomeController');
const AuthController = require('../controllers/AuthController');
const ArticleController = require('../controllers/ArticleController');
const LangController = require('../controllers/LangController');


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
app.get('/', HomeController.index);

// auth routes
app.get('/register', alreadyAuthenticated, AuthController.getRegisterForm);
app.get('/logout', AuthController.logout);
app.post('/register', AuthController.register);
app.get('/login', alreadyAuthenticated, AuthController.getLoginForm);
app.post('/login', passport.authenticate("local", {
    successRedirect: '/',
    failureRedirect: '/login',
}));

// post routes
app.get('/post/create', authMiddleware, ArticleController.create);
app.post('/post/create', [authMiddleware, articleRules()], ArticleController.store);
app.get('/post/show/:id', ArticleController.show);
app.get('/post/edit/:id', ArticleController.edit);
app.put('/post/edit/:id',[authMiddleware, articleRules()], ArticleController.update);
app.delete('/post/delete/:id', authMiddleware, ArticleController.destroy);
app.post('/lang', LangController.update);

module.exports = app;