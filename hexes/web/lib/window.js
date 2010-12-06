/*global window PalmSystem io Commands*/

// Start the palm system if we're in a webOS app
if (typeof PalmSystem !== 'undefined') {
  window.addEventListener('load', function () {
    PalmSystem.stageReady();
    if (PalmSystem.enableFullScreenMode) {
      PalmSystem.enableFullScreenMode(true);
    }
  }, true);
}

if (!Object.hasOwnProperty('create')) {
  var Fn = function () {};
  Object.create = function (parent) {
    Fn.prototype = parent;
    return new Fn();
  };
}

// Set up a socket.io channel with the backend server
var socket;
if (typeof PalmSystem !== 'undefined') {
  // webOS apps are special since the static files don't come from the serveri
  socket = new io.Socket("creationix.com", {
    port: 8080,
    transports: ['xhr-polling']
  });
} else {
  socket = new io.Socket();
}

window.addEventListener('load', function () {

  setTimeout(function () {
    socket.connect();
  }, 100);
  var flail = true;
  setInterval(function () {
    if (flail) {
      socket.connect();
    }
  }, 10000);
  socket.on('connect', function () {
    flail = false;
  });
  socket.on('disconnect', function () {
    flail = true;
  });
});

// Super small OOP library for easy inheritance
function inherits(child, parent) {
  child.prototype = Object.create(parent.prototype);
  child.prototype.constructor = child;
  child.parent = parent;
}


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
