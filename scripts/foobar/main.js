/* eslint-disable no-console */
const config = require('../../config.json');
var fileLocation
const os = require('os');
const fs = require('fs');
if (config.serviceConfig.FooBar2000.txtLocation) {
  fileLocation = config.serviceConfig.FooBar2000.txtLocation
} else {
  console.log("Please set 'txtLocation' to the location of your playback file in 'config.json' to use SimplePresence + FooBar2000.");
  process.exit(0);
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

var clientId
if (config.serviceConfig.customClientID == 'none') {
  clientId = "327592981580349440";
} else {
  clientId = config.serviceConfig.customClientID
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
      radii: [5, 5, 5, 5],
      show: false,
      frame: false,
      fullscreen: false
    });

    mainWindow.on('ready-to-show', () => {
      mainWindow.show()
    })

    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'index.html'),
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

DiscordRPC.register(clientId);

const rpc = new DiscordRPC.Client({
  transport: 'ipc'
});

var oldID
var oldTot
var oldState = 'stopped';

async function setActivity() {
  if (!rpc || (config.serviceConfig.useUserInterface == true && !mainWindow))
    return;

  var activity = {
    largeImageKey: 'foobar',
    largeImageText: 'FooBar2000',
    instance: false
  }

  if (!time) {
    var time = new Date();
  }

  //activity.startTimestamp = moment(openTimestamp).add(parse('0s'), 'ms').toDate();
  var musicContent = fs.readFileSync(fileLocation).toString().split('\n');
  //activity.startTimestamp = moment(time).add('-' + rtn.position, 's').toDate();
  //activity.endTimestamp = moment(time).add(rtn.duration, 's').toDate();
  //activity.spectateSecret = "https://apple.com/music"
  if (config.serviceConfig.useTimestamps == true) {
    if (typeof musicContent[4] == 'string') {
      activity.startTimestamp = moment(time).subtract(parseInt(musicContent[4], 10), 'ms').toDate()
      if (typeof musicContent[3]) {
        activity.endTimestamp = moment(time).add(parseInt(musicContent[3], 10) - parseInt(musicContent[4], 10), 'ms').toDate()
      }
    } else if ((oldID !== musicContent[5] || !oldID) && parseInt(musicContent[3], 10)) {
      activity.startTimestamp = moment(time).subtract('0', 's').toDate()
      activity.endTimestamp = moment(time).add(parseInt(musicContent[3], 10) - 0, 'ms').toDate()
    }
  }
  var tP = ''
  if (config.serviceConfig.titlePrefix) {
    tP = config.serviceConfig.titlePrefix + ' ' //.charAt(0);
  }
  var aP = ''
  if (config.serviceConfig.artistPrefix) {
    aP = config.serviceConfig.artistPrefix + ' ' //.charAt(0);
  }
  if (typeof musicContent[1] == 'string') {
    activity.details = tP + musicContent[1]
  } else {
    activity.details = "No Song"
  }
  if (typeof musicContent[2] == 'string') {
    activity.state = aP + musicContent[2]
  } else {
    activity.state = "No Artist"
  }

  if (musicContent[0].trim() == new String("playing").valueOf()) {
    activity.smallImageKey = undefined
    activity.smallImageText = undefined
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
    oldID = musicContent[5]
    oldTot = musicContent[3]
    oldState = musicContent[0]
    console.log(`[${new Date().toLocaleTimeString()}]: Initialised Successfully.`);
    //console.log(``)
    rpc.setActivity(activity);
  }
  if (oldID !== musicContent[5] || oldTot !== musicContent[3] || oldState !== musicContent[0]) {
    oldID = musicContent[5]
    oldTot = musicContent[3]
    oldState = musicContent[0]
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

rpc.login({ clientId }).catch(console.error);
