if (require('../config.json').serviceConfig.whichService == 'google') {
  var fileLocation
  const oss = require('os');
  const fs = require('fs');
  if (oss.type() == 'Darwin') {
  fileLocation = oss.homedir() + "/Library/Application Support/Google Play Music Desktop Player/json_store/playback.json"
} else if (oss.type() == 'Linux') {
  fileLocation = oss.homedir() + "/.config/Google Play Music Desktop Player/json_store/playback.json"
  } else {
  fileLocation = oss.homedir() + "/AppData/Roaming/Google Play Music Desktop Player/json_store/playback.json"
  }
  const {
    webFrame
  } = require('electron');
  const parse = require('parse-duration')
  const moment = require('moment')
  const os = require('os');
  if (os.type() !== 'Darwin') {
    document.body.style.backgroundColor = '#4C4C4C'
  }

  webFrame.setZoomLevelLimits(1, 1);

  var text = "textContent" in document.body ? "textContent" : "innerText";
  var oldID
  var openTimestamp

  async function setGoogle() {
    var content = fs.readFileSync(fileLocation);
    var musicContent = JSON.parse(content);
    if (musicContent.song.albumArt) {
      document.getElementById('artwork').src = musicContent.song.albumArt
      if (document.getElementById('artwork').src) {
        document.getElementById('hide').style.display = 'none'
      }
    }
        if (musicContent.song.title) {
          document.getElementById('name')[text] = musicContent.song.title
        } else {
          document.getElementById('name')[text] = "No Song Found"
        }
        if (musicContent.song.artist) {
          document.getElementById('artist')[text] = musicContent.song.artist
        } else {
          document.getElementById('artist')[text] = "No Artist Found"
        }
        if (!oldID) {
          oldID = musicContent.song
          openTimestamp = new Date();
          document.getElementById('time')[text] = (Math.floor((musicContent.time.total / 60)) + 'm').toString()
        }
        if (oldID !== musicContent.song) {
          oldID = musicContent.song
          openTimestamp = new Date();
          document.getElementById('time')[text] = (Math.floor((musicContent.time.total / 60)) + 'm').toString()
        }



  }

  //document.getElementById('service')[text] = "Apple Music"
  setInterval(() => {
    setGoogle();
  }, 1000);
}
