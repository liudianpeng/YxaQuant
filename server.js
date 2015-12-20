'use strict';

var express     = require('express');
var bodyParser  = require('body-parser');
var mongoose    = require('mongoose');

var app         = express();
var router		= express.Router();

var port        = process.env.PORT_HTTPS || 443;
var https       = require('https');
var fs          = require('fs');
var ca          = fs.readFileSync('./credentials/sub.class1.server.ca.pem');
var privateKey  = fs.readFileSync('./credentials/ssl.key', 'utf8');
var certificate = fs.readFileSync('./credentials/ssl.crt', 'utf8');
var credentials = {ca: ca, key: privateKey, cert: certificate};
var httpsServer = https.createServer(credentials, app);
var io          = require('socket.io')(httpsServer);

var quotes      = {};

mongoose.connect('mongodb://localhost:27017/yxaquant');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

require('./app/apis')(app, router);
require('./app/events')(io, quotes);

app.use(express.static('public'));
app.set('views', './app/views');
app.set('view engine', 'jade');

app.get('/', function(req, res) {
    res.render('index', {title: 'YxaQuant', message: 'Hello World!'});
});

httpsServer.listen(port);
console.log('Listening port:', port);
