/*global Sprite io*/

var colors = ['space', 'red', 'brown', 'purple', 'blue', 'orange', 
              'green', 'yellow'];

var socket = new io.Socket("localhost", {port: 8080}); 
socket.on('connect', function () {
  socket.send({hi: true});
});

// Singleton selection sprite
var selection;
function Selection(piece) {
  if (selection) {
    selection.destroy();
  }
  selection = this;
  Sprite.call(this, piece.x, piece.y, 'highlight');
  this.piece = piece;
}
// Hook into destroy to remove reference from selection
Selection.prototype.destroy = function () {
  Sprite.prototype.destroy.call(this);
  selection = null;
};
// Destroy on click
Selection.prototype.onClick = Selection.prototype.destroy;

function Tile(x, y, colorCode) {
  Sprite.call(this, x, y, colors[colorCode]);
}
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

Space.prototype.onClick = function (evt) {
  if (selection) {
    socket.send({move: {id: selection.piece.id, x: this.gx, y: this.gy}});
    selection.destroy();
  }
};

function Piece(x, y, colorCode) {
  Tile.call(this, x, y, colorCode);
  this.id = colorCode;
}

Piece.prototype.onClick = function (evt) {
  new Selection(this);
};

// Set up inheritance
Space.prototype.__proto__ = Tile.prototype;
Piece.prototype.__proto__ = Tile.prototype;
Tile.prototype.__proto__ = Sprite.prototype;
Selection.prototype.__proto__ = Sprite.prototype;

for (var x = 0; x < 5; x++) {
  for (var y = 0; y < (6 + x % 2); y++) {
    new Space(x, y);
  }
}
new Piece(1, 0, 1);
new Piece(3, 1, 2);
new Piece(1, 2, 3);
