'use strict';

var express     = require('express');
var bodyParser  = require('body-parser');
var mongoose    = require('mongoose');
var https       = require('https');
var net         = require('net');
var credentials = require('./credentials');

var app         = express();
var router      = express.Router();
var portHttps   = process.env.PORT_HTTPS || 443;
var portSocket  = process.env.PORT_SOCKET || 8888;
var httpsServer = https.createServer(credentials, app);
var socketServer= net.createServer();
var io          = require('socket.io')(httpsServer);
var quotes      = {};

var events = require('./app/events')(io, socketServer, quotes);

mongoose.connect('mongodb://localhost/yxaquant');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

require('./app/apis')(app, router);

app.use(express.static('public'));

httpsServer.listen(portHttps, function() {
    console.log('[' + new Date() + '] HTTPS server listening port:', portHttps);
});

socketServer.listen(portSocket, function() {
    console.log('[' + new Date() + '] Socket server listening port:', portSocket);
});
