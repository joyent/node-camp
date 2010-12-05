/*global Sprite io document*/

var colors = ['space', 'red', 'brown', 'purple', 'blue', 'orange', 
              'green', 'yellow'];

var socket = new io.Socket("10.0.1.9", {port: 8080}); 
setTimeout(function () {
  socket.connect();
}, 100);
var flail = true;
setInterval(function () {
  if (flail) {
    socket.connect();
  }
}, 10000);
socket.on('connect', function () {
  flail = false;
});
socket.on('disconnect', function () {
  flail = true;
});

function inherits(child, parent) {
  child.prototype = Object.create(parent.prototype);
  child.prototype.constructor = child;
  child.parent = parent;
}

// Singleton selection sprite
var selected;

var pieces = {};



function Tile(x, y, colorCode) {
  Sprite.call(this, x, y, colors[colorCode]);
}
inherits(Tile, Sprite);
Tile.prototype.setTransform = function (x, y) {
  x = x * 55 + 10;
  y = 47 + y * 64 - (x % 2) * 32;
  Sprite.prototype.setTransform.call(this, x, y);
};

function Space(x, y) {
  this.gx = x;
  this.gy = y;
  Tile.call(this, x, y, 0);
}
inherits(Space, Tile);

Space.prototype.onClick = function (evt) {
  if (selected) {
    socket.send({move: {id: selected.id, x: this.gx, y: this.gy}});
    selected.deselect();
  }
};

function Piece(x, y, colorCode) {
  if (pieces.hasOwnProperty(colorCode)) {
    pieces[colorCode].moveTo(x, y);
    return pieces[colorCode];
  }
  Tile.call(this, x, y, colorCode);
  this.id = colorCode;
  pieces[colorCode] = this;
}
inherits(Piece, Tile);

Piece.prototype.renderDiv = function () {
  var div = Tile.prototype.renderDiv.apply(this, arguments);
  var child = document.createElement('div');
  this.child = child;
  child.style.display = "none";
  div.appendChild(child);
  return div;
};

Piece.prototype.select = function () {
  if (selected) {
    selected.deselect();
  }
  selected = this;
  this.child.style.display = "block";
};

Piece.prototype.deselect = function () {
  if (selected === this) {
    selected = null;
  }
  this.child.style.display = "none";
};

Piece.prototype.onClick = Piece.prototype.select;

Piece.prototype.destroy = function () {
  if (selected === this) {
    selected = null;
  }
  delete pieces[this.id];
  Tile.prototype.destroy.call(this);
};
var zIndex = 1000;
Piece.prototype.moveTo = function () {
  this.div.style.zIndex = zIndex ++;
  Sprite.prototype.moveTo.apply(this, arguments);
};


var Commands = {
  map: function (map) {
    Object.keys(map).forEach(function (id) {
      var params = map[id];
      var piece = new Piece(params.x, params.y, id);
    });
  },
  move: function (params) {
    if (selected && params.id === selected.id) {
      selected.deselect();
    }
    pieces[params.id].moveTo(params.x, params.y);
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
for (var x = 0; x < 5; x++) {
  for (var y = 0; y < (6 + x % 2); y++) {
    new Space(x, y);
  }
}
