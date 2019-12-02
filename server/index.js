// reuirements
const express = require('express');
let mongoose = require('mongoose');
const path = require('path');
const flash = require('connect-flash');
let cookieParser = require('cookie-parser');

let i18n = require('i18n');
i18n.configure({
  locales: ['ar', 'fr', 'en'],
  directory: path.join(__dirname, '../locales'),
  defaultLocale: 'ar',
  cookie: 'blogpress',
  api:{
      '__': 'lang',
    }
});
const expressSession = require('express-session')({ 
    secret: 'blogpress',
    resave: false,
    saveUninitialized: false
});

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
const commentRules = require('../middlewares/commentRules');
// controllers
const HomeController = require('../controllers/HomeController');
const AuthController = require('../controllers/AuthController');
const ArticleController = require('../controllers/ArticleController');
const LangController = require('../controllers/LangController');
const CommentController = require('../controllers/CommentController');

// initialization & configuration
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const app = express();
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.use(expressSession);
app.use(cookieParser("blogpress"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(i18n.init);
app.use((req, res, next) => {
    if(req.cookies.i18n){
        res.setLocale(req.cookies.i18n);
    }
    res.locals.currentUser = req.user;
    res.locals.error = '';
    if(res.locals.errors === undefined)
        res.locals.errors = [];
    next();
});

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
    failureFlash: true
}));

// post routes
app.get('/post/create', authMiddleware, ArticleController.create);
app.post('/post/create', [authMiddleware, articleRules()], ArticleController.store);
app.get('/post/show/:id', ArticleController.show);
app.get('/post/edit/:id', ArticleController.edit);
app.put('/post/edit/:id',[authMiddleware, articleRules()], ArticleController.update);
app.delete('/post/delete/:id', authMiddleware, ArticleController.destroy);

// comment routes
app.post('/comment/:post_id', [authMiddleware, commentRules()], CommentController.store);

// i18n lang
app.post('/lang', LangController.update);

module.exports = app;