var io = require('socket.io-client');
var socket = io();
var serverTimeSpan = document.getElementById('server-time');

socket.on('message', function(data){
	serverTimeSpan.innerText = data;
});