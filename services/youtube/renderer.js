if (require('../config.json').serviceConfig.whichService == 'youtube') {
  const {
    webFrame
  } = require('electron');
  const applescript = require('osascript-promise');
  const parse = require('parse-duration')
  const moment = require('moment')
  const os = require('os');
  if (os.type() !== 'Darwin') {
    document.body.style.backgroundColor = '#4C4C4C'
  }

  webFrame.setZoomLevelLimits(1, 1);

  var text = "textContent" in document.body ? "textContent" : "innerText";

  document.getElementById('nameh').style.display = 'none'
  document.getElementById('name').style.display = 'none'
  document.getElementById('artisth').style.display = 'none'
  document.getElementById('artist').style.display = 'none'
  document.getElementById('timeh').style.display = 'none'
  document.getElementById('time').style.display = 'none'
  document.getElementById('yt').style.display = 'block'
}
