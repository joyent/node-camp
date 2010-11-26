/*global window document Engine*/

Engine('map', function (engine) {

  var Sprite = engine.Sprite;
  // Deep Copy for nested arrays
  function deepCopy(array) {
    return array.map(function (part) {
      if (typeof part === 'object') {
        return deepCopy(part);
      }
      return part;
    });
  }

  // Takes a grid and returns an optimal set of rectangles that fills that grid
  function rectify(grid) {
    var rects = {};
    function findRect1(x, y) {
      var sx = x, sy = y, ex = x, ey = y;
      while (grid[sy - 1] && grid[sy - 1][x]) {
        sy--;
      }
      while (grid[ey + 1] && grid[ey + 1][x]) {
        ey++;
      }
      var good = true;
      var ty;
      while (good) {
        for (ty = sy; ty < ey + 1; ty++) {
          if (!grid[ty][sx - 1]) {
            good = false;
            break;
          }
        }
        if (good) {
          sx--;
        }
      }
      good = true;
      while (good) {
        for (ty = sy; ty < ey + 1; ty++) {
          if (!grid[ty][ex + 1]) {
            good = false;
            break;
          }
        }
        if (good) {
          ex++;
        }
      }
      return {
        x: sx,
        y: sy,
        w: ex - sx + 1,
        h: ey - sy + 1
      };
    }
    function findRect2(x, y) {
      var sx = x, sy = y, ex = x, ey = y;
      while (grid[y][sx - 1]) {
        sx--;
      }
      while (grid[y][ex + 1]) {
        ex++;
      }
      var good = true;
      var tx;
      while (good) {
        for (tx = sx; tx < ex + 1; tx++) {
          if (!(grid[sy - 1] && grid[sy - 1][tx])) {
            good = false;
            break;
          }
        }
        if (good) {
          sy--;
        }
      }
      good = true;
      while (good) {
        for (tx = sx; tx < ex + 1; tx++) {
          if (!(grid[ey + 1] && grid[ey + 1][tx])) {
            good = false;
            break;
          }
        }
        if (good) {
          ey++;
        }
      }
      return {
        x: sx,
        y: sy,
        w: ex - sx + 1,
        h: ey - sy + 1
      };
    }
    
    for (var y = 0, l1 = grid.length; y < l1; y++) {
      for (var x = 0, l2 = grid[y].length; x < l2; x++) {
        if (grid[y][x]) {
          rects[JSON.stringify(findRect1(x, y))] = true;
          rects[JSON.stringify(findRect2(x, y))] = true;
        }
      }
    }
    // TODO: Remove redundant rectangles
    return Object.keys(rects).map(function (json) {
      return JSON.parse(json);
    });
  }

  function Country(x, y, grid) {
    Sprite.call(this, x * 20, y * 20);
    this.grid = grid;
    this.owner = null;
    this.resource = null;
    this.city = false;
    this.stockpile = false;
    this.horse = false;
    this.weapon = false;
    this.boats = 0;
    this.gx = x;
    this.gy = y;
    this.mx = 100;
  }

  Country.prototype.renderDiv = function () {
    var div = this.div = document.createElement('div');
    var img = 'country';
    if (this.owner) {
      img += " " + this.owner.color;
    }
    div.setAttribute('class', img);
    this.renderLand();
    this.renderIcons();
    return div;
  };

  Country.prototype.renderLand = function () {
    var land = document.createElement('div');
    land.setAttribute('class', 'land');
    rectify(this.grid).forEach(function (rect) {
      var chunk = document.createElement('div');
      chunk.setAttribute('class', 'bordered');
      chunk.style.top = (rect.y * 20 + 1) + "px";
      chunk.style.left = (rect.x * 20 + 1) + "px";
      chunk.style.width = (rect.w * 20 - 6) + "px";
      chunk.style.height = (rect.h * 20 - 6) + "px";
      land.appendChild(chunk);
    });
    rectify(this.grid).forEach(function (rect) {
      var chunk = document.createElement('div');
      chunk.style.top = (rect.y * 20 + 3) + "px";
      chunk.style.left = (rect.x * 20 + 3) + "px";
      chunk.style.width = (rect.w * 20 - 6) + "px";
      chunk.style.height = (rect.h * 20 - 6) + "px";
      land.appendChild(chunk);
    });
    if (this.landDiv) {
      this.div.replaceChild(land, this.landDiv);
    } else {
      this.div.appendChild(land);
    }
    this.landDiv = land;
  };

  Country.prototype.renderIcons = function () {
    var icons = document.createElement('div');
    icons.setAttribute('class', 'icons');
    var self = this; 
    var clone = deepCopy(this.grid);
    var n = 0;
    function findSpace() {
      n++;
      if (n > 1000) { 
        return { x: 0, y: 0 };
      }
      var y = Math.floor(Math.random() * self.grid.length);
      var row = self.grid[y];
      var x = Math.floor(Math.random() * row.length);
      if (row[x]) {
        row[x] = 0;
        return {x: x, y: y};
      }
      return findSpace();
    }

/*
    Object.keys(this.props).forEach(function (type) {
      var pos = findSpace();
      var icon = document.createElement('div');
      icon.setAttribute('class', type);
      icon.style.top = (pos.y * 20) + "px";
      icon.style.left = (pos.x * 20) + "px";
      icons.appendChild(icon);
    });
    */

    if (this.iconsDiv) {
      this.div.replaceChild(icons, this.iconsDiv);
    } else {
      this.div.appendChild(icons);
    }
    this.iconsDiv = icons;
  };

  engine.Sprite.adopt(Country);

  function Player(name, color) {
    this.name = name;
    this.color = color;
  }

  var tim = new Player('Tim', 'blue');
  var jack = new Player('Jack', 'orange');
  var miranda = new Player('Miranda', 'purple');
  var lily = new Player('Lily', 'yellow');
  (new Country(0, 10, [
    [1, 1, 0, 1, 1],
    [1, 1, 1, 1, 1],
    [0, 1, 1, 1, 0]
  ])).show();
  (new Country(0, 12, [
    [1, 0],
    [1, 1],
    [1, 1],
    [1, 1],
    [1, 1],
    [1, 0]
  ])).show();
  (new Country(2, 14, [
    [1, 1, 1, 0],
    [1, 1, 1, 0],
    [0, 1, 1, 1],
    [0, 0, 1, 1]
  ])).show();
  (new Country(1, 2, [
    [0, 0, 0, 0, 1, 1],
    [0, 0, 0, 1, 1, 0],
    [1, 1, 1, 1, 0, 0],
    [0, 1, 1, 0, 0, 0],
    [0, 1, 0, 0, 0, 0]
  ])).show();
  (new Country(7, 0, [
    [0, 1, 1, 1, 0],
    [1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
  ])).show();
  (new Country(6, 3, [
    [1, 1, 1, 1, 0],
    [0, 0, 1, 1, 0],
    [0, 0, 1, 1, 1],
    [0, 0, 1, 1, 1]
  ])).show();
  (new Country(6, 6, [
    [0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1]
  ])).show();
  (new Country(14, 0, [
    [0, 1, 1, 0, 0, 0],
    [0, 1, 1, 1, 0, 0],
    [1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 1]
  ])).show();
  (new Country(17, 0, [
    [1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 0, 0, 0],
    [0, 1, 1, 0, 0, 0, 0]
  ], {
  })).show();
  (new Country(18, 1, [
    [0, 0, 0, 1, 1],
    [0, 0, 1, 1, 1],
    [0, 0, 1, 1, 0],
    [1, 1, 1, 0, 0]
  ])).show();
  (new Country(22, 0, [
    [0, 0, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 0],
    [0, 1, 1, 0, 0, 0],
    [1, 1, 1, 0, 0, 0],
    [0, 0, 1, 0, 0, 0]
  ])).show();
  (new Country(25, 2, [
    [1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 0, 0]
  ])).show();
  (new Country(27, 1, [
    [1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 1],
    [0, 0, 0, 0, 1, 1]
  ])).show();
  (new Country(28, 0, [
    [1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 1, 1]
  ])).show();
  (new Country(34, 4, [
    [1, 1, 0, 0],
    [1, 1, 1, 1],
    [1, 1, 1, 0],
    [1, 1, 1, 0]
  ])).show();
  (new Country(37, 4, [
    [0, 0, 1],
    [0, 0, 1],
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
    [0, 0, 1]
  ])).show();
  (new Country(35, 8, [
    [1, 1, 0, 0, 0],
    [1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1],
    [0, 0, 1, 1, 1],
    [0, 0, 0, 0, 1]
  ])).show();
  (new Country(33, 11, [
    [0, 0, 1, 1, 0],
    [1, 1, 1, 1, 1],
    [1, 1, 0, 0, 0],
    [1, 0, 0, 0, 0]
  ])).show();
  (new Country(35, 12, [
    [0, 0, 0, 1, 0],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [0, 0, 1, 1, 1],
    [0, 0, 0, 1, 0]
  ])).show();
  (new Country(37, 16, [
    [1, 0, 1],
    [1, 1, 1],
    [1, 1, 1],
    [0, 1, 1]
  ])).show();
  (new Country(33, 14, [
    [0, 1, 0, 0],
    [1, 1, 1, 1],
    [1, 1, 1, 0],
    [1, 1, 0, 0],
    [0, 1, 0, 0]
  ])).show();
  (new Country(19, 4, [
    [0, 0, 1, 0],
    [0, 0, 1, 0],
    [0, 1, 1, 0],
    [1, 1, 1, 0],
    [0, 1, 1, 0],
    [0, 1, 1, 1]
  ])).show();
  (new Country(22, 4, [
    [1, 1, 0],
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1]
  ])).show();
  (new Country(25, 5, [
    [1, 1, 1, 0, 0],
    [1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1],
    [0, 0, 0, 1, 1]
  ])).show();
  (new Country(28, 9, [
    [0, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 1, 1],
    [0, 0, 0, 0, 1]
  ])).show();
  (new Country(28, 11, [
    [0, 1, 1, 0, 0],
    [1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1]
  ])).show();
  (new Country(25, 13, [
    [0, 0, 1, 0, 0, 0],
    [0, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1]
  ])).show();
  (new Country(20, 12, [
    [0, 0, 0, 0, 0, 1],
    [1, 1, 0, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1, 0]
  ])).show();
  (new Country(15, 14, [
    [0, 0, 0, 1, 1, 0],
    [0, 0, 1, 1, 1, 1],
    [0, 1, 1, 1, 0, 1],
    [1, 1, 0, 0, 0, 0]
  ])).show();
  (new Country(12, 16, [
    [0, 1, 1, 1],
    [1, 1, 1, 0],
    [1, 1, 1, 0],
    [1, 0, 0, 0]
  ])).show();
  (new Country(13, 13, [
    [0, 0, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 0, 0]
  ])).show();
  (new Country(13, 8, [
    [0, 0, 1, 0],
    [1, 1, 1, 0],
    [0, 1, 1, 0],
    [0, 1, 1, 0],
    [0, 1, 1, 1],
    [0, 0, 1, 1]
  ])).show();
  (new Country(10, 13, [
    [0, 1, 1, 1, 1],
    [0, 0, 1, 0, 0],
    [1, 1, 1, 0, 0],
    [1, 1, 1, 0, 0]
  ])).show();
  (new Country(8, 13, [
    [1, 1, 1, 0],
    [1, 1, 1, 1],
    [1, 0, 0, 0],
    [1, 0, 0, 0],
    [1, 0, 0, 0],
    [1, 0, 0, 0]
  ])).show();

});
