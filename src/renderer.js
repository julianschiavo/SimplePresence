const {
  webFrame
} = require('electron');
const {
  remote
} = require('electron')
const mainProcess = remote.require('./main.js');
const snek = document.getElementById('snek');
const counter = document.getElementById('boops');
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
document.getElementById('two')[text] = config.textConfig.details
document.getElementById('three')[text] = config.textConfig.state
document.getElementById('four')[text] = config.imageConfig.smallText
document.getElementById('one')[text] = config.imageConfig.largeText
document.getElementById('five')[text] = config.imageConfig.smallKey
document.getElementById('six')[text] = config.imageConfig.largeKey
if (config.imageConfig.showButton == false) {
  document.getElementById('button').style.display = 'none'
}
var small = config.imageConfig.smallKey
if (small == 'none') {
  document.getElementById('fou').style.display = "none"; 
  document.getElementById('four').style.display = "none"; 
}

function upload() {
  var open = require("open");
  open('https://canary.discordapp.com/developers/applications/me/' + config.clientID.toString());
}