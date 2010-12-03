/*global window PalmSystem*/

// Start the palm system if we're in a webOS app
if (typeof PalmSystem !== 'undefined') {
  window.addEventListener('load', function () {
    PalmSystem.stageReady();
    if (PalmSystem.enableFullScreenMode) {
      PalmSystem.enableFullScreenMode(true);
    }
  }, true);
}

