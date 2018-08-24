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

var player_id;

io.on('connection', function (socket) {
    console.log("a user connected: " + socket.id);
    game.grid = game.restartGame(socket.id, player);
    player = player + 1;

    socket.emit('init', {state: game.grid});

    socket.on('playerMove', function(data) {
        console.log(socket.id);
        if (data.key == 37)
            var move = game.moveLeft(socket.id);
        else if (data.key == 39)
            var move = game.moveRight(socket.id);
        else if (data.key == 38)
            var move = game.moveUp(socket.id);
        else if (data.key == 40)
            var move = game.moveDown(socket.id);

        console.log(move);
        socket.emit('updateMove', {state: move});
    });

    socket.on('restart', function(data) {
        game.grid = game.restartGame();
        socket.emit('init', {state: game.grid});
    })

    socket.on('disconnect', function(){
        console.log('user disconnected');
    });

});

client.on("error", function(err) {
    console.log("error" + err);
});

server.listen(8080, function() {
    console.log("Server listening on 8080");
    player = 0;
});
