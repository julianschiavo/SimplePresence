/* eslint-disable no-console */
const config = require('../../config.json');
if (config.serviceConfig.whichService == 'lastfm') {
  const events = require('events');
  const fm = require('lastfm').LastFmNode;
  if(!config.serviceConfig.lastFM.username) { console.log("Please ensure you have set your 'username', 'key', and 'secret' in 'config.json' to use EasyRPC + lastFM."); process.exit(0); }
  const lastFm = new fm({ api_key: config.serviceConfig.lastFM.key, secret: config.serviceConfig.lastFM.secret, useragent: 'EasyRPC' });
  var songEmitter = new events.EventEmitter()

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

  var trackStream = lastFm.stream(config.serviceConfig.lastFM.username);

  trackStream.on('nowPlaying', song => {
    if (!rpc || (config.serviceConfig.useUserInterface == true && !mainWindow))
      return;
      var tP = ''
      if (config.serviceConfig.titlePrefix) {
        tP = config.serviceConfig.titlePrefix + ' '//.charAt(0);
      }
      var aP = ''
      if (config.serviceConfig.artistPrefix) {
         aP = config.serviceConfig.artistPrefix + ' '//.charAt(0);
      }
    var activity = {
      largeImageKey: 'lastfm',
      largeImageText: 'lastFM',
      details: tP + song.name,
      state: aP + song.artist["#text"],
      instance: false
    }

    rpc.setActivity(activity)
  });


rpc.on('ready', () => {
  trackStream.start();
});

rpc.login(ClientId).catch(console.error);

} else {
  return console.log("Please set 'whichService' to 'lastfm' in 'config.json' to use SimplePresence + lastFM.");
}
