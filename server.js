var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var EventEmitter = require('events').EventEmitter;
var ee = new EventEmitter();
var path = require('path');

module.exports = {
	io:io,
	ee:ee
};

var Random = require('./src/Random');
var WaitingQueue = require('./src/WaitingQueue');
var RoomManager = require('./src/RoomManager');

var randomizer = new Random();
var Rmgr = new RoomManager();
var lobby = new WaitingQueue(Rmgr);

app.use(express.static(path.join(__dirname, 'public')));


var port = process.env.PORT || 3000;
http.listen(port, () => {
	console.log('server on!: https://tetrisvs-nbivt.run.goorm.io/');
});

var objects = {};

io.on('connection', (socket) => {	
	io.to(socket.id).emit('connected');
	console.log('user connected: ', socket.id);

	socket.on('waiting',()=>{
		lobby.enter(socket);
    	lobby.getARoomYouTwo();
	});
	
	socket.on('disconnect', () => {
    	lobby.leave(socket);
		console.log('user disconnected: ', socket.id);
	});
});