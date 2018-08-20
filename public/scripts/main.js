var grid;
var score;
var game_over;
var restartMouseOver;

var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");

socket.on('updateMove', function(data) {
    animating_blocks = data.state.animation;
    grid = data.state.newState;
    animating_blocks = [];
});

socket.on('init', function(data) {

    if ((window.screen.width / window.screen.height) > 0.47 && window.screen.width <= 425) {
        let canvasHeight = canvas.getBoundingClientRect().height; // window.screen.width*2.17
        canvas.style.top = "-" + Math.min(canvasHeight * .15, canvasHeight - window.screen.height) + "px";
    }

    ctx.scale(.6, .6);

    grid = data.state;
    game_over = false;
    score = 0;

    render();
    inputInit(); // start the game
});
