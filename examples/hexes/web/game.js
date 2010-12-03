
var map = [
  [0, 0, 0, 0, 0, 0],
  [7, 0, 5, 0, 3, 0, 1],
  [0, 0, 0, 0, 0, 0],
  [0, 6, 0, 4, 0, 2, 0],
  [0, 0, 0, 0, 0, 0]
];

// Connection handler
module.exports = function (socket) {
  var globalSocket = module.exports.socket;
  
  // Send the client te initial map
  console.log("Sending to client");
  socket.send({map: map});

  var Commands = {
    move: function (params) {
      globalSocket.broadcast({move: params});
    }
  };

  socket.on('message', function (message) {
    console.dir(message);
    
    Object.keys(message).forEach(function (command) {
      if (Commands.hasOwnProperty(command)) {
        Commands[command](message[command]);
      } else {
        console.error("Invalid command " + command);
      }
    });
  });

};
