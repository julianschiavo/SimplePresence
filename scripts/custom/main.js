/* eslint-disable no-console */

const {
  app,
  BrowserWindow
} = require('electron');
const path = require('path');
const url = require('url');
const DiscordRPC = require('discord-rpc');
const config = require('../../config.json');
const fs = require('fs');
const parse = require('parse-duration')
const moment = require('moment')

if (config.defaultText || config.imageKeys) {
  console.log('ERROR: The config system has been altered since the last update. Please check config.json.example and update your config.\n')
  return app.quit();
}

const clientId = config.clientID;
var openTimestamp
let mainWindow;

function createWindow() {
  var width = 500 //320
  var height = 420 //500
  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    resizable: false,
    titleBarStyle: 'hidden',
    vibrancy: 'dark',
    hasShadow: false,
    frame: false,
    show: false
  });

  if (config.imageConfig.showButton == true) {
    var height = height + 40
    mainWindow.setSize(width, height);
  }

  if (config.timeConfig.timeType !== 'none') {
    var height = height + 60
    mainWindow.setSize(width, height);
  }

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

function getDuration() {

}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (mainWindow === null)
    createWindow();
});

DiscordRPC.register(clientId);

const rpc = new DiscordRPC.Client({
  transport: 'ipc'
});

async function setActivity() {
  if (!rpc || !mainWindow)
    return;

  var ltext = await mainWindow.webContents.executeJavaScript('var text = "textContent" in document.body ? "textContent" : "innerText";document.getElementById("ltext")[text];')
  var details = await mainWindow.webContents.executeJavaScript('var text = "textContent" in document.body ? "textContent" : "innerText";document.getElementById("details")[text];')
  var state = await mainWindow.webContents.executeJavaScript('var text = "textContent" in document.body ? "textContent" : "innerText";document.getElementById("state")[text];')
  var stext = await mainWindow.webContents.executeJavaScript('var text = "textContent" in document.body ? "textContent" : "innerText";document.getElementById("stext")[text];')
  var lkey = await mainWindow.webContents.executeJavaScript('var text = "textContent" in document.body ? "textContent" : "innerText";document.getElementById("lkey")[text];')
  var skey = await mainWindow.webContents.executeJavaScript('var text = "textContent" in document.body ? "textContent" : "innerText";document.getElementById("skey")[text];')

  var activity = {
    details: details,
    state: state,
    largeImageKey: lkey,
    largeImageText: ltext,
    instance: false
  }

  if (skey !== 'none') {
    activity.smallImageKey = skey
    activity.smallImageText = stext
  }

  if (!openTimestamp) {
    openTimestamp = new Date();
  }

  if (config.timeConfig.timeType == 'start') {
    activity.startTimestamp = moment(openTimestamp).add(parse('-' + config.timeConfig.whatTime), 'ms').toDate();
  } else if (config.timeConfig.timeType == 'end') {
    activity.endTimestamp = moment(openTimestamp).add(parse(config.timeConfig.whatTime), 'ms').toDate();
  } else if (config.timeConfig.timeType == 'both') {
    activity.startTimestamp = moment(openTimestamp).add(parse('0s'), 'ms').toDate();
    activity.endTimestamp = moment(openTimestamp).add(parse(config.timeConfig.whatTime), 'ms').toDate();
  }
  rpc.setActivity(activity);
}

rpc.on('ready', () => {
  setActivity();

  setInterval(() => {
    setActivity();
  }, 15e3);
});

rpc.login( {clientId} ).catch(console.error);
