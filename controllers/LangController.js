const Lang = require('../helpers/express-multilang');
let LangController = {};


LangController.update = (req, res, next) => {
    if(req.body.lang){
        let lang = new Lang();
        lang.config.def = req.body.lang;
    }
    res.redirect('back');
};


module.exports = LangController;