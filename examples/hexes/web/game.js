window.addEventListener('load', function () {
  // Start the palm system if we're in a webOS app
  if (typeof PalmSystem !== 'undefined') {
    PalmSystem.stageReady();
    if (PalmSystem.enableFullScreenMode) {
      PalmSystem.enableFullScreenMode(true);
    }
  }
}, false);
