/* global __dirname */
'use strict';

require('dotenv').config();
var express = require('express');

var app = express();
app.set('port', (process.env.PORT || 3000));

// static
app.use(require('./controllers/static'));

// Start server
app.listen(app.get('port'),function() {
    console.log('Server listening on port '+ app.get('port'));
});
