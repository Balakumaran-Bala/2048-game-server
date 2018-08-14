var redis = require('redis');
var client = redis.createClient();

function restartGame() {
	var score;
	var grid;
	var game_over;
	var restartMouseOver;
	var scoreSent;
	var playerName;

	score = 0;
    grid = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];
    game_over = false;
    scoreSent = false;
    playerName = "";

    let randI = Math.floor(Math.random()*4);
    let randJ = Math.floor(Math.random()*4);

    grid[randI][randJ] = 2;
    randI = Math.floor(Math.random()*4);
    randJ = Math.floor(Math.random()*4);
    grid[randI][randJ] = 2;

    client.flushdb();

    for (var i = 0; i < 4; i++) {
    	client.rpush("gameState:row0", grid[0][i]);
    }

    for (var i = 0; i < 4; i++) {
    	client.rpush("gameState:row1", grid[1][i]);
    }

    for (var i = 0; i < 4; i++) {
    	client.rpush("gameState:row2", grid[2][i]);
    }

    for (var i = 0; i < 4; i++) {
    	client.rpush("gameState:row3", grid[3][i]);
    }
}

module.exports.restartGame = restartGame;
