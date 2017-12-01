if (require('../config.json').serviceConfig.whichService == 'spotify') {
  const {
    webFrame
  } = require('electron');
  const nodeSpotifyWebhelper = require('node-spotify-webhelper')
  const spotify = new nodeSpotifyWebhelper.SpotifyWebHelper()
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

  async function setSpotify() {
    spotify.getStatus(function(err, res) {
      if (err) return console.error(err);
      if (res.track.track_resource && res.track.track_resource.name) {
        document.getElementById('name')[text] = res.track.track_resource.name
        document.getElementById('artist')[text] = res.track.artist_resource.name
        if (!oldID) {
          oldID = res.track
          openTimestamp = new Date();
          document.getElementById('time')[text] = (Math.floor((res.track.length / 60)) + 'm').toString()
        }
        if (oldID !== res.track) {
          oldID = res.track
          openTimestamp = new Date();
          document.getElementById('time')[text] = (Math.floor((res.track.length / 60)) + 'm').toString()
        }
      }
    })
  }

  //document.getElementById('service')[text] = "Spotify"
  setInterval(() => {
    setSpotify();
  }, 1000);
}
