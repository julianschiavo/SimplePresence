/* eslint-disable no-console */

const {
  app,
  BrowserWindow
} = require('electron');
const path = require('path');
const url = require('url');
const DiscordRPC = require('discord-rpc');
const config = require('../config.json');
const fs = require('fs');
const applescript = require('osascript-promise')
const parse = require('parse-duration')
const moment = require('moment')

const ClientId = "327592981580349440";

let mainWindow;

function createWindow() {
  var width = 600 //320
  var height = 330 //500
  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    resizable: false,
    titleBarStyle: 'hidden',
    vibrancy: 'light',
    hasShadow: false,
    frame: false,
    show: false
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

DiscordRPC.register(ClientId);

const rpc = new DiscordRPC.Client({
  transport: 'ipc'
});

var oldID

async function setActivity() {
  if (!rpc || !mainWindow)
    return;

  var activity = {
    largeImageKey: 'music',
    largeImageText: 'Apple Music',
    instance: false
  }

  if (!openTimestamp) {
    var openTimestamp = new Date();
  }

    activity.startTimestamp = moment(openTimestamp).add(parse('0s'), 'ms').toDate();
    applescript(`tell application "iTunes"	if player state is playing or player state is paused then		set tname to (get name of the current track)
                set tdur to (get duration of the current track)
set tartist to (get artist of the current track)
set tid to (get id of the current track)
set pos to player position		return { name: tname, duration: tdur, artist:tartist, id: tid, position:pos }	end ifend tell`)
          .then((rtn) => {
            activity.details = rtn.name
            activity.state = rtn.artist
            activity.endTimestamp = moment(openTimestamp).add(rtn.duration, 's').toDate();
            if (!oldID) {
            oldID = rtn.id
     console.log('Set initial ID successfully.');
rpc.setActivity(activity);
            }
            if (oldID !== rtn.id) {
           oldID = rtn.id
            console.log('New song detected, updating Rich Presence.')
            rpc.setActivity(activity);
            }
})
          .catch((error) => {
            console.log('error:', error);
          });
}

rpc.on('ready', () => {
  setActivity();

  /*setInterval(() => {
    setActivity();
  }, 15e3);*/

  setInterval(() => {
    setActivity();
  }, 1000);
});

rpc.login(ClientId).catch(console.error);