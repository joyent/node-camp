/*global window document */


if (!Object.hasOwnProperty('keys')) {
  Object.keys = function (obj) {
    var keys = [];
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        keys.push(key);
      }
    }
    return keys;
  };
}

function Engine(setup) {

  var spriteHolder, sprites = [];
  
  function transformStringMoz(x, y, r) {
    return '-moz-transform:' +
      'translate(' + Math.floor(x) + 'px, ' + Math.floor(y) + 'px) ' +
      'rotate(' + r + 'deg)';
  }

  function transformString(x, y, r) {
    return '-webkit-transform:' +
      'translate3d(' + Math.floor(x) + 'px, ' + Math.floor(y) + 'px, 0) ' +
      'rotate(' + r + 'deg);';
  }

/////////////////////////////////////////////////////////////////////////////

  function Sprite(x, y, img) {
    this.x = x;
    this.y = y;
    this.r = 0;
    this.img = img;
    this.div = undefined;
  }

  // Add a sprite to the dom and the animation list
  Sprite.prototype.show = function () {
    var div = this.div = document.createElement('div');
    div.setAttribute('class', this.img);
    this.update();
    spriteHolder.appendChild(div);
    sprites.push(this);
  };

  // Remove a sprite from the dom and the animation list
  Sprite.prototype.hide = function () {
    spriteHolder.removeChild(this.div);
    this.div = undefined;
    sprites.splice(sprites.indexOf(this), 1);
  };

  Sprite.prototype.update = function () {
    this.div.setAttribute('style', transformString(this.x, this.y, this.r)); 
  };

  // This is a hook to put per-frame animation logic
  Sprite.prototype.animate = function (delta) {
    this.x += this.mx * delta / 2048;
    this.y += this.my * delta / 2048;
  };

  Sprite.adopt = function (child) {
    child.__proto__ = this;
    child.prototype.__proto__ = this.prototype;
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
      
      sprites.forEach(function (sprite) {
        sprite.animate(delta);
      });
      sprites.forEach(function (sprite) {
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

}

