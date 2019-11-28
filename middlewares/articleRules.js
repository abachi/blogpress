
const { check } = require('express-validator');

const articleRules = (req, res, next) => {
    return [
        check('title', 'Title should be at least 4 chars.').isLength({ min: 4 }),
        check('text', 'Text should be at least 10 chars.').isLength({ min: 10 }),
    ];
};

module.exports = articleRules;