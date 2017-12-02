/* eslint-disable no-console */
const config = require('../../config.json');
if (config.serviceConfig.whichService == 'imdb') {
  var imdb = require('imdb');
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
    var height = 530 //500
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

  var oldID

  async function setActivity() {
    if (!rpc || (config.serviceConfig.useUserInterface == true && !mainWindow))
      return;

    var activity = {
      largeImageKey: 'imdb',
      largeImageText: 'IMDb',
      instance: false
    }

    if (!time) {
      var time = new Date();
    }
    var id
    if (config.serviceConfig.useUserInterface == true) {
      id = await mainWindow.webContents.executeJavaScript('var text = "textContent" in document.body ? "textContent" : "innerText";document.getElementById("id")[text];')
    } else {
      id = config.serviceConfig.imdbDefaultID
    }


    imdb(id, function(err, data) {
      if (err) {
        console.log(err.stack)
      }

      if (data) {
        activity.details = data.title
        activity.state = data.year
        activity.endTimestamp = moment(time).add(parse(data.runtime), 'ms').toDate()
        if (!oldID) {
          oldID = id
          rpc.setActivity(activity)
        }
        if (oldID !== id) {
          oldID = id
          rpc.setActivity(activity);
        }
      }
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

  rpc.login(ClientId).catch(console.error);
} else {
  console.log("Please set 'whichService' to 'imdb' in 'config.json' to use SimplePresence + IMDb.");
  process.exit(0);
}
