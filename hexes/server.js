var Connect = require('connect'),
    io = require('socket.io');

// Allow the user to specify the port via environment variables
var PORT = process.env.PORT || 8080;

// Serve static files in the web folder
var server = Connect.createServer(
  Connect.staticProvider('web')
);

// Listen to socket.io traffic too
var socket = io.listen(server);

// Keep a mapping of all the pieces in the game
var map = {
  1: {x: 1, y: 0},
  2: {x: 3, y: 1},
  3: {x: 1, y: 2},
  4: {x: 3, y: 3},
  5: {x: 1, y: 4},
  6: {x: 3, y: 5},
  7: {x: 1, y: 6}
};

// Every time a new client connects or reconnects, we get this
socket.on('connection', function (client) {
  
  // Send the client te initial map
  client.send({map: map});

  // Define the commands we're willing to accept from the client
  var Commands = {
    // In this simple example, we re-broadcast the move to all clients.
    // In a real game there would some rule checking and other logic here.
    move: function (params) {
      map[params.id] = params;
      socket.broadcast({move: params});
    }
  };

  // Route messages to the Commands object
  client.on('message', function (message) {
    Object.keys(message).forEach(function (command) {
      if (Commands.hasOwnProperty(command)) {
        Commands[command](message[command]);
      } else {
        console.error("Invalid command " + command);
      }
    });
  });
});

server.listen(PORT);
console.log("Server running at port http://localhost:%s/", PORT);
