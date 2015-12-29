module.exports = function(socketServer) {

    var socket;

    socketServer.on('connection', function(s){

        if(socket) {
            socket.write('New connection from ' + socket.remoteAddress + '. Closing this connection.');
            socket.end();
        }

        socket = s;
        
        console.log('[' + new Date() + '] Client ' + socket.remoteAddress + ' connected to socket server.');
        socketServer.getConnections((err, count) => console.log('[' + new Date() + '] Server has now ' + count + ' connections.'));

        socket.on('data', function(data){
            console.log('[' + new Date() + '] Data received from client ' + socket.remoteAddress + ': ' + data.toString());
        });

        socket.on('end', function(){
            console.log('[' + new Date() + '] Client ' + socket.remoteAddress + ' disconnected from socket server.');
            socketServer.getConnections((err, count) => console.log('[' + new Date() + '] Server has now ' + count + ' connections.'));
            socket = null;
        });

        // 发送挂单信息
        setTimeout(function(){
            console.log('[' + new Date() + '] Sending declaration...');
            var data = {
                id: '5654a6aa2904b82f89a7b5b3',
                name: '易鑫安1期',
                provider: {
                    name: '中信信托', // 通道提供商名称
                    code: 'ZXXT' // 通道提供商代号
                },
                credentials: {
                    login: '12345678', // 登录帐号
                    pass: '111111' // 密码
                },
                declarations: [ // 量化服务向交易接口服务发送的报单/撤单后的所有申报，交易接口服务向量化服务发送的报单/撤单/成交后的所有申报
                    {
                        id: '5654a6aa2904b82f89a7b5b4',
                        stock: {
                            id: '5654a6aa2904b82f89a7b5b5',
                            type: 'stock',
                            name: '浦发银行', // 标的的显示名称
                            code: 'SH600000', // 标的的代号
                        },
                        type: '', // 挂单类型
                        serialNumber: null, // 通道流水号/合同号
                        price: 18.70,
                        time: '2015-12-28T07:00:00.000Z',
                        volume: 10000, // 正数买入, 负数卖出
                        volumeCompleted: 0, // 正数买入, 负数卖出
                        status: 'not declared'
                    }
                ],
            };
            socket.write(JSON.stringify(data));
        }, 3000);
    })
    .on('error', function (e) {
        console.log('[' + new Date() + '] Socket server error:', e);
    });

    return {
        
    }
}