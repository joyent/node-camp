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
      'translate3d(' + this.x + 'px, ' + this.y + 'px, 0) ' +
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

/////////////////////////////////////////////////////////////////////////////

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
    }, 30);

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
