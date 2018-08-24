var redis = require('redis');
var client = redis.createClient();

const {promisify} = require('util');
const lindex = promisify(client.lindex).bind(client);
const hget = promisify(client.hget).bind(client);

var score;
var grid;
var game_over;
var animating_blocks = [];

var updateGrid = function(id) {

    return new Promise(function(resolve, reject) {

        lindex("user:" + id + ":gameState:row0", 0).then(res => {
            console.log("aight so this is done: " + res);
            grid[0][0] = res;
        })

        lindex("user:" + id + ":gameState:row0", 1).then(res => {
            console.log("aight so this is done: " + res);
            grid[0][1] = res;
        })

        lindex("user:" + id + ":gameState:row0", 2).then(res => {
            console.log("aight so this is done: " + res);
            grid[0][2] = res;
        })

        lindex("user:" + id + ":gameState:row0", 3).then(res => {
            console.log("aight so this is done: " + res);
            grid[0][3] = res;
        })

        lindex("user:" + id + ":gameState:row1", 0).then(res => {
            console.log("aight so this is done: " + res);
            grid[1][0] = res;
        })

        lindex("user:" + id + ":gameState:row1", 1).then(res => {
            console.log("aight so this is done: " + res);
            grid[1][1] = res;
        })

        lindex("user:" + id + ":gameState:row1", 2).then(res => {
            console.log("aight so this is done: " + res);
            grid[1][2] = res;
        })

        lindex("user:" + id + ":gameState:row1", 3).then(res => {
            console.log("aight so this is done: " + res);
            grid[1][3] = res;
        })

        lindex("user:" + id + ":gameState:row2", 0).then(res => {
            console.log("aight so this is done: " + res);
            grid[2][0] = res;
        })

        lindex("user:" + id + ":gameState:row2", 1).then(res => {
            console.log("aight so this is done: " + res);
            grid[2][1] = res;
        })

        lindex("user:" + id + ":gameState:row2", 2).then(res => {
            console.log("aight so this is done: " + res);
            grid[2][2] = res;
        })

        lindex("user:" + id + ":gameState:row2", 3).then(res => {
            console.log("aight so this is done: " + res);
            grid[2][3] = res;
        })

        lindex("user:" + id + ":gameState:row3", 0).then(res => {
            console.log("aight so this is done: " + res);
            grid[3][0] = res;
        })

        lindex("user:" + id + ":gameState:row3", 1).then(res => {
            console.log("aight so this is done: " + res);
            grid[3][1] = res;
        })

        lindex("user:" + id + ":gameState:row3", 2).then(res => {
            console.log("aight so this is done: " + res);
            grid[3][2] = res;
        })

        lindex("user:" + id + ":gameState:row3", 3).then(res => {
            console.log("aight so this is done: " + res);
            grid[3][3] = res;
            resolve(grid);
        })
    });

}

function updateState(id) {
    //client.flushdb();

    return new Promise((resolve, reject) => {
        console.log("updated state for user: " + id);


        for (let i = 0; i < 4; i++) {
            //console.log("after - row0: " + i + " " + grid[0][i]);
            client.lpop("user:" + id + ":gameState:row0");
        }

        for (let i = 0; i < 4; i++) {
            //console.log("after - row0: " + i + " " + grid[0][i]);
            client.rpush("user:" + id + ":gameState:row0", grid[0][i]);
        }

        ///////////////////////////////////////////////////////////////
        for (let i = 0; i < 4; i++) {
            //console.log("after - row0: " + i + " " + grid[0][i]);
            client.lpop("user:" + id + ":gameState:row1");
        }

        for (let i = 0; i < 4; i++) {
            //console.log("after - row1: " + i + " " + grid[1][i]);
            client.rpush("user:" + id + ":gameState:row1", grid[1][i]);
        }

        ///////////////////////////////////////////////////////////////
        for (let i = 0; i < 4; i++) {
            //console.log("after - row0: " + i + " " + grid[0][i]);
            client.lpop("user:" + id + ":gameState:row2");
        }

        for (let i = 0; i < 4; i++) {
            //console.log("after - row2: " + i + " " + grid[2][i]);
            client.rpush("user:" + id + ":gameState:row2", grid[2][i]);
        }

        ///////////////////////////////////////////////////////////////
        for (let i = 0; i < 4; i++) {
            //console.log("after - row0: " + i + " " + grid[0][i]);
            client.lpop("user:" + id + ":gameState:row3");
        }

        for (let i = 0; i < 4; i++) {
            //console.log("after - row3: " + i + " " + grid[3][i]);
            client.rpush("user:" + id + ":gameState:row3", grid[3][i]);
            resolve();
        }
    });
    
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

function gameOver() {
    let change_possible = false;
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[0].length; j++) {
            if (0 < i && i < grid.length - 1) {
                if (grid[i-1][j] === grid[i][j] ||
                    grid[i+1][j] === grid[i][j] ||
                    grid[i-1][j] === 0 ||
                    grid[i+1][j] === 0) {
                        change_possible = true;
                    }
            }
            if (0 < j && j < grid[0].length - 1) {
                if (grid[i][j-1] === grid[i][j] ||
                    grid[i][j+1] === grid[i][j] ||
                    grid[i][j-1] === 0 ||
                    grid[i][j+1] === 0) {
                        change_possible = true;
                    }
            }
        }
    }

    if (!change_possible) {
        game_over = true;
    }

    return game_over;
}

function restartGame(socket_id, player_id) {
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

    client.hset("players", socket_id, player_id.toString());
    updateState(player_id.toString());

    return grid;
}

var logicLeft = function() {

    return new Promise(function(resolve, reject) {

        console.log("logicLeft start");
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

        for (let c = 0; c < 4; c++) {
            for (let d= 0; d < 4; d++) {
                grid[c][d] = Number(grid[c][d]);
            }
        }

        for (let a = 0; a < 4; a++) {
            for (let b = 0; b < 4; b++) {
                oldGrid[a][b] = grid[a][b];
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

        if (!gameOver())
            generateRand(oldGrid, timeNow);

        resolve(grid);

        console.log("logicLeft end");
    });
}

function logicRight() {
    return new Promise(function(resolve, reject) {
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

        for (let a = 0; a < 4; a++) {
            for (let b = 0; b < 4; b++) {
                grid[a][b] = Number(grid[a][b]);
            }
        }

        for (let c = 0; c < 4; c++) {
            for (let d = 0; d < 4; d++) {
                oldGrid[c][d] = grid[c][d];
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

        if (!gameOver())
            generateRand(oldGrid, timeNow);

        resolve(grid);
    });

}

function logicUp() {
    return new Promise(function(resolve, reject) {
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

        for (let a = 0; a < 4; a++) {
            for (let b = 0; b < 4; b++) {
                grid[a][b] = Number(grid[a][b]);
            }
        }

        for (let c = 0; c < 4; c++) {
            for (let d = 0; d < 4; d++) {
                oldGrid[c][d] = grid[c][d];
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

        if (!gameOver())
            generateRand(oldGrid, timeNow);

        resolve(grid);
    });
}

function logicDown() {
    return new Promise(function(resolve, reject) {
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

        for (let a = 0; a < 4; a++) {
            for (let b = 0; b < 4; b++) {
                grid[a][b] = Number(grid[a][b]);
            }
        }

        for (let c = 0; c < 4; c++) {
            for (let d = 0; d < 4; d++) {
                oldGrid[c][d] = grid[c][d];
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

        if (!gameOver())
            generateRand(oldGrid, timeNow);

        resolve(grid);
    });
}

function moveLeft(id, cb) {
    var player;

    hget("players", id).then(res => {
        player = res;
        console.log("player: " + res);
        return updateGrid(res);
    })
    .then(res => {
        console.log(res);
        return logicLeft();
    })
    .then(res => {
        console.log(res);
        updateState(player);
    })
    .then(() => {
        cb({
            newState: grid, 
            animation: animating_blocks,
            score: score,
            isOver: game_over
        });
    })
}

function moveRight(id, cb) {

    var player;

    hget("players", id).then(res => {
        player = res;
        console.log("player: " + res);
        return updateGrid(res);
    })
    .then(res => {
        console.log(res);
        return logicRight();
    })
    .then(res => {
        console.log(res);
        updateState(player);
    })
    .then(() => {
        cb({
            newState: grid, 
            animation: animating_blocks,
            score: score,
            isOver: game_over
        });
    })
}

function moveUp(id, cb) {

    var player;
    hget("players", id).then(res => {
        player = res;
        console.log("player: " + res);
        return updateGrid(res);
    })
    .then(res => {
        console.log(res);
        return logicUp();
    })
    .then(res => {
        console.log(res);
        updateState(player);
    })
    .then(() => {
        cb({
            newState: grid, 
            animation: animating_blocks,
            score: score,
            isOver: game_over
        });
    })
}

function moveDown(id, cb) {

    var player;

    hget("players", id).then(res => {
        player = res;
        console.log("player: " + res);
        return updateGrid(res);
    })
    .then(res => {
        console.log(res);
        return logicDown();
    })
    .then(res => {
        console.log(res);
        updateState(player);
    })
    .then(() => {
        cb({
            newState: grid, 
            animation: animating_blocks,
            score: score,
            isOver: game_over
        });
    })
}

exports.grid = grid;
exports.restartGame = restartGame;
exports.moveLeft = moveLeft;
exports.moveRight = moveRight;
exports.moveUp = moveUp;
exports.moveDown = moveDown;
