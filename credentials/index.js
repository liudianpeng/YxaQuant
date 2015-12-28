var fs          = require('fs');

var ca          = fs.readFileSync(__dirname + '/sub.class1.server.ca.pem');
var privateKey  = fs.readFileSync(__dirname + '/ssl.key', 'utf8');
var certificate = fs.readFileSync(__dirname + '/ssl.crt', 'utf8');

module.exports = {ca: ca, key: privateKey, cert: certificate};
