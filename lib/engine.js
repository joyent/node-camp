/*global window document PalmSystem */

function Engine(containerId, setup) {

  var sprites = [],
      container;

/////////////////////////////////////////////////////////////////////////////

  function Sprite(x, y, r, img) {
    this.x = x || 0;
    this.y = y || 0;
    this.r = r || 0;
    this.img = img;
    this.div = undefined;
  }

  // Add a sprite to the dom and the animation list
  Sprite.prototype.show = function () {
    var div = this.div = document.createElement('div');
    div.setAttribute('class', this.img);
    container.appendChild(div);
    sprites.push(this);
    this.update();
  };

  // Remove a sprite from the dom and the animation list
  Sprite.prototype.hide = function () {
    container.removeChild(this.div);
    this.div = undefined;
    sprites.splice(sprites.indexOf(this), 1);
  };

  // Update the Sprite's location for them.
  // Units are in pixels per second
  Sprite.prototype.move = function (delta) {
    this.x += this.mx * delta / 1000;
    this.y += this.my * delta / 1000;
  };

  // Hook for custom logic
  Sprite.prototype.animate = function (delta) { };

  // Move the sprite to it's new location
  Sprite.prototype.update = function () {
    if (this.x === this.ox && this.y === this.oy && this.r === this.or) {
      return;
    }
    var transform =
      'translate3d(' + this.x + 'px,' + this.y + 'px,0) ' +
      'rotate(' + this.r + 'deg)';
    this.ox = this.x;
    this.oy = this.y;
    this.or = this.r;
    this.div.style.webkitTransform = transform;
  };

/////////////////////////////////////////////////////////////////////////////

  var listeners = {},
      engine;
  engine = {
    Sprite: Sprite,
    sprites: sprites,
    addListener: function (type, listener) {
      if (!listeners.hasOwnProperty(type)) {
        listeners[type] = [];
      }
      listeners[type].push(listener);
    },
    removeListener: function (type, listener) {
      var list = listeners[type];
      list.splice(list.indexOf(listener), 1);
    },
    emit: function (type/* args */) {
      var list = listeners[type],
          args = Array.prototype.slice.call(arguments, 1);
      if (!list) {
        if (type === 'error') {
          throw args[0];
        }
        return;
      }
      list.forEach(function (listener) {
        listener.apply(this, args);
      }, this);
    }
  };
  engine.on = engine.addListener;

/////////////////////////////////////////////////////////////////////////////

  function onDown(e) {
    engine.emit('down', e);
  }
  function onMove(e) {
    engine.emit('move', e);
  }
  function onUp(e) {
    engine.emit('up', e);
  }

  // Initialize the game on window load
  window.onload = function () {

    container = document.getElementById(containerId);
    // Start the animation loop
    var old = Date.now();
    setInterval(function () {
      var now = Date.now(),
          delta = now - old;
      engine.emit('animate', delta);
      sprites.forEach(function (sprite) {
        sprite.move(delta);
        sprite.animate(delta);
      });
      sprites.forEach(function (sprite) {
        sprite.update();
      });
      old = now;
    }, 33);

    // Listen for mouse and touch events
    var element = document.body;
    element.addEventListener('mousedown', onDown, false);
    element.addEventListener('mousemove', onMove, false);
    element.addEventListener('mouseup', onUp, false);
    element.addEventListener('touchstart', function (e) {
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
    element.addEventListener('touchmove', function (e) {
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
    element.addEventListener('touchend', onUp, false);

    setup(engine);

    // Start the palm system if we're in a webOS app
    if (typeof PalmSystem !== 'undefined') {
      PalmSystem.stageReady();
      if (PalmSystem.enableFullScreenMode) {
        PalmSystem.enableFullScreenMode(true);
      }
    }

  };

  // Move this to the end since jslint hates it
  Sprite.adopt = function (child) {
    child.__proto__ = this;
    child.prototype.__proto__ = this.prototype;
  };

}
