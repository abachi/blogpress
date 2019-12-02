
const { check } = require('express-validator');

const commentRules = (req, res, next) => {
    return [
        check('comment', 'Comment should not be empty.').isLength({ min: 1 }),
    ];
};

module.exports = commentRules;