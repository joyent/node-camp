/*global document window*/

function Sprite(x, y, className) {
  var div = this.div = document.createElement('div');
  div.sprite = this;
  div.setAttribute('class', className);
  this.setTransform(x, y);
  if (Sprite.container) {
    Sprite.container.appendChild(div);
  } else {
    Sprite.pending.push(div);
  }
}
Sprite.pending = [];

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
}

window.addEventListener('load', function () {

  // Find the container and append any pending divs
  var container = Sprite.container = document.getElementById('sprites');
  Sprite.pending.forEach(function (div) {
    container.appendChild(div);
  });
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

