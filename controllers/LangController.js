const Lang = require('../helpers/express-multilang');
let LangController = {};


LangController.update = (req, res, next) => {
    res.cookie('i18n', req.body.lang); 
    return res.redirect('back');
};


module.exports = LangController;