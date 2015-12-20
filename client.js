'use strict';

var io     = require('socket.io-client');
var $      = require('jquery');
var socket = io();

socket.on('message', function(data) {
	console.log('Data received.', data);
    for(var key in data) {
        $('#' + key + '>.quote').text(data[key][0]);
        $('#' + key + '>.offset').text(data[key][1]);
        $('#' + key + '>.percentage').text(data[key][2]);
        $('#' + key + '>.time').text(data[key][3]);
    }
});
