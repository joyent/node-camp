var colors = ['red', 'brown', 'purple', 'blue', 'orange', 'green', 'yellow'];

var map = [
  [0, 0, 0, 0, 0, 0],
  [7, 0, 5, 0, 3, 0, 1],
  [0, 0, 0, 0, 0, 0],
  [0, 6, 0, 4, 0, 2, 0],
  [0, 0, 0, 0, 0, 0]
];

// Connection handler
module.exports = function (socket) {
  var selected = null,
      target = null;

  socket.on('connect', function () {
    // Send the client te initial map
    socket.send({map: map});
  });

  socket.on('message', function (click) {
    console.dir(click);
 
    // If the user clicks and nothing is selected,
    // assume they are trying to select something.
    if (!selected) {
      // Make sure there is something to select.
      if (map[click.x][click.y]) {
        selected = click;
        socket.send({select: click});
      }
      return;
    }
    var id = map[selected.x][selected.y];
    if (!id) {
      socket.send({deselect: selected});
      return;
    }
    map[selected.x][selected.y] = 0;
    map[click.x][click.y] = id;
    var command = {move: {id: id, x: click.x, y: click.y}};
    socket.send(command);
    socket.broadcast(command);
  });

};
