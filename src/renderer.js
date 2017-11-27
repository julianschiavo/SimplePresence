const { webFrame } = require('electron');
const snek = document.getElementById('snek');
const counter = document.getElementById('boops');

webFrame.setZoomLevelLimits(1, 1);

window.boops = 0;
function boop() {
  window.boops++;
  counter.innerHTML = `${window.boops} BOOPS`;
}

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