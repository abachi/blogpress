const alreadyAuthenticated = (req, res, next) => {
    if(req.isAuthenticated()){
        console.log('The user already authenticated');
        return res.redirect('/');
    }
    next();
};

module.exports = alreadyAuthenticated; 