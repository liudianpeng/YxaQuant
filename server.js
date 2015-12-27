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
app.set('views', './app/views');
app.set('view engine', 'jade');

app.get('/', function(req, res) {
    var subscribes = req.query.subscribes.split(',');
    events.market.subscribe(subscribes);

    res.render('index', {title: 'YxaQuant', subscribes: subscribes, quotes: quotes});
});

httpsServer.listen(portHttps);
console.log('HTTPS server listening port:', portHttps);

socketServer.listen(portSocket, function() {
    console.log('Socket server listening port:', portSocket);
});
