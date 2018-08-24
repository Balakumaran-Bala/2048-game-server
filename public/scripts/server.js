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

        if (data.key == 37){
            game.moveLeft(socket.id, function(res) {
                console.log("returned: " + res);
                socket.emit('updateMove', {state: res});
            });
        }
        else if (data.key == 39){
            game.moveRight(socket.id, function(res) {
                console.log("returned: " + res);
                socket.emit('updateMove', {state: res});
            });
        }
        else if (data.key == 38){
            game.moveUp(socket.id, function(res) {
                console.log("returned: " + res);
                socket.emit('updateMove', {state: res});
            });
        }
        else if (data.key == 40){
            game.moveDown(socket.id, function(res) {
                console.log("returned: " + res);
                socket.emit('updateMove', {state: res});
            });
        }
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
