if (require('../config.json').serviceConfig.whichService == 'imdb') {
  const {
    webFrame
  } = require('electron');
  var imdb = require('imdb');
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

  async function setIMDB() {
    document.getElementById("id").style.display = "block"
    document.getElementById("idh").style.display = "block"
    var id = document.getElementById("id")[text];

    imdb(id, function(err, data) {
      if (err) {
        console.log(err.stack)
      }

      if (data) {
        document.getElementById('name')[text] = data.title
        document.getElementById('artwork').src = data.poster
        if (document.getElementById('artwork').src) {
          document.getElementById('hide').style.display = 'none'
        }
        document.getElementById('artisth')[text] = "year"
        document.getElementById('artist')[text] = data.year
        if (!oldID) {
          oldID = id
          openTimestamp = new Date();
          document.getElementById('time')[text] = data.runtime.toString()
        }
        if (oldID !== id) {
          oldID = id
          openTimestamp = new Date();
          document.getElementById('time')[text] = data.runtime.toString()
        }
      }
    });
  }

  //document.getElementById('service')[text] = "Spotify"
  setInterval(() => {
    setIMDB();
  }, 1000);
}
