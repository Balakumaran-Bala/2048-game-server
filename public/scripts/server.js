var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var redis = require('redis');
var game = require('./game.js');

var client = redis.createClient();

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.static(path.join(__dirname, '/../')))

io.on('connection', function (socket) {
  	console.log("a user connected!");

  	game.grid = game.restartGame();

	socket.emit('init', {state: game.grid});

  	socket.on('playerMove', function(data) {
  		console.log("the following key was pressed: " + data.key);
  		var move = game.moveLeft();
  		socket.emit('updateMove', {state: move});
  	});

  	socket.on('disconnect', function(){
    	console.log('user disconnected');
  	});

});

client.on("error", function(err) {
	console.log("error" + err);
});

server.listen(8080, function() {
	console.log("Server listening on 8080");
});
