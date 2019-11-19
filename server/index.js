const express = require('express');
const app = express(); 

// app.set('view engine', 'ejs');

app.get('/login', (req, res) => {
    return res.render('login/index.ejs');
});


module.exports = app;