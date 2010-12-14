/*global PalmSystem io */

// Set up a socket.io channel with the backend server
var socket, // socket.io connection with server
    Commands, // Local commands the server can send us
    container; // The HTML container for all the Sprites

// Number to color lookup table.
// The backend sends numbers, the css expects strings.
var colors = ['space', 'red', 'brown', 'purple', 'blue', 'orange', 
              'green', 'yellow'];

var selected, // The currently selected piece (if any)
    pieces = {}, // Index of all pieces for easy reference
    zIndex = 1000; // Used to make moving divs always on top.

///////////////////////////////////////////////////////////////////////////////
//                  Constructors and Prototypes (Classes)                    //
///////////////////////////////////////////////////////////////////////////////

// Tile - shared parent for Piece and Space
function Tile(x, y, colorCode) {
  this.renderDiv(colors[colorCode]);
  this.setTransform(x, y);
}
Tile.prototype.renderDiv = function (className) {
  var div = this.div = document.createElement('div');
  div.setAttribute('class', className);
  div.sprite = this;
  container.appendChild(div);
  return div;
};
// Move the sprite to a specified offset using hardware accel.
Tile.prototype.setTransform = function (x, y) {
  this.x = x;
  this.y = y;
  var px = x * 55 + 10,
      py = 47 + y * 64 - (x % 2) * 32;
  this.div.style.webkitTransform = "translate3d(" + px + "px, " + py + "px, 0)";
};
Tile.prototype.destroy = function () {
  container.removeChild(this.div);
};

// Super minimal OOP inheritance library
Tile.adopt = function (child) {
  child.__proto__ = this;
  child.prototype.__proto__ = this.prototype;
  child.parent = this;
};

///////////////////////////////////////////////////////////////////////////////
// Space - grid spaces on the board
function Space(x, y) {
  Tile.call(this, x, y, 0);
}
Tile.adopt(Space);
Space.prototype.onClick = function (evt) {
  if (selected) {
    socket.send({move: {id: selected.id, x: this.x, y: this.y}});
    selected.deselect();
  }
};


///////////////////////////////////////////////////////////////////////////////
// Piece - moving, colored hexagon piece
function Piece(x, y, colorCode) {
  // If this piece already exists, then reuse it and move
  // to the new location.
  if (pieces.hasOwnProperty(colorCode)) {
    pieces[colorCode].moveTo(x, y);
    return pieces[colorCode];
  }
  // Create a new Piece and put in the index
  Tile.call(this, x, y, colorCode);
  // In this simple I'm using the colorCode as the ID, in a real game these
  // probably need to be separate
  this.id = colorCode;
  pieces[colorCode] = this;
}
Tile.adopt(Piece); // Piece inherits from Tile
Piece.prototype.renderDiv = function () {
  var div = Piece.parent.prototype.renderDiv.apply(this, arguments);
  var child = document.createElement('div');
  this.child = child;
  child.style.display = "none";
  div.appendChild(child);
  return div;
};
// Move the piece, but animate over a time lapse
Piece.prototype.moveTo = function (x, y, time) {
  time = time || 1;
  this.div.style.zIndex = zIndex++;
  this.div.style.webkitTransitionDuration = time + "s";
  this.setTransform(x, y);
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

///////////////////////////////////////////////////////////////////////////////
//                           External API Commands                           //
///////////////////////////////////////////////////////////////////////////////
Commands = {
  reload: function () {
    window.location.reload();
  },
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
    var piece = pieces[params.id];
    var distance = Math.sqrt((piece.x - params.x) * (piece.x - params.x) +
                             (piece.y - params.y) * (piece.y - params.y));
    piece.moveTo(params.x, params.y, distance / 5);
  }
};


///////////////////////////////////////////////////////////////////////////////
//                           Initialization of window                        //
///////////////////////////////////////////////////////////////////////////////
window.addEventListener('load', function () {

  // Connect to the backend server for duplex communication
  if (window.location.protocol === 'file:') {
    socket = new io.Socket("creationix.com", {
      port: 8080,
      transports: ['xhr-polling']
    });
  } else {
    socket = new io.Socket();
  }
  var flail = true;
  function tryConnect() {
    if (flail) {
      socket.connect();
    }
  }
  setTimeout(tryConnect);
  setInterval(tryConnect, 10000);
  socket.on('connect', function () {
    flail = false;
  });
  socket.on('disconnect', function () {
    console.error("Got disconnected from server!");
    flail = true;
  });

  // Forward messages from the backend to the Commands object in the client
  socket.on('message', function (message) {
    Object.keys(message).forEach(function (command) {
      if (Commands.hasOwnProperty(command)) {
        Commands[command](message[command]);
      } else {
        console.error("Invalid command " + command);
      }
    });
  });

  // Store a reference to the container div in the dom
  container = document.getElementById('sprites');

  // Always fit the sprite container to the window and even auto-rotate
  var width = container.clientWidth,
      height = container.clientHeight;
  function onResize() {
    var winWidth = window.innerWidth,
        winHeight = window.innerHeight;
    var vertical = (height > width) === (winHeight > winWidth);
    var transform;
    if (vertical) {
      transform = "scale(" + 
        Math.min(winWidth / width, winHeight / height) + ")";
    } else {
      transform = "scale(" + 
        Math.min(winWidth / height, winHeight / width) + ") rotate(-90deg)";
    }
    container.style.webkitTransform = transform;
  }
  window.addEventListener('resize', onResize);
  onResize();

  // Hook up mouse(down, move, up) and touch(down, move, up) to sprites
  function findSprite(target) {
    if (target === container) {
      return;
    }
    if (target.sprite) {
      return target.sprite;
    }
    if (!target.parentNode) {
      return;
    }
    return findSprite(target.parentNode);
  }
  var start;
  // Listen for mouse and touch events
  function onDown(evt) {
    start = findSprite(evt.target);
    if (!start) {
      return;
    }
    evt.stopPropagation();
    evt.preventDefault();
    if (start.onDown) {
      start.onDown(evt);
    }
  }
  function onMove(evt) {
    if (!start) {
      return;
    }
    evt.stopPropagation();
    evt.preventDefault();
    if (start.onMove) {
      start.onMove(evt);
    }
  }
  function onUp(evt) {
    if (!start) {
      return;
    }
    evt.stopPropagation();
    evt.preventDefault();
    if (start.onUp) {
      start.onUp(evt);
    } else if (start.onClick) {
      var end = findSprite(evt.target);
      if (start === end) {
        start.onClick(evt);
      }
    }
    start = undefined;
  }
  container.addEventListener('mousedown', onDown, false);
  document.addEventListener('mousemove', onMove, false);
  document.addEventListener('mouseup', onUp, false);
  container.addEventListener('touchstart', function (e) {
    if (e.touches.length === 1) {
      var touch = e.touches[0];
      touch.stopPropagation = function () {
        e.stopPropagation();
      };
      touch.preventDefault = function () {
        e.preventDefault();
      };
      onDown(touch);
    }
  }, false);
  document.addEventListener('touchmove', function (e) {
    if (e.touches.length === 1) {
      var touch = e.touches[0];
      touch.stopPropagation = function () {
        e.stopPropagation();
      };
      touch.preventDefault = function () {
        e.preventDefault();
      };
      onMove(touch);
    }
  }, false);
  document.addEventListener('touchend', onUp, false);

  // Draw the board on load
  for (var x = 0; x < 5; x++) {
    for (var y = 0; y < (6 + x % 2); y++) {
      new Space(x, y);
    }
  }

  // Start the palm system if we're in a webOS app
  if (typeof PalmSystem !== 'undefined') {
    PalmSystem.stageReady();
    if (PalmSystem.enableFullScreenMode) {
      PalmSystem.enableFullScreenMode(true);
    }
  }

}, false);
