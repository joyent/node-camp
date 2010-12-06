/*global window document Engine level*/

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
    Sprite.call(this, x * 24, y * 24);
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
    this.rects = rectify(grid);
  }

  Country.prototype.renderDiv = function () {
    var div = this.div = document.createElement('div');
    div.sprite = this;
    this.setOwner(this.owner);
    this.renderLand();
    this.renderIcons();
    return div;
  };

  Country.prototype.setOwner = function (owner) {
    this.owner = owner;
    var img = 'country';
    if (this.owner) {
      img += " " + this.owner.color;
    }
    this.div.setAttribute('class', img);
  };

  Country.prototype.setCity = function (city) {
    this.city = city;
    this.landDiv.setAttribute('class', 'land' + (city ? ' city' : ''));
  };
  Country.prototype.setWeapon = function (weapon) {
    this.weapon = weapon;
    this.renderIcons();
  };
  Country.prototype.setHorse = function (horse) {
    this.horse = horse;
    this.renderIcons();
  };
  Country.prototype.setStockpile = function (stockpile) {
    this.stockpile = stockpile;
    this.renderIcons();
  };


  Country.prototype.renderLand = function () {
    var land = document.createElement('div');
    land.setAttribute('class', 'land');
    this.rects.forEach(function (rect) {
      var chunk = document.createElement('div');
      chunk.setAttribute('class', 'bordered');
      chunk.style.top = (rect.y * 24 + 1) + "px";
      chunk.style.left = (rect.x * 24 + 1) + "px";
      chunk.style.width = (rect.w * 24 - 6) + "px";
      chunk.style.height = (rect.h * 24 - 6) + "px";
      land.appendChild(chunk);
    });
    this.rects.forEach(function (rect) {
      var chunk = document.createElement('div');
      chunk.style.top = (rect.y * 24 + 3) + "px";
      chunk.style.left = (rect.x * 24 + 3) + "px";
      chunk.style.width = (rect.w * 24 - 6) + "px";
      chunk.style.height = (rect.h * 24 - 6) + "px";
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
      var y = Math.floor(Math.random() * clone.length);
      var row = clone[y];
      var x = Math.floor(Math.random() * row.length);
      if (row[x]) {
        row[x] = 0;
        return {x: x, y: y};
      }
      return findSpace();
    }
    function addIcon(name) {
      var icon = document.createElement('div');
      icon.setAttribute('class', name);
      var pos = findSpace();
      icon.style.top = (pos.y * 24 + 2) + "px";
      icon.style.left = (pos.x * 24 + 2) + "px";
      icons.appendChild(icon);
    }
    if (this.resource) {
      addIcon(this.resource);
    }
    if (this.horse) {
      addIcon('horse');
    }
    if (this.weapon) {
      addIcon('weapon');
    }
    if (this.stockpile) {
      addIcon('stockpile');
    }


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

  var people = ['blue', 'brown', 'green', 'orange', 'purple', 'red', 'yellow'
  ].map(function (color) {
    return new Player(color, color);
  });
    
  var countries = level.map(function (data) {
    var country = new Country(data[0], data[1], data[2]);
    country.show();
    return country;
  });

  countries.choose = function () {
    return this[Math.floor(Math.random() * this.length)];
  };
  ['gold', 'gold', 'tree', 'tree', 'iron', 'iron',
   'coal', 'coal', 'pasture', 'pasture', 'pasture'
  ].forEach(function (resource) {
    var country = countries.choose();
    while (country.resource) {
      country = countries.choose();
    }
    country.resource = resource;
    country.renderIcons();
  });

  people.choose = countries.choose;


  function change(country) {
    var person = people.choose();
    if (country.owner === person) {
      switch (Math.floor(Math.random() * 4)) {
      case 0:
        country.setCity(true);
        break;
      case 1:
        country.setWeapon(true);
        break;
      case 2:
        country.setHorse(true);
        break;
      case 3:
        country.setStockpile(true);
        break;
      }
      country.setCity(true);
    } else {
      country.setOwner(person);
      country.setCity(false);
      country.setStockpile(false);
    }
  }

  engine.on('up', onClick);

  function onClick(evt) {
    var target = evt.target;
    while (!target.sprite) {
      console.log(target);
      target = target.parentNode;
      if (target === document) {
        return;
      }
    }
    change(target.sprite);
  }

//  setInterval(function () {
//    change(countries.choose());
//  }, 1000);

});
