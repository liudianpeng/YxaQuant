'use strict';

var _ = require('lodash');
var Account = require('./models/account');

function Trade (socketServer, quant) {

    var socket, _self = this;

    this.declare = function (accountId, stockId, price, volume) {

        if(!process.env.DEBUG && !socket) {
            console.error('交易服务器未连接, 下单失败');
            return false;
        }

        if(!volume) {
            return;
        }

        var data = _.find(this.accounts, {_id: accountId}).toObject();
        var stock = quant.market.subscribedStocks[stockId];

        data.event = 'declaration';
        data.declarations = [];
        data.declarations.push({
            stock: {
                id: stockId,
                type: stock.type,
                name: stock.name,
                code: stock.code,
            },
            type: '',
            serialNumber: '',
            price: price,
            time: new Date(),
            volume: volume,
            volumeCompleted: 0,
            status: "not declared",
            recall: false
        });

        if(!process.env.DEBUG) {
            console.log('发送挂单信息', JSON.stringify(data));
            socket.write(JSON.stringify(data) + "\0");
        }
        
        return true;
    }

    this.cancel = function () {

    }

    this.updateAccount = function(data) {
        Account.findOneAndUpdate({id: data.id}, data).exec();
    }

    this.accounts = [];

    this.loadAccounts = function () {
        Account.find().exec().then(accounts => {
            this.accounts = accounts;
        });
    };

    this.loadAccounts();

    socketServer.on('connection', function(s){

        if(socket) {
            socket.write('New connection from ' + socket.remoteAddress + '. Closing this connection.');
            socket.end();
        }

        socket = s;
        
        console.log('[' + new Date() + '] Client ' + socket.remoteAddress + ' connected to socket server.');
        socketServer.getConnections((err, count) => console.log('[' + new Date() + '] Server has now ' + count + ' connections.'));

        // 查询账户信息
        Account.find().exec().then(accounts => {
            accounts.forEach(account => {
                var data = {
                    event: 'account',
                    id: account.id,
                    provider: account.provider,
                    credentials: account.credentials
                };
                console.log('[' + new Date() + '] Getting account info of ' + account.name);
                console.log('[' + new Date() + '] Sending data:', JSON.stringify(data) + "\0");
                socket.write(JSON.stringify(data) + "\0");
            });
        });

        socket.on('data', function(data){
            data = data.toString().replace(/\0$/, '');
            console.log('[' + new Date() + '] Data received from client ' + socket.remoteAddress + ': ' + data);

            try {
                data = JSON.parse(data);
            }
            catch(e) {
                console.error('JSON decode error for data: ', data);
            }

            if(data.event === 'account') {
                _self.updateAccount(data);
            }
            else if(data.declarations) {
                data.declarations.forEach(declaration => {
                    console.log('Declaration', declaration.serialNumber);
                });
            }

            /**
            // 挂单成功后2秒, 撤单
            if(data.declarations[0] && data.declarations[0].status === 'declared') {
                setTimeout(function() {
                    console.log('Recall declaration', data.declarations[0].serialNumber);
                    data.declarations[0].recall = true;
                    socket.write(JSON.stringify(data) + "\0");
                }, 2000);
            }
            */
        });

        socket.on('end', function(){
            console.log('[' + new Date() + '] Client ' + socket.remoteAddress + ' disconnected from socket server.');
            socketServer.getConnections((err, count) => console.log('[' + new Date() + '] Server has now ' + count + ' connections.'));
            socket = null;
        });

        /**
        // 发送挂单信息
        setTimeout(function(){
            console.log('[' + new Date() + '] Sending declaration...');
            var data = {
                id: '5654a6aa2904b82f89a7b5b3',
                name: '易鑫安1期',
                provider: {
                    name: '中信信托', // 通道提供商名称
                    code: 'ZXXT_TEST' // 通道提供商代号
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
            socket.write(JSON.stringify(data) + "\0");
        }, 3000);
        */
    })
    .on('error', function (e) {
        console.log('[' + new Date() + '] Socket server error:', e);
    });
}

module.exports = function (socketServer, quant) {
    return new Trade(socketServer, quant);
};
