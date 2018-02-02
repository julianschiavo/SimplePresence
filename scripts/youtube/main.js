/* eslint-disable no-console */
const config = require('../../config.json');

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
  ClientId = "325545800400764938";
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

DiscordRPC.register(ClientId);

const rpc = new DiscordRPC.Client({
  transport: 'ipc'
});

var oldID
var coldID

async function setActivity() {
  if (!rpc || (config.serviceConfig.useUserInterface == true && !mainWindow))
    return;

  var activity = {
    largeImageKey: 'youtube',
    largeImageText: 'YouTube',
    instance: false
  }

  if (!time) {
    var time = new Date();
  }

  //activity.startTimestamp = moment(openTimestamp).add(parse('0s'), 'ms').toDate();
  if (config.serviceConfig.YouTube.browser == 'safari') {
    applescript(`set ok to "hi"
    tell application "Safari"
  	repeat with t in tabs of windows
  		tell t
  			if URL starts with "http://www.youtube.com/watch" or URL starts with "https://www.youtube.com/watch" then
  				set ok to do JavaScript "var text = 'textContent' in document.body ? 'textContent' : 'innerText';
  var ytname = document.querySelector('#container > h1')[text]
  var ytowner = document.querySelector('#owner-name > a')[text]
  var currentTime = document.querySelector('#movie_player > div.ytp-chrome-bottom > div.ytp-chrome-controls > div.ytp-left-controls > div > span.ytp-time-current')[text]
  var totalTime = document.querySelector('#movie_player > div.ytp-chrome-bottom > div.ytp-chrome-controls > div.ytp-left-controls > div > span.ytp-time-duration')[text]
  var playy = 'playing'
  if (document.querySelector('#movie_player > div.ytp-chrome-bottom > div.ytp-chrome-controls > div.ytp-left-controls > button').getAttribute('aria-label') == 'Play') {
    playy = 'paused'
  }
  ok = { 'tname':ytname,'artist':ytowner,'state':playy,'nowT':currentTime,'fullT':totalTime }"
  				exit repeat
  			end if
  		end tell
  	end repeat
  end tell
  return ok`)
      .then((rtn) => {
        //activity.startTimestamp = moment(time).add('-' + rtn.position, 's').toDate();
        //activity.endTimestamp = moment(time).add(rtn.duration, 's').toDate();
        //activity.spectateSecret = "https://apple.com/music"
        var tP = ''
        if (config.serviceConfig.titlePrefix) {
          tP = config.serviceConfig.titlePrefix + ' ' //.charAt(0);
        }
        var aP = ''
        if (config.serviceConfig.artistPrefix) {
          aP = config.serviceConfig.artistPrefix + ' ' //.charAt(0);
        }
        if (rtn.tname.indexOf(' - ') > -1 || rtn.tname.indexOf('Official Video') > -1 || rtn.tname.indexOf('[Official]') > -1) {
          activity.details = tP + rtn.tname.split(' - ')[1].split(' (Official')[0].split(' ft. ')[0].split(' (from')[0].split(' (Lyrics')[0].split(' (Audio')[0].split(' [Official')[0].split(' (feat.')[0].split(' (OFFICIAL')[0].split(' [OFFICIAL')[0].split(' (ft.')[0]
          activity.state = tP + rtn.tname.split(' - ')[0]
        } else {
          if (rtn.tname) {
            activity.details = tP + rtn.tname
          } else {
            activity.details = "No Title"
          }
          if (rtn.artist) {
            activity.state = aP + rtn.artist
          } else {
            activity.state = "No Uploader"
          }
        }
        if (config.serviceConfig.useTimestamps == true) {
          var currentTime = rtn.nowT.split(':');
          var totalTime = rtn.fullT.split(':');
          var currentTimeS = (+currentTime[0]) * 60 + (+currentTime[1]);
          var totalTimeS = (+totalTime[0]) * 60 + (+totalTime[1]);
          if (currentTimeS) {
            activity.startTimestamp = moment(time).subtract(currentTimeS, 's').toDate()
            if (totalTimeS) {
              activity.endTimestamp = moment(time).add(totalTimeS - currentTimeS, 's').toDate()
            }
          }
        }
        if (rtn.state == 'playing') {
          activity.smallImageKey = undefined
          activity.smallImageText = undefined
        } else {
          activity.smallImageKey = 'icon-pause'
          activity.smallImageText = 'Paused'
          activity.startTimestamp = undefined
          activity.endTimestamp = undefined
          /*activity.endTimestamp = moment(time).add('0', 's').toDate();
          activity.startTimestamp = moment(time).add('-' + rtn.position, 's').toDate();*/
        }

        if (!oldID) {
          oldID = rtn.tname
          oldState = rtn.state
          console.log(`[${new Date().toLocaleTimeString()}]: Initialised Successfully.`);
          rpc.setActivity(activity);
        }
        if (oldID !== rtn.tname || oldState !== rtn.state) {
          oldID = rtn.tname
          oldState = rtn.state
          console.log(`[${new Date().toLocaleTimeString()}]: Status Change Detected, updating Rich Presence.`)
          rpc.setActivity(activity);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  } else if (config.serviceConfig.YouTube.browser == 'chrome') {
    applescript(`set rtnn to "ok"
    tell application "Google Chrome"
	repeat with t in tabs of windows
		tell t
			if URL starts with "http://www.youtube.com/watch?v=" or URL starts with "https://www.youtube.com/watch?v=" then
				set rtnn to execute JavaScript "var text = 'textContent' in document.body ? 'textContent' : 'innerText';
var ytname = document.querySelector('#container > h1')[text]
var ytowner = document.querySelector('#owner-name > a')[text]
var currentTime = document.querySelector('#movie_player > div.ytp-chrome-bottom > div.ytp-chrome-controls > div.ytp-left-controls > div > span.ytp-time-current')[text]
var totalTime = document.querySelector('#movie_player > div.ytp-chrome-bottom > div.ytp-chrome-controls > div.ytp-left-controls > div > span.ytp-time-duration')[text]
var playy = 'playing'
if (document.querySelector('#movie_player > div.ytp-chrome-bottom > div.ytp-chrome-controls > div.ytp-left-controls > button').getAttribute('aria-label') == 'Play') {
  playy = 'paused'
}
ok = { 'yttitle':ytname,'artist':ytowner,'state':playy,'nowT':currentTime,'fullT':totalTime }"
				exit repeat
			end if
		end tell
	end repeat
end tell
return rtnn`).then((rtn) => {
        /*activity.startTimestamp = moment(time).add('-' + rtn.position, 's').toDate();
        activity.endTimestamp = moment(time).add(rtn.duration, 's').toDate();
        activity.spectateSecret = "https://apple.com/music"*/
        var tP = ''
        if (config.serviceConfig.titlePrefix) {
          tP = config.serviceConfig.titlePrefix + ' ' //.charAt(0);
        }
        var aP = ''
        if (config.serviceConfig.artistPrefix) {
          aP = config.serviceConfig.artistPrefix + ' ' //.charAt(0);
        }

        if (rtn.yttitle.indexOf(' - ') > -1 || rtn.yttitle.indexOf('Official Video') > -1 || rtn.yttitle.indexOf('[Official]') > -1) {
          activity.details = tP + rtn.yttitle.split(' - ')[1].split(' (Official')[0].split(' ft. ')[0].split(' (from')[0].split(' (Lyrics')[0].split(' (Audio')[0].split(' [Official')[0].split(' (feat.')[0].split(' (OFFICIAL')[0].split(' [OFFICIAL')[0].split(' (ft.')[0]
          activity.state = tP + rtn.yttitle.split(' - ')[0]
        } else {
          if (rtn.yttitle) {
            activity.details = tP + rtn.yttitle
          } else {
            activity.details = "No Title"
          }
          if (rtn.artist) {
            activity.state = aP + rtn.artist
          } else {
            activity.state = "No Uploader"
          }
        }
        if (config.serviceConfig.useTimestamps == true) {
          var currentTime = rtn.nowT.split(':');
          var totalTime = rtn.fullT.split(':');
          var currentTimeS = (+currentTime[0]) * 60 + (+currentTime[1]);
          var totalTimeS = (+totalTime[0]) * 60 + (+totalTime[1]);
          if (currentTimeS) {
            activity.startTimestamp = moment(time).subtract(currentTimeS, 's').toDate()
            if (totalTimeS) {
              activity.endTimestamp = moment(time).add(totalTimeS - currentTimeS, 's').toDate()
            }
          }
        }
        if (rtn.state == 'playing') {
          activity.smallImageKey = undefined
          activity.smallImageText = undefined
        } else {
          activity.smallImageKey = 'icon-pause'
          activity.smallImageText = 'Paused'
          activity.startTimestamp = undefined
          activity.endTimestamp = undefined
          /*activity.endTimestamp = moment(time).add('0', 's').toDate();
          activity.startTimestamp = moment(time).add('-' + rtn.position, 's').toDate();*/
        }

        if (!oldID) {
          oldID = rtn.yttitle
          oldState = rtn.state
          console.log(`[${new Date().toLocaleTimeString()}]: Initialised Successfully.`);
          rpc.setActivity(activity);
        }
        if (oldID !== rtn.yttitle || oldState !== rtn.state) {
          oldID = rtn.yttitle
          oldState = rtn.state
          console.log(`[${new Date().toLocaleTimeString()}]: Status Change Detected, updating Rich Presence.`)
          rpc.setActivity(activity);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
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
