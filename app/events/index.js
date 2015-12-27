module.exports = function(io, quotes) {
    io.on('connection', function(socket){
        socket.send(quotes);
    });

    require('./market.js')(io, quotes);
};
