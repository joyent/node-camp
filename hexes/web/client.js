/*global document window PalmSystem io Commands*/

function Sprite(x, y, className) {
  var div = this.renderDiv(className);
  div.sprite = this;
  this.setTransform(x, y);
  if (Sprite.container) {
    Sprite.container.appendChild(div);
  } else {
    Sprite.pending.push(div);
  }
}
Sprite.pending = [];

Sprite.prototype.renderDiv = function (className) {
  var div = this.div = document.createElement('div');
  div.setAttribute('class', className);
  return div;
};

// Move the sprite to a specified offset using hardware accel.
Sprite.prototype.setTransform = function (x, y) {
  this.x = x;
  this.y = y;
  this.div.style.webkitTransform = "translate3d(" + x + "px, " + y + "px, 0)";
};

// Move the sprite, but animate over a time lapse
Sprite.prototype.moveTo = function (x, y, time) {
  time = time || 1;
  this.div.style.webkitTransitionDuration = time + "s";
  this.setTransform(x, y);
};

Sprite.prototype.destroy = function () {
  if (Sprite.container) {
    Sprite.container.removeChild(this.div);
  } else {
    Sprite.pending.splice(Sprite.pending.indexOf(this.div), 1);
  }
};

window.addEventListener('load', function () {

  // Find the container and append any pending divs
  var container = Sprite.container = document.getElementById('sprites');
  Sprite.pending.forEach(function (div) {
    container.appendChild(div);
  });
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

  delete Sprite.pending;

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
  var a;
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

});


// Start the palm system if we're in a webOS app
if (typeof PalmSystem !== 'undefined') {
  window.addEventListener('load', function () {
    PalmSystem.stageReady();
    if (PalmSystem.enableFullScreenMode) {
      PalmSystem.enableFullScreenMode(true);
    }
  }, true);
}

// Define Object.create if the browser doesn't have it already
if (!Object.hasOwnProperty('create')) {
  (function () {
    function F() {}
    Object.create = function (parent) {
      F.prototype = parent;
      return new F();
    };
  }());
}



// Set up a socket.io channel with the backend server
var socket;
if (typeof PalmSystem !== 'undefined') {
  // webOS apps are special since the static files don't come from the server
  socket = new io.Socket("creationix.com", {
    port: 8080,
    transports: ['xhr-polling']
  });
} else {
  socket = new io.Socket();
}

window.addEventListener('load', function () {

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
});

// Super small OOP library for easy inheritance
function inherits(child, parent) {
  child.prototype = Object.create(parent.prototype);
  child.prototype.constructor = child;
  child.parent = parent;
}

// Forward messages from the backend to the Commands object in the client
socket.on('message', function (message) {
  //console.log(message);
  if (!Commands) {
    return;
  }
  Object.keys(message).forEach(function (command) {
    if (Commands.hasOwnProperty(command)) {
      Commands[command](message[command]);
    } else {
      console.error("Invalid command " + command);
    }
  });
});
/*global document Sprite socket inherits*/

var colors = ['space', 'red', 'brown', 'purple', 'blue', 'orange', 
              'green', 'yellow'];

var selected;
var pieces = {};
var zIndex = 1000;

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
Piece.prototype.moveTo = function () {
  this.div.style.zIndex = zIndex++;
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

for (var x = 0; x < 5; x++) {
  for (var y = 0; y < (6 + x % 2); y++) {
    new Space(x, y);
  }
}
