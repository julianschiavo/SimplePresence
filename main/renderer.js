const {
  webFrame
} = require('electron');
const {
  remote
} = require('electron')
const mainProcess = remote.require('./main.js');
const os = require('os');
if (os.type() !== 'Darwin') {
  document.body.style.backgroundColor = '#4C4C4C'
}

webFrame.setZoomLevelLimits(1, 1);

const config = require('../config.json')
console.log(config.textConfig.details)
console.log(config.textConfig.state)
console.log(config.imageConfig.smallText)
var text = "textContent" in document.body ? "textContent" : "innerText";
document.getElementById('details')[text] = config.textConfig.details
document.getElementById('state')[text] = config.textConfig.state
document.getElementById('stext')[text] = config.imageConfig.smallText
document.getElementById('ltext')[text] = config.imageConfig.largeText
document.getElementById('skey')[text] = config.imageConfig.smallKey
document.getElementById('lkey')[text] = config.imageConfig.largeKey
if (config.imageConfig.showButton == false) {
  document.getElementById('button').style.display = 'none'
}
if (config.timeConfig.timeType !== 'none') {
document.getElementById('time')[text] = config.timeConfig.whatTime
} else {
document.getElementById('divtime').style.display = 'none'
}

function upload() {
  var open = require("open");
  open('https://canary.discordapp.com/developers/applications/me/' + config.clientID.toString());
}