/*global window document PalmSystem */

function Engine(setup) {

  var spriteHolder;

/////////////////////////////////////////////////////////////////////////////

  function Sprite(x, y, img) {
    this.x = x;
    this.y = y;
    this.r = 0;
    this.img = img;
    this.div = undefined;
  }

  Sprite.sprites = [];

  // Add a sprite to the dom and the animation list
  Sprite.prototype.show = function () {
    var div = this.div = document.createElement('div');
    div.setAttribute('class', this.img);
    this.update();
    spriteHolder.appendChild(div);
    Sprite.sprites.push(this);
  };

  // Remove a sprite from the dom and the animation list
  Sprite.prototype.hide = function () {
    spriteHolder.removeChild(this.div);
    this.div = undefined;
    Sprite.sprites.splice(Sprite.sprites.indexOf(this), 1);
  };

  // Update the Sprite's location for them. 
  Sprite.prototype.move = function (delta) {
    this.x += this.mx * delta / 2048;
    this.y += this.my * delta / 2048;
  };

  // Hook for custom logic
  Sprite.prototype.animate = function (delta) { };

  // Move the sprite to it's new location
  Sprite.prototype.update = function () {
    if (this.x === this.ox && this.y === this.oy && this.r === this.or) {
      return;
    }
    var transform = '-webkit-transform:' +
      'translate3d(' + this.x + 'px, ' + this.y + 'px, 0) ' +
      'rotate(' + this.r + 'deg);';
    this.ox = this.x;
    this.oy = this.y;
    this.or = this.r;
    this.div.setAttribute('style', transform); 
  };

/////////////////////////////////////////////////////////////////////////////

  // Initialize the game on window load
  window.onload = function () {

    // Setup the html
    spriteHolder = document.createElement('div');
    spriteHolder.setAttribute('id', 'sprites');
    setup(Sprite);
    document.body.appendChild(spriteHolder);

    // Start the animation loop
    var old = Date.now();
    setInterval(function () {
      var now = Date.now(),
          delta = now - old;
      
      Sprite.sprites.forEach(function (sprite) {
        sprite.move(delta);
        sprite.animate(delta);
      });
      Sprite.sprites.forEach(function (sprite) {
        sprite.update();
      });
      old = now;
    }, 30);

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
  }
}

