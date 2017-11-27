/* eslint-disable no-console */

const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');
const DiscordRPC = require('discord-rpc');
const config = require('../config.json');
const large = config.imageKeys.large
const small = config.imageKeys.small
const fs = require('fs');

const ClientId = config.clientID;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    /*w340,h380*/
    width: 410,
    height: 520,
    resizable: false,
    titleBarStyle: 'hiddenInset',
    vibrancy: 'medium-light',
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

const rpc = new DiscordRPC.Client({ transport: 'ipc' });
const startTimestamp = new Date();

async function setActivity() {
  if (!rpc || !mainWindow)
    return;

  var boops = await mainWindow.webContents.executeJavaScript('window.boops');
  var one = await mainWindow.webContents.executeJavaScript('var text = "textContent" in document.body ? "textContent" : "innerText";document.getElementById("one")[text];')
  var two = await mainWindow.webContents.executeJavaScript('var text = "textContent" in document.body ? "textContent" : "innerText";document.getElementById("two")[text];')
  var three = await mainWindow.webContents.executeJavaScript('var text = "textContent" in document.body ? "textContent" : "innerText";document.getElementById("three")[text];')
  var four = await mainWindow.webContents.executeJavaScript('var text = "textContent" in document.body ? "textContent" : "innerText";document.getElementById("four")[text];')

  if (small !== 'none') {
  rpc.setActivity({
    details: two,
    state: three,
    /*startTimestamp,*/
    largeImageKey: large,
    largeImageText: one,
    smallImageKey: small,
    smallImageText: four,
    instance: false,
  });
  } else {
  rpc.setActivity({
    details: two,
    state: three,
    /*startTimestamp,*/
    largeImageKey: large,
    largeImageText: one,
    instance: false,
  });
  }
}

rpc.on('ready', () => {
  setActivity();

  // activity can only be set every 15 seconds
  setInterval(() => {
    setActivity();
  }, 15e3);
});

rpc.login(ClientId).catch(console.error);
