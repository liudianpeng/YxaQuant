'use strict';

var express     = require('express');
var bodyParser  = require('body-parser');
var mongoose    = require('mongoose');

var app         = express();

var port        = process.env.PORT || 443;
var router      = express.Router();

var Stock       = require('./app/models/stock');
 
var fs          = require('fs');
var https       = require('https');
var ca          = fs.readFileSync('./credentials/sub.class1.server.ca.pem');
var privateKey  = fs.readFileSync('./credentials/ssl.key', 'utf8');
var certificate = fs.readFileSync('./credentials/ssl.crt', 'utf8');

var credentials = {ca: ca, key: privateKey, cert: certificate};

var httpsServer = https.createServer(credentials, app);

var io          = require('socket.io')(httpsServer);

mongoose.connect('mongodb://localhost:27017/yxaquant');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(express.static('public'));
app.set('views', './app/views');
app.set('view engine', 'jade');

// websocket testing
io.on('connection', function(socket){
    setInterval(function(){
        socket.send(new Date());
    }, 1000);
});

// http testing
app.get('/', function(req, res) {
    res.render('index', {title: 'YxaQuant', message: 'Hello World!'});
});

// Stock CURD
router.route('/stocks')

    // create a stock (accessed at POST http://localhost:8080/api/stocks)
    .post(function(req, res) {
        
        var stock = new Stock();      // create a new instance of the Stock model
        stock.name = req.body.name;  // set the stocks name (comes from the request)
        stock.code = req.body.code;
        console.log(req.body);

        // save the stock and check for errors
        stock.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'Stock created!' });
        });
        
    })

    // get all the stocks (accessed at GET http://localhost:8080/api/stocks)
    .get(function(req, res) {
        Stock.find(function(err, stocks) {
            if (err)
                res.send(err);

            res.json(stocks);
        });
    });

// on routes that end in /stocks/:stock_id
// ----------------------------------------------------
router.route('/stocks/:stock_id')

    // get the stock with that id (accessed at GET http://localhost:8080/api/stocks/:stock_id)
    .get(function(req, res) {
        Stock.findById(req.params.stock_id, function(err, stock) {
            if (err)
                res.send(err);
            res.json(stock);
        });
    })

    .put(function(req, res) {

        // use our stock model to find the stock we want
        Stock.findById(req.params.stock_id, function(err, stock) {

            if (err)
                res.send(err);

            stock.name = req.body.name;  // update the stocks info
            stock.code = req.body.code;

            // save the stock
            stock.save(function(err) {
                if (err)
                    res.send(err);

                res.json({ message: 'Stock updated!' });
            });

        });
    })

    // delete the stock with this id (accessed at DELETE http://localhost:8080/api/stocks/:stock_id)
    .delete(function(req, res) {
        Stock.remove({
            _id: req.params.stock_id
        }, function(err, stock) {
            if (err)
                res.send(err);

            res.json({ message: 'Successfully deleted' });
        });
    });


// register routes
app.use('/api', router);

// start the server
httpsServer.listen(port);
console.log('Listening port:', port);
