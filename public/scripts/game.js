var redis = require('redis');
var client = redis.createClient();

var score;
var grid;
var game_over;
var restartMouseOver;
var animating_blocks = [];

// const {
//   performance
// } = require('perf_hooks');

function restartGame() {

    console.log("restart game");
	score = 0;
    grid = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];
    game_over = false;

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

    return grid;
}

function moveLeft() {
    let timeNow = Date.now();

    animating_blocks = [];

    let bool = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];

    for (var i = 0; i < 4; i++) {
        client.lindex("gameState:row0", i, function(err, result) {
            if (err) 
                throw err
            else
                grid[0][i] = result;
        });
    }

    for (var i = 0; i < 4; i++) {
        client.lindex("gameState:row1", i, function(err, result) {
            if (err) 
                throw err
            else
                grid[1][i] = result;
        });
    }

    for (var i = 0; i < 4; i++) {
        client.lindex("gameState:row2", i, function(err, result) {
            if (err) 
                throw err
            else
                grid[2][i] = result;
        });
    }

    for (var i = 0; i < 4; i++) {
        client.lindex("gameState:row3", i, function(err, result) {
            if (err) 
                throw err
            else
                grid[3][i] = result;
        });
    }

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid.length; j++) {
            if (grid[i][j] != 0) {
                let pos = j-1;
                while (pos >= 0 && grid[i][pos] === 0) {
                    pos--;
                }
                if (pos !== -1 &&
                    grid[i][pos] === grid[i][j] &&
                    bool[i][pos] !== 1) {

                    grid[i][pos] *= 2;
                    score += grid[i][pos];
                    bool[i][pos] = 1;
                    grid[i][j] = 0;

                    let animated_block = {
                        "start": {"row": i, "col": j},
                        "end": {"row": i, "col": pos},
                        "startTime": timeNow,
                        "action": "slide"
                    };
                    animating_blocks.push(animated_block);

                    animated_block = {
                        "start": {"row": i, "col": pos},
                        "end": {"row": i, "col": pos},
                        "startTime": null,
                        "action": "promote"
                    };
                    animating_blocks.push(animated_block);
                } else {
                    let temp = grid[i][pos+1];
                    grid[i][pos+1] = grid[i][j];
                    grid[i][j] = temp;

                    if (pos !== j-1) { // block will move, start != end
                        let animated_block = {
                            "start": {"row": i, "col": j},
                            "end": {"row": i, "col": pos+1},
                            "startTime": timeNow,
                            "action": "slide"
                        };
                        animating_blocks.push(animated_block);
                    }
                }
            }
        }
    }

    return {
        newState: grid, 
        animation: animating_blocks
    }
}

exports.grid = grid;
exports.restartGame = restartGame;
exports.moveLeft = moveLeft;
