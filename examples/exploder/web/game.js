/*global Engine document window*/

Engine('sprites', function (engine) {
  var Sprite = engine.Sprite;
  var colors = ['green', 'blue', 'brown', 'white', 'yellow', 'orange',
                'purple', 'red', 'grey'];

  var width, height;
  function onResize() {
    width = document.width - 48;
    height = document.height - 48;
  }
  onResize();

  var angleToRadian = Math.PI / 180;

  function Spark(x, y, angle) {
    Sprite.call(this, x, y, angle, 'dart');
    angle *= angleToRadian;
    this.mx = Math.sin(angle) * 200;
    this.my = -Math.cos(angle) * 200;
    this.life = 2000;
  }
  Spark.prototype.animate = function (delta) {
    this.life -= delta;
    if (this.life < 0 ||
        this.x < -48 || this.y < -48 ||
        this.x > width + 48 || this.y > height + 48) {
      this.hide();
    }
  };
  Sprite.adopt(Spark);

  function Ball(x, y, angle) {
    var n = Math.floor(angle / 360 * colors.length);
    Sprite.call(this, x, y, 0, colors[n]);
    angle *= angleToRadian;
    this.mx = Math.sin(angle) * 100;
    this.my = -Math.cos(angle) * 100;
  }
  Ball.prototype.animate = function (delta) {
    if (this.x < 0) {
      this.x *= -1;
      this.mx *= -1;
    } else if (this.x > width) {
      this.x = 2 * width - this.x;
      this.mx *= -1;
    }
    if (this.y < 0) {
      this.y *= -1;
      this.my *= -1;
    } else if (this.y > height) {
      this.y = 2 * height - this.y;
      this.my *= -1;
    }
  };
  Sprite.adopt(Ball);

  // Create a few balls on the screen
  for (var i = 1; i < 360; i += 12) {
    (new Ball(
      Math.floor(width / 2),
      Math.floor(height / 2),
      i
    )).show();
  }
  window.addEventListener('resize', onResize, true);

  var down = false;
  var fire = false;
  var start = 0;

  engine.on('down', function (evt) {
    down = true;
    evt.stopPropagation();
    evt.preventDefault();
  });
  engine.on('move', function (evt) {
    if (!down) {
      return;
    }
    fire = evt;
    evt.stopPropagation();
    evt.preventDefault();
  });
  engine.on('up', function (evt) {
    down = false;
    evt.stopPropagation();
    evt.preventDefault();
  });

  function explode(evt) {
    start = (start + 11) % 36;
    for (var i = start; i < 360; i += 36) {
      (new Spark(evt.clientX - 24, evt.clientY - 24, i)).show();
    }
  }
  engine.on('animate', function (delta) {
    if (fire) {
      explode(fire);
      fire = false;
    }
  });

});
