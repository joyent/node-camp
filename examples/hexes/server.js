var Connect = require('connect'),
    io = require('socket.io'),
    game = require('./web/game');

var PORT = process.env.PORT || 8080;

var server = Connect.createServer(
  Connect.staticProvider(__dirname + "/web")
);

var socket = io.listen(server);

game.socket = socket;
socket.on('connection', game);

server.listen(PORT);
console.log("Server running at port http://localhost:%s/", PORT);
