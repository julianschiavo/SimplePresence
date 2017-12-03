/* eslint-disable no-console */
const config = require('../../config.json');
if (config.serviceConfig.whichService == 'google') {
  var fileLocation
  const os = require('os');
  const fs = require('fs');
  if (os.type() == 'Darwin') {
    fileLocation = os.homedir() + "/Library/Application Support/Google Play Music Desktop Player/json_store/playback.json"
  } else if (os.type() == 'Linux') {
    fileLocation = os.homedir() + "/.config/Google Play Music Desktop Player/json_store/playback.json"
  } else {
    fileLocation = os.homedir() + "/AppData/Roaming/Google Play Music Desktop Player/json_store/playback.json"
  }

  process.on('unhandledRejection', (err) => {
    console.error(err);
  });

  const open = require("open");
  const path = require('path');
  const url = require('url');
  const DiscordRPC = require('discord-rpc');
  const parse = require('parse-duration')
  const moment = require('moment')

  var ClientId
  if (config.serviceConfig.customClientID == 'none') {
    ClientId = "327592981580349440";
  } else {
    ClientId = config.serviceConfig.customClientID
  }

  let mainWindow;
  if (config.serviceConfig.useUserInterface == true) {
  const {
    app,
    BrowserWindow
  } = require('electron');
  function createWindow() {
    var width = 600 //320
    var height = 430 //500
    mainWindow = new BrowserWindow({
      width: width,
      height: height,
      resizable: false,
      titleBarStyle: 'customButtonsOnHover',
      vibrancy: 'ultra-dark',
      hasShadow: false,
      radii: [5,5,5,5],
      show: false,
      frame: false,
      fullscreen: false
    });

    mainWindow.on('ready-to-show', () => {
      mainWindow.show()
    })

    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, '/../index.html'),
      protocol: 'file:',
      slashes: true,
    }));

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  }

  app.on('ready', createWindow);

  app.on('window-all-closed', () => {
    app.quit();
  });

  app.on('activate', () => {
    if (mainWindow === null)
      createWindow();
  });
}

  DiscordRPC.register(ClientId);

  const rpc = new DiscordRPC.Client({
    transport: 'ipc'
  });

  var oldID
  var oldTot
  var oldState = false

  async function setActivity() {
    if (!rpc || (config.serviceConfig.useUserInterface == true && !mainWindow))
      return;

    var activity = {
      largeImageKey: 'googleplay',
      largeImageText: 'Google Play Music',
      instance: false
    }

    if (!time) {
      var time = new Date();
    }

    //activity.startTimestamp = moment(openTimestamp).add(parse('0s'), 'ms').toDate();
    var content = fs.readFileSync(fileLocation);
    var musicContent = JSON.parse(content);
    //activity.startTimestamp = moment(time).add('-' + rtn.position, 's').toDate();
    //activity.endTimestamp = moment(time).add(rtn.duration, 's').toDate();
    //activity.spectateSecret = "https://apple.com/music"
    if (config.serviceConfig.useTimestamps == true) {
    if (musicContent.time.current) {
      activity.startTimestamp = moment(time).subtract(musicContent.time.current, 'ms').toDate()
      if (musicContent.time.total) {
        activity.endTimestamp = moment(time).add(musicContent.time.total - musicContent.time.current, 'ms').toDate()
      }
    } else if ((oldID !== musicContent.song.albumArt || !oldID) && musicContent.time.total) {
      activity.startTimestamp = moment(time).subtract('0', 's').toDate()
      activity.endTimestamp = moment(time).add(musicContent.time.total - 0, 'ms').toDate()
    }
  }
    var tP = ''
    if (config.serviceConfig.titlePrefix) {
      tP = config.serviceConfig.titlePrefix + ' '//.charAt(0);
    }
    var aP = ''
    if (config.serviceConfig.artistPrefix) {
       aP = config.serviceConfig.artistPrefix + ' '//.charAt(0);
    }
    if (musicContent.song.title !== null) {
      activity.details = tP + musicContent.song.title
    } else {
      activity.details = "No Song"
    }
    if (musicContent.song.artist !== null) {
      activity.state = aP + musicContent.song.artist
    } else {
      activity.state = "No Artist"
    }

  if (musicContent.playing == true) {
    activity.smallImageKey = undefined
    activity.smallImageText = undefined
    if (musicContent.rating.liked == false) {
      activity.smallImageKey = undefined
      activity.smallImageText = undefined
    } else {
      activity.smallImageKey = 'icon-heart'
      activity.smallImageText = 'Loved'
    }
  } else {
    activity.smallImageKey = 'icon-pause'
    activity.smallImageText = 'Paused'
    //if (musicContent.time.current && musicContent.time.total) {
      //activity.endTimestamp = moment(time).add('0', 'ms').toDate();
      //activity.startTimestamp = moment(time).add('-' + musicContent.time.current, 'ms').toDate();
    //} else {
      activity.startTimestamp = undefined
      activity.endTimestamp = undefined
    //}
  }


  if (!oldID) {
    oldID = musicContent.song.albumArt
    oldTot = musicContent.time.total
    oldState = musicContent.playing
    console.log(`[${new Date().toLocaleTimeString()}]: Initialised Successfully.`);
    rpc.setActivity(activity);
  }
  if (oldID !== musicContent.song.albumArt || oldTot !== musicContent.time.total || oldState !== musicContent.playing) {
    oldID = musicContent.song.albumArt
    oldTot = musicContent.time.total
    oldState = musicContent.playing
    console.log(`[${new Date().toLocaleTimeString()}]: Status Change Detected, updating Rich Presence.`)
    rpc.setActivity(activity);
  }
}


rpc.on('ready', () => {
  setActivity();
  setInterval(() => {
    setActivity();
  }, 1000);
});

rpc.login(ClientId).catch(console.error);

} else {
  console.log("Please set 'whichService' to 'google' in 'config.json' to use SimplePresence + Google Play Music.");
  process.exit(0);
}
