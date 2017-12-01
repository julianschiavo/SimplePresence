/* eslint-disable no-console */
const config = require('../../config.json');
if (config.serviceConfig.whichService == 'spotify') {
  const nodeSpotifyWebhelper = require('node-spotify-webhelper')
  const spotify = new nodeSpotifyWebhelper.SpotifyWebHelper()

  process.on('unhandledRejection', (err) => {
    console.error(err);
  });


  const {
    app,
    BrowserWindow
  } = require('electron');
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

  DiscordRPC.register(ClientId);

  const rpc = new DiscordRPC.Client({
    transport: 'ipc'
  });

  var oldID
  var oldState
  var songName = undefined;

  async function setActivity() {
    if (!rpc || !mainWindow)
      return;

    var activity = {
      largeImageKey: 'spotify',
      largeImageText: 'Spotify',
      instance: false
    }

    if (!time) {
      var time = new Date();
    }

    //activity.startTimestamp = moment(openTimestamp).add(parse('0s'), 'ms').toDate();

    spotify.getStatus(function(err, res) {
      if (err) return console.error(err);
      if (res.track && res.track.track_resource && res.track.track_resource.name) {
        //activity.startTimestamp = new Date(new Date() - (res.playing_position * 1000));
        //activity.startTimestamp = moment(openTimestamp).add(res.playing_position * 100, 's').toDate();
        if (res.track.track_resource.name) {
          activity.details = res.track.track_resource.name
        } else {
          activity.details = "No Song"
        }
        if (res.track.artist_resource.name) {
          activity.state = res.track.artist_resource.name
        } else {
          activity.state = "No Artist"
        }
        if (res.playing_position) {
          activity.startTimestamp = moment(time).subtract(res.playing_position, 's').toDate()
          if (res.track.length) {
            activity.endTimestamp = moment(time).add(res.track.length - res.playing_position, 's').toDate()
          }
        }

        if (res.playing == true) {
          activity.smallImageKey = undefined
          activity.smallImageText = undefined
        } else {
          activity.smallImageKey = 'icon-pause'
          activity.smallImageText = 'Paused'
          activity.startTimestamp = undefined
          activity.endTimestamp = undefined
          //activity.endTimestamp = moment(time).add('0', 's').toDate();
          //activity.startTimestamp = moment(time).add('-' + res.playing_position, 's').toDate();
        }
        if (!oldID) {
          oldID = res.track
          oldState = res.playing
          console.log(`[${new Date().toLocaleTimeString()}]: Initialised Successfully.`);
          rpc.setActivity(activity);
        }
        if (oldID !== res.track || oldState !== res.playing) {
          oldID = res.track
          oldState = res.playing
          rpc.setActivity(activity);
          console.log(`[${new Date().toLocaleTimeString()}]: ${res.track.track_resource.name} - Updating Rich Presence.`);
        }

      }
    })
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

  rpc.login(ClientId).catch(console.error);
} else {
  console.log("Please set 'musicType' to 'whichService' in 'config.json' to use SimplePresence + Spotify.");
  process.exit(0);
}
