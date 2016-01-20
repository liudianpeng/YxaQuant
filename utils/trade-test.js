var net = require('net');

var client = net.connect(8888, function() {
    console.log('[' + new Date() + '] Connected to server.');
});

client.on('data', function(data) {

    data = data.toString().replace(/\0$/, '');

    console.log('[' + new Date() + '] Data received: ', data);
    
    var data = JSON.parse(data);

    // 发送报单结果
    setTimeout(function(){
        data.declarations = data.declarations.map(function(declaration){
            if(!declaration.serialNumber) {
                declaration.serialNumber = 10001;
            }
            declaration.status = 'declared';
            return declaration;
        });
        console.log('[' + new Date() + '] Sending declaration results...');
        client.write(JSON.stringify(data) + "\0");
    }, 1000);
    
    // 发送成交结果
    setTimeout(function(){

        // 模拟第一笔申报成交
        var declaration = data.declarations[0];
        declaration.volumeCompleted = declaration.volume / 2;

        // 其中又分为40%, 60%两笔成交
        [0.4, 0.6].forEach(ratio => {
            var transaction = {};
            Object.assign(transaction, declaration);
            transaction.volume = declaration.volumeCompleted * ratio;
            transaction.amount = transaction.volume * transaction.price;
            declaration.status = 'partial completed';
            if(!data.transactions){
                data.transactions = [];
            }
            data.transactions.push(transaction);
        });

        console.log('[' + new Date() + '] Sending transaction results...');
        client.write(JSON.stringify(data) + "\0");

    }, 5000);
});

client.on('end', function() {
    console.log('[' + new Date() + '] Disconnected from server.');
});
