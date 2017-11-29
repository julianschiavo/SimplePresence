if (require('../config.json').musicType == 'apple') {
  const {
    webFrame
  } = require('electron');
  const applescript = require('osascript-promise');
  const parse = require('parse-duration')
  const moment = require('moment')

  webFrame.setZoomLevelLimits(1, 1);

  var text = "textContent" in document.body ? "textContent" : "innerText";
  var oldID
  var openTimestamp

  async function setApple() {
    applescript(`tell application "iTunes"
    	             if player state is playing or player state is paused then
    	               set tname to (get name of the current track)
    	               set tdur to (get duration of the current track)
    	               set tartist to (get artist of the current track)
    	               set tid to (get id of the current track)
    	               set pos to player position
    	               return { name: tname, duration: tdur, artist:tartist, id: tid, position:pos }
    	             end if
    	           end tell`)
      .then((rtn) => {
        document.getElementById('name')[text] = rtn.name
        document.getElementById('artist')[text] = rtn.artist
        if (!oldID) {
          oldID = rtn.id
          openTimestamp = new Date();
          document.getElementById('time')[text] = (Math.floor((rtn.duration / 60)) + 'm').toString()
        }
        if (oldID !== rtn.id) {
          oldID = rtn.id
          openTimestamp = new Date();
          document.getElementById('time')[text] = (Math.floor((rtn.duration / 60)) + 'm').toString()
        }

      })
      .catch((error) => {
        console.log('error:', error);
      });
  }

  document.getElementById('service')[text] = "Apple Music"
  setInterval(() => {
    setApple();
  }, 1000);
}
