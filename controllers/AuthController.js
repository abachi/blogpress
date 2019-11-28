
let User = require('../models/User');
let AuthController = {};

AuthController.getRegisterForm = (req, res) => {
    res.render('auth/register');
};

AuthController.getLoginForm = (req, res) => {
    res.render('auth/login');
};

AuthController.register = (req, res) => {
    User.register(new User({ username: req.body.username }), req.body.password, (err, user) => {
        if(err){
            console.log('Error: ', err);
            return res.render('auth/register', { errors: err });
        }
        passport.authenticate('local')(req, res, () => res.redirect('/'));
    });
};

AuthController.logout =  (req, res) => {
    req.logout();
    res.redirect('/');
};

module.exports = AuthController;