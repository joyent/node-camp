/*global Engine document window*/

Engine('sprites', function (engine) {
  var Sprite = engine.Sprite;
  var colors = ['green', 'blue', 'brown', 'white', 'yellow', 'orange',
                'purple', 'red', 'grey'];
  // Grid used for quick collision detection
  var ballGrid = {};

  // Watch the height of the window.
  var width, height;
  function onResize() {
    width = document.width - 48;
    height = document.height - 48;
  }
  onResize();

  var angleToRadian = Math.PI / 180;

  function Igniter(x, y, color) {
    Sprite.call(this, x, y, 0, color);
    this.life = 1000;
  }
  Igniter.prototype.animate = function (delta) {
    this.life -= delta;
    this.r += delta / 300;
    explode({
      clientX: this.x + 24,
      clientY: this.y + 24
    });
    if (this.life < 0) {
      this.hide();
    }
  };
  Sprite.adopt(Igniter);

    

  function Spark(x, y, angle) {
    Sprite.call(this, x, y, angle, 'dart');
    angle *= angleToRadian;
    this.mx = Math.sin(angle) * 300;
    this.my = -Math.cos(angle) * 300;
    this.life = 1000;
  }
  Spark.prototype.animate = function (delta) {
    this.life -= delta;
    this.x += this.mx * delta / 1000;
    this.y += this.my * delta / 1000;
    this.checkCollisions(ballGrid, 40);
    if (this.life < 0 ||
        this.x < -48 || this.y < -48 ||
        this.x > width + 48 || this.y > height + 48) {
      this.hide();
    }
  };
  Spark.prototype.checkCollisions = function (grid, distance) {
    var cx = Math.floor(this.x / 48);
    var cy = Math.floor(this.y / 48);
    var self = this;
    function checkBall(ball) {
      var d = Math.sqrt((ball.x - self.x) * (ball.x - self.x) +
                        (ball.y - self.y) * (ball.y - self.y));
      if (d <= distance) {
        ball.mx += self.mx / 15;
        ball.my += self.my / 15;
        self.life = -1;
      }

    }
    for (var gx = cx - 1; gx <= cx + 1; gx++) {
      for (var gy = cy - 1; gy <= cy + 2; gy++) {
        var key = gx + "," + gy;
        if (grid.hasOwnProperty(key)) {
          grid[key].forEach(checkBall);
        }
      }
    }
  };
  Sprite.adopt(Spark);

  function Ball(x, y, angle) {
    var n = Math.floor(angle / 360 * colors.length);
    Sprite.call(this, x, y, 0, colors[n]);
    this.mx = 0;
    this.my = 0;
    this.show();
    this.updateGrid();
  }
  Ball.prototype.hide = function () {
    Sprite.prototype.hide.call(this);
    this.updateGrid();
  };
  Ball.prototype.updateGrid = function () {
    // Remove the old entry in the collision grid
    if (this.gx !== undefined) {
      var list = ballGrid[this.gx + "," + this.gy];
      list.splice(list.indexOf(this), 1);
    }
    if (!this.div) {
      return;
    }
    var gx = this.gx = Math.floor(this.x / 48);
    var gy = this.gy = Math.floor(this.y / 48);
    var key = gx + "," + gy;
    if (!ballGrid.hasOwnProperty(key)) {
      ballGrid[key] = [];
    }
    ballGrid[key].push(this);
  };
  Ball.prototype.animate = function (delta) {
    this.x += this.mx * delta / 1000;
    this.y += this.my * delta / 1000;
    if (this.mx || this.my) {
      this.updateGrid();
    }
    if (this.x < 0) {
      this.x *= -1;
      this.mx *= -1;
      this.checkBounce();
    } else if (this.x > width) {
      this.x = 2 * width - this.x;
      this.mx *= -1;
      this.checkBounce();
    }
    if (this.y < 0) {
      this.y *= -1;
      this.my *= -1;
      this.checkBounce();
    } else if (this.y > height) {
      this.y = 2 * height - this.y;
      this.my *= -1;
      this.checkBounce();
    }
  };
  Ball.prototype.checkBounce = function () {
    var speed = Math.sqrt(this.mx * this.mx + this.my * this.my);
    if (speed > 400) {
      this.hide();
      (new Igniter(this.x, this.y, this.img)).show();
    }

  };
  Sprite.adopt(Ball);

  // Create a few balls on the screen
  for (var i = 1; i < 360; i += 12) {
    var rad = i * angleToRadian;
    var ball = new Ball(
      width / 2 + Math.sin(rad) * 100,
      height / 2 + Math.cos(rad) * 100,
      i
    );
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
    start = (start + 19) % 48;
    for (var i = start; i < 360; i += 48) {
      (new Spark(evt.clientX - 24, evt.clientY - 24, i)).show();
    }
  }
  var fpsDiv = document.getElementById('fps');
  engine.on('animate', function (delta) {
    if (!engine.sprites.length) {
      explode({
        clientX: width / 2 + 24,
        clientY: height / 2 + 24
      });
    }
    fpsDiv.innerText = (Math.floor(1000 / delta) / 1) + " fps";
    if (fire) {
      explode(fire);
      fire = false;
    }
  });

});
