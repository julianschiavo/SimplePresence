/* eslint-disable no-console */
const config = require('../../config.json');
if (config.serviceConfig.whichService == 'apple') {
  const applescript = require('osascript-promise');

  process.on('unhandledRejection', (err) => {
    console.error(err);
  });

  const open = require("open");
  const os = require('os');
  const path = require('path');
  const url = require('url');
  const DiscordRPC = require('discord-rpc');
  const fs = require('fs');
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
        show: false,
        frame: false,
        fullscreen: false
      });

      mainWindow.titleBarStyle = 'hiddenInset'

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
  var oldState

  async function setActivity() {
    if (!rpc || (config.serviceConfig.useUserInterface == true && !mainWindow))
      return;

    var activity = {
      largeImageKey: 'apple',
      largeImageText: 'Apple Music',
      instance: false
    }

    if (!time) {
      var time = new Date();
    }

    //activity.startTimestamp = moment(openTimestamp).add(parse('0s'), 'ms').toDate();
    applescript(`tell application "iTunes"
if player state is playing or player state is paused then
set tname to current track's name
set tdur to current track's finish
set tartist to current track's artist
set tid to current track's id
set luv to current track's loved
set pos to player position
set stat to player state
return { name: tname, duration: tdur, artist:tartist, id: tid, position:pos, state:stat, loved:luv }
end if
end tell`)
      .then((rtn) => {
        //activity.startTimestamp = moment(time).add('-' + rtn.position, 's').toDate();
        //activity.endTimestamp = moment(time).add(rtn.duration, 's').toDate();
        //activity.spectateSecret = "https://apple.com/music"
        var tP = ''
        if (config.serviceConfig.titlePrefix) {
          tP = config.serviceConfig.titlePrefix + ' '//.charAt(0);
        }
        var aP = ''
        if (config.serviceConfig.artistPrefix) {
           aP = config.serviceConfig.artistPrefix + ' '//.charAt(0);
        }
        if (rtn.name) {
          activity.details = tP + rtn.name
        } else {
          activity.details = "No Song"
        }
        if (rtn.artist) {
          activity.state = aP + rtn.artist
        } else {
          activity.state = "No Artist"
        }
        if (config.serviceConfig.useTimestamps == true) {
          if (rtn.position) {
            activity.startTimestamp = moment(time).subtract(rtn.position, 's').toDate()
            if (rtn.duration) {
              activity.endTimestamp = moment(time).add(rtn.duration - rtn.position, 's').toDate()
            }
          } else if ((oldID !== rtn.id || !oldID) && rtn.duration) {
            activity.startTimestamp = moment(time).subtract('0', 's').toDate()
            activity.endTimestamp = moment(time).add(rtn.duration - 0, 's').toDate()
          }
        }
        if (rtn.state !== 'paused') {
          if (rtn.loved == false) {
            activity.smallImageKey = undefined
            activity.smallImageText = undefined
          } else {
            activity.smallImageKey = 'icon-heart'
            activity.smallImageText = 'Loved'
          }
        } else {
          activity.smallImageKey = 'icon-pause'
          activity.smallImageText = 'Paused'
          activity.startTimestamp = undefined
          activity.endTimestamp = undefined
          //activity.endTimestamp = moment(time).add('0', 's').toDate();
          //activity.startTimestamp = moment(time).add('-' + rtn.position, 's').toDate();
        }

        if (!oldID) {
          oldID = rtn.id
          oldState = rtn.state
          console.log(`[${new Date().toLocaleTimeString()}]: Initialised Successfully.`);
          rpc.setActivity(activity);
        }
        if (oldID !== rtn.id || oldState !== rtn.state) {
          oldID = rtn.id
          oldState = rtn.state
          console.log(`[${new Date().toLocaleTimeString()}]: Status Change Detected, updating Rich Presence.`)
          rpc.setActivity(activity);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  rpc.on('ready', () => {

    rpc.subscribe('ACTIVITY_SPECTATE', ({
      secret
    }) => {
      console.log('Spectating is not currently supported. Sorry!')
    });

    setActivity();
    setInterval(() => {
      setActivity();
    }, 1000);
  });
  setActivity();
  setInterval(() => {
    setActivity();
  }, 1000);
  rpc.login(ClientId).catch(console.error);
} else {
  console.log("Please set 'whichService' to 'apple' in 'config.json' to use SimplePresence + Apple Music.");
  process.exit(0);
}
