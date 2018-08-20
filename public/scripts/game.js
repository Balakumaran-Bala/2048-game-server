var redis = require('redis');
var client = redis.createClient();

var score;
var grid;
var game_over;
var restartMouseOver;
var animating_blocks = [];

function updateGrid() {
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
}

function updateState() {
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

function generateRand(oldGrid, timeNow) {
    let change = 0;

    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (oldGrid[i][j] != grid[i][j]) {
                change++;
            }
        }
    }

    if (change != 0) {
        let randI = Math.floor(Math.random()*4);
        let randJ = Math.floor(Math.random()*4);
        while (grid[randI][randJ] != 0) {
            randI = Math.floor(Math.random()*4);
            randJ = Math.floor(Math.random()*4);
        }

        if (Math.random() >= 0.3) {
            grid[randI][randJ] = 2;
        } else {
            grid[randI][randJ] = 4;
        }

        let animated_block = {
            "start": {"row": randI, "col": randJ},
            "end": {"row": randI, "col": randJ},
            "startTime": timeNow,
            "action": "spawn"
        };
        animating_blocks.push(animated_block);
    }
}

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

    updateState();

    return grid;
}

function logicLeft() {
    let timeNow = Date.now();

    animating_blocks = [];

    let bool = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];

    let oldGrid = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];

    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            oldGrid[i][j] = grid[i][j];
        }
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

    generateRand(oldGrid, timeNow);
}

function logicRight() {
    let timeNow = Date.now();

    animating_blocks = [];

    let bool = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];

    let oldGrid = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];

    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            oldGrid[i][j] = grid[i][j];
        }
    }

    for (let i = grid.length-1; i >= 0; i--) {
        for (let j = grid.length-1; j >= 0; j--) {
            if (grid[i][j] != 0) {
                let pos = j+1;
                while (pos <= 3 && grid[i][pos] === 0) {
                    pos++;
                }
                if (pos !== 4 &&
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
                    let temp = grid[i][pos-1];
                    grid[i][pos-1] = grid[i][j];
                    grid[i][j] = temp;

                    if (pos !== j+1) { // block will move, start != end
                        let animated_block = {
                            "start": {"row": i, "col": j},
                            "end": {"row": i, "col": pos-1},
                            "startTime": timeNow,
                            "action": "slide"
                        };
                        animating_blocks.push(animated_block);
                    }
                }
            }
        }
    }

    generateRand(oldGrid, timeNow);

}

function logicUp() {
    let timeNow = Date.now();

    animating_blocks = [];

    let bool = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];

    let oldGrid = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];

    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            oldGrid[i][j] = grid[i][j];
        }
    }

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid.length; j++) {
            if (grid[j][i] != 0) {
                let pos = j-1;
                while (pos >= 0 && grid[pos][i] === 0) {
                    pos--;
                }
                if (pos !== -1 &&
                    grid[pos][i] === grid[j][i] &&
                    bool[pos][i] !== 1) {

                    grid[pos][i] *= 2;
                    score += grid[pos][i];
                    bool[pos][i] = 1;
                    grid[j][i] = 0;

                    let animated_block = {
                        "start": {"row": j, "col": i},
                        "end": {"row": pos, "col": i},
                        "startTime": timeNow,
                        "action": "slide"
                    };
                    animating_blocks.push(animated_block);

                    animated_block = {
                        "start": {"row": pos, "col": i},
                        "end": {"row": pos, "col": i},
                        "startTime": null,
                        "action": "promote"
                    };
                    animating_blocks.push(animated_block);
                } else {
                    let temp = grid[pos+1][i];
                    grid[pos+1][i] = grid[j][i];
                    grid[j][i] = temp;

                    if (pos !== j-1) { // block will move, start != end
                        let animated_block = {
                            "start": {"row": j, "col": i},
                            "end": {"row": pos+1, "col": i},
                            "startTime": timeNow,
                            "action": "slide"
                        };
                        animating_blocks.push(animated_block);
                    }
                }
            }
        }
    }

    generateRand(oldGrid, timeNow);
}

function logicDown() {
    let timeNow = Date.now();

    animating_blocks = [];

    let bool = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];

    let oldGrid = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];

    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            oldGrid[i][j] = grid[i][j];
        }
    }

    for (let i = grid.length-1; i >= 0; i--) {
        for (let j = grid.length-1; j >= 0; j--) {
            if (grid[j][i] != 0) {
                let pos = j+1;
                while (pos <= 3 && grid[pos][i] === 0) {
                    pos++;
                }
                if (pos !== 4 &&
                    grid[pos][i] === grid[j][i] &&
                    bool[pos][i] !== 1) {

                    grid[pos][i] *= 2;
                    score += grid[pos][i];
                    bool[pos][i] = 1;
                    grid[j][i] = 0;

                    let animated_block = {
                        "start": {"row": j, "col": i},
                        "end": {"row": pos, "col": i},
                        "startTime": timeNow,
                        "action": "slide"
                    };
                    animating_blocks.push(animated_block);

                    animated_block = {
                        "start": {"row": pos, "col": i},
                        "end": {"row": pos, "col": i},
                        "startTime": null,
                        "action": "promote"
                    };
                    animating_blocks.push(animated_block);
                } else {
                    let temp = grid[pos-1][i];
                    grid[pos-1][i] = grid[j][i];
                    grid[j][i] = temp;

                    if (pos !== j+1) { // block will move, start != end
                        let animated_block = {
                            "start": {"row": j, "col": i},
                            "end": {"row": pos-1, "col": i},
                            "startTime": timeNow,
                            "action": "slide"
                        };
                        animating_blocks.push(animated_block);
                    }
                }
            }
        }
    }

    generateRand(oldGrid, timeNow);

}

function moveLeft() {

    updateGrid();

    logicLeft();

    updateState();

    return {
        newState: grid, 
        animation: animating_blocks
    }
}

function moveRight() {

    updateGrid();

    logicRight();
    
    updateState();

    return {
        newState: grid, 
        animation: animating_blocks
    }
}

function moveUp() {

    updateGrid();

    logicUp();

    updateState();

    return {
        newState: grid, 
        animation: animating_blocks
    }
}

function moveDown() {

    updateGrid();

    logicDown();

    updateState();

    return {
        newState: grid, 
        animation: animating_blocks
    }
}

exports.grid = grid;
exports.restartGame = restartGame;
exports.moveLeft = moveLeft;
exports.moveRight = moveRight;
exports.moveUp = moveUp;
exports.moveDown = moveDown;
