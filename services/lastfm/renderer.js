if (require('../config.json').serviceConfig.whichService == 'lastfm') {
  const events = require('events');
  const fm = require('lastfm').LastFmNode;
  if(!config.musicConfig.lastFM.username) { console.log("Please ensure you have set your 'username', 'key', and 'secret' in 'config.json' to use EasyRPC + lastFM."); process.exit(0); }
  const lastFm = new fm({ api_key: config.musicConfig.lastFM.key, secret: config.musicConfig.lastFM.secret, useragent: 'EasyRPC' });
  var songEmitter = new events.EventEmitter()

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

  var trackStream = lastFm.stream(config.musicConfig.lastFM.username);

  trackStream.on('nowPlaying', song => {
    if (!rpc || !mainWindow)
      return;

      if (song.image["#text"]) {
        document.getElementById('artwork').src = song.image["#text"]
        if (document.getElementById('artwork').src) {
          document.getElementById('hide').style.display = 'none'
        }
      }

      document.getElementById('name')[text] = song.name
      document.getElementById('artist')[text] = song.artist["#text"]

    var activity = {
      largeImageKey: 'lastfm',
      largeImageText: 'lastFM',
      details: song.name,
      state: song.artist["#text"],
      instance: false
    }

    rpc.setActivity(activity)

    console.log(song)
  });

  trackStream.start();
}
