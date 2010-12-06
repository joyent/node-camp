

var map = {
  1: {x: 1, y: 0},
  2: {x: 3, y: 1},
  3: {x: 1, y: 2},
  4: {x: 3, y: 3},
  5: {x: 1, y: 4},
  6: {x: 3, y: 5},
  7: {x: 1, y: 6}
};

// Connection handler
module.exports = function (socket) {
  var globalSocket = module.exports.socket;
  
  // Send the client te initial map
  socket.send({map: map});

  var Commands = {
    move: function (params) {
      map[params.id] = params;
      globalSocket.broadcast({move: params});
    }
  };

  socket.on('message', function (message) {
    //console.log(message);
    Object.keys(message).forEach(function (command) {
      if (Commands.hasOwnProperty(command)) {
        Commands[command](message[command]);
      } else {
        console.error("Invalid command " + command);
      }
    });
  });

};
