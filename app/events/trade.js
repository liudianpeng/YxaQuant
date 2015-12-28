module.exports = function(socketServer) {
    socketServer.on('connection', function(socket){
        
        console.log('[' + new Date() + '] Client ' + socket.remoteAddress + ' connected to socket server.');

        socket.on('data', function(data){
            
        });

        socket.on('end', function(){
            
        });
    })
    .on('error', function (e) {
        console.log('[' + new Date() + '] Socket server error:', e);
    });

    return {
        
    }
}