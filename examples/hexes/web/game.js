
var map = [
  [0, 0, 0, 0, 0, 0],
  [7, 0, 5, 0, 3, 0, 1],
  [0, 0, 0, 0, 0, 0],
  [0, 6, 0, 4, 0, 2, 0],
  [0, 0, 0, 0, 0, 0]
];

// Connection handler
module.exports = function (socket) {

  socket.on('connect', function () {
    // Send the client te initial map
    socket.send({map: map});
  });

  socket.on('message', function (message) {
    console.dir(message);
  });

};
