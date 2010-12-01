var WIDTH = 320;
var HEIGHT = 320;
var x = WIDTH / 2;
var y = HEIGHT / 2;
var offset = 0;

window.onload = function () {

  // Create our canvas to draw on
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext("2d");

  clock(ctx);
  setInterval(function () {
      clock(ctx);
  }, 1000);

  window.Mojo = {
    screenOrientationChanged: function screenOrientationChanged(orientation) {
      switch (orientation) {
        case "up": offset = 0; break;
        case "left": offset = Math.PI / 2; break;
        case "down": offset = Math.PI; break;
        case "right": offset = Math.PI * 1.5; break;
      }
      clock(ctx);
      PalmSystem.playSoundNotification("vibrate");
    }
  };


  // Start the palm system
  if (typeof PalmSystem !== 'undefined') {
    PalmSystem.stageReady();
    if (PalmSystem.enableFullScreenMode) {
      console.log("About to set FullScreenMode");
      PalmSystem.enableFullScreenMode(true);
      console.log("Just set FullScreenMode");
    }

  }

}

