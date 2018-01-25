  var fileLocation
  const oss = require('os');
  const fs = require('fs');
  if (require('../config.json').serviceConfig.FooBar2000.txtLocation) {
    fileLocation = config.serviceConfig.FooBar2000.txtLocation
  } else {
    console.log("Please set 'txtLocation' to the location of your playback file in 'config.json' to use SimplePresence + FooBar2000.");
    process.exit(0);
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

  async function setFoobar() {
    //var content = fs.readFileSync(fileLocation);
    var musicContent = fs.readFileSync(fileLocation).toString().split('\n');
    if (musicContent[0] == 'playing' || musicContent[0] == 'paused') {
      if (typeof musicContent[5] == 'string') {
        document.getElementById('artwork').src = null
        if (document.getElementById('artwork').src) {
          document.getElementById('hide').style.display = 'none'
        }
      }
      var tP = ''
      if (require('../../config.json').serviceConfig.titlePrefix) {
        tP = require('../config.json').serviceConfig.titlePrefix + ' ' //.charAt(0);
      }
      var aP = ''
      if (require('../../config.json').serviceConfig.artistPrefix) {
        aP = require('../../config.json').serviceConfig.artistPrefix + ' ' //.charAt(0);
      }
      if (typeof musicContent[2] == 'string') {
        document.getElementById('name')[text] = tP + musicContent[1]
      } else {
        document.getElementById('name')[text] = "No Song Found"
      }
      if (typeof musicContent[2] == 'string') {
        document.getElementById('artist')[text] = aP + musicContent[2]
      } else {
        document.getElementById('artist')[text] = "No Artist Found"
      }
      if (!oldID) {
        oldID = musicContent[5]
        openTimestamp = new Date();
        document.getElementById('time')[text] = (Math.floor((parseInt(musicContent[3], 10) / 1000) / 60) + 'm').toString()
      }
      if (oldID !== musicContent[5]) {
        oldID = musicContent[5]
        openTimestamp = new Date();
        document.getElementById('time')[text] = (Math.floor((parseInt(musicContent[3], 10) / 1000) / 60) + 'm').toString()
      }
    }
  }

  //document.getElementById('service')[text] = "Apple Music"
  setInterval(() => {
    setFoobar();
  }, 1000);
