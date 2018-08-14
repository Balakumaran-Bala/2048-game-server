var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var redis = require('redis');
var client = redis.createClient();

var restart = require('./restartGame.js');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extendeed: true}));
app.use(express.static(path.join(__dirname, '/public')))

app.use('/', function(req, res) {
	restart.restartGame();
	console.log("hello");
	res.send();
});

client.on("error", function(err) {
	console.log("error" + err);
});

app.listen(8080, function() {
	console.log("Server listening on 8080");
});
