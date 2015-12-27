module.exports = function(socketServer) {
    socketServer.on('connection', function(socket){
        
        console.log('Client connected to socket server.');

        socket.on('data', function(data){
            
        });

        socket.on('end', function(){
            
        });
    })
    .on('error', function (e) {
        console.log('Socket server error:', e);
    });

    return {
        
    }
}